import * as tf from '@tensorflow/tfjs';
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';
import { db } from '../db/db';

const STAGNANT_DAYS = 0; // MODIFICADO PARA PRUEBAS (Normalmente 30)

class RecommendationService {
    constructor() {
        this.modelReady = false;
        this.coOccurrenceMatrix = {};
        this.productIndex = {}; // Maps productId to matrix index
        this.reverseProductIndex = {}; // Maps matrix index to productId
        this.stagnantProducts = [];
    }


    async init() {
        if (this.modelReady) return;

        // Si ya está inicializado (por ejemplo, tras Hot Module Reload), no re-inicializar
        if (tf.getBackend() === 'wasm') {
            console.log('[TF.js] Backend WASM ya estaba activo (HMR).');
            this.modelReady = true;
            return;
        }

        try {
            // Configurar paths para WASM. En Quasar v1, 'src/statics' se sirve en la raíz ('/')
            // Hemos copiado manualmente los archivos .wasm a 'src/statics' para asegurar que se sirvan.
            // Si la app está en /bodeguita/, los archivos están en /bodeguita/
            
            const basePath = process.env.BASE_URL || '/';
            console.log('[TF.js] Setting WASM path to:', basePath);
            setWasmPaths(basePath);
            
            await tf.setBackend('wasm');
            console.log('TF.js backend set to:', tf.getBackend());
            
            this.modelReady = true;
        } catch (error) {
            console.error('Error initializing TF.js:', error);
            // Fallback a CPU sí falla WASM, aunque será lento
            await tf.setBackend('cpu');
        }
    }

    async train() {
        if (!this.modelReady) await this.init();

        try {
            // 1. Cargar datos de Ventas para construir matriz de co-ocurrencia
            const ventas = await db.ventas.toArray();
            
            // Mapear productos e índices
            const allProductIds = new Set();
            ventas.forEach(venta => {
                if (venta.productos && Array.isArray(venta.productos)) {
                    venta.productos.forEach(p => allProductIds.add(p.id));
                }
            });

            this.productIndex = {};
            this.reverseProductIndex = {};
            let idx = 0;
            allProductIds.forEach(id => {
                this.productIndex[id] = idx;
                this.reverseProductIndex[idx] = id;
                idx++;
            });

            // Construir matriz de co-ocurrencia simple
            // count[A][B] = cuántas veces se compraron A y B juntos
            this.coOccurrenceMatrix = {}; 

            ventas.forEach(venta => {
                if (!venta.productos || venta.productos.length < 2) return;
                
                const items = venta.productos;
                for (let i = 0; i < items.length; i++) {
                    for (let j = 0; j < items.length; j++) {
                        if (i === j) continue;
                        
                        const pA = items[i].id;
                        const pB = items[j].id;

                        if (!this.coOccurrenceMatrix[pA]) this.coOccurrenceMatrix[pA] = {};
                        if (!this.coOccurrenceMatrix[pA][pB]) this.coOccurrenceMatrix[pA][pB] = 0;
                        
                        this.coOccurrenceMatrix[pA][pB]++;
                    }
                }
            });
            
            console.log("Recommendation model trained (Co-occurrence)");

        } catch (e) {
            console.error("Error training recommendation model:", e);
        }
    }

    async findStagnantProducts() {
        // Encontrar productos con stock > 0 que no han salido recientemente
        try {
            const allProducts = await db.productos.where('cantidad').above(0).toArray();
            const now = Date.now();
            const cutoffDate = now - (STAGNANT_DAYS * 24 * 60 * 60 * 1000);

            const stagnant = [];

            // Esta parte puede ser pesada si hay muchos movimientos, optimizar si es necesario
            // Una mejor query sería sobre movimientos, pero movimientos puede ser muy grande.
            // Para MVP: Iterar productos y chequear su último movimiento de SALIDA.
            
            for (const prod of allProducts) {
                const lastMove = await db.movimientos
                    .where('[producto_id+fecha]')
                    .between([prod.id, cutoffDate], [prod.id, now])
                    .filter(m => m.tipo === 'SALIDA')
                    .last();

                if (!lastMove) {
                    stagnant.push(prod);
                }
            }
            
            this.stagnantProducts = stagnant;
            console.log(`Found ${stagnant.length} stagnant products`);
        } catch (e) {
            console.error("Error finding stagnant products:", e);
        }
    }

    async getRecommendation(currentProductId, excludedIds = []) {
        if (!this.modelReady) await this.init();
        if (Object.keys(this.coOccurrenceMatrix).length === 0) {
            // Entrenar perezosamente si está vacío
            await this.train();
            await this.findStagnantProducts();
        }

        // Buscar productos relacionados con high score
        const related = this.coOccurrenceMatrix[currentProductId];
        
        console.log(`[TF.js] Buscando recomendaciones para ID: ${currentProductId}`);
        // console.log(`[TF.js] Matriz de Co-ocurrencia para este producto:`, related);
        
        if (!related) {
            console.log("[TF.js] No se encontraron productos relacionados en el historial de ventas.");
            return null;
        }

        // Ordenar relacionados por frecuencia
        const sortedRelatedIds = Object.keys(related)
            .sort((a, b) => related[b] - related[a])
            .map(id => parseInt(id));

        // Intersección: Relacionados AND Estancados AND No Excluidos
        // Priorizar el más relacionado que también esté estancado y NO esté ya en el carrito
        const bestMatch = sortedRelatedIds.find(relatedId => 
            this.stagnantProducts.some(sp => sp.id === relatedId) && 
            !excludedIds.includes(relatedId)
        );

        if (bestMatch) {
            const match = this.stagnantProducts.find(p => p.id === bestMatch);
            console.log(`[TF.js] Recomendación encontrada: ${match.nombre}`);
            return match;
        }

        console.log("[TF.js] Se encontraron relacionados, pero ninguno está marcado como estancado.");
        
        // Si no hay match directo estancado, podríamos devolver simplemente un estancado aleatorio
        // o el producto más relacionado aunque no esté estancado (depende de la regla de negocio).
        // El requerimiento dice: "sugiera ... producto ... para mover el stock que no se haya movido pero que ... tengan relacion"
        // Si no hay intersección, no sugerimos nada para no ser molestos con recomendaciones irrelevantes.
        
        return null;
    }
}

export const recommendationService = new RecommendationService();
