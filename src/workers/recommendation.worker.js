import { db } from '../db/db';

/*
 * CONFIGURACIÓN
 * Días para considerar un producto como "estancado".
 * En producción debería ser mayor (ej. 30).
 * Se mantiene en 0 para facilitar pruebas inmediatas.
 */
const STAGNANT_DAYS = 0; 

// ESTADO GLOBAL DEL WORKER
let coOccurrenceMatrix = {};   // Matriz de co-ocurrencia: { productoA: { productoB: frecuencia, ... } }
let stagnantProducts = [];     // Lista cacheada de productos estancados

console.log("[Worker] Worker initialized");

// Importamos la función de inicialización y la lógica del paquete WASM generado
// Nota: Este archivo se generará tras ejecutar 'npm run build:wasm'
import init, { train_model_wasm } from '../../src-wasm/pkg/bodeguita_recommendations.js';

// Configuración dinámica recibida del hilo principal
let configuredWasmSource = null;

/**
 * Entrena el modelo de recomendaciones usando WebAssembly (Rust) para máxima velocidad.
 */
const trainModel = async () => {
    try {
        if (!configuredWasmSource) {
            throw new Error("WASM source not configured. Worker did not receive INIT message.");
        }

        console.log(`[Worker] Initializing WASM...`);
        // init accepts URL or ArrayBuffer
        await init(configuredWasmSource);

        const ventas = await db.ventas.toArray();
        console.log(`[Worker] Training with ${ventas.length} sales records...`);

        // 2. Aplanar datos para Rust (Flat Arrays)
        // flatProducts: array continuo de IDs [id, id, id...]
        // saleLengths: array con el tamaño de cada venta [2, 5, 3...]
        let flatProducts = [];
        let saleLengths = [];

        ventas.forEach(venta => {
            if (!venta.productos || venta.productos.length < 2) return;
            
            // Extraer solo los IDs
            const ids = venta.productos.map(p => p.id);
            
            flatProducts.push(...ids);
            saleLengths.push(ids.length);
        });

        // Convertir a TypedArrays para paso eficiente a WASM
        const flatProductsInt32 = new Int32Array(flatProducts);
        const saleLengthsInt32 = new Int32Array(saleLengths);

        // 3. Invocar lógica en Rust
        console.time("WASM_Training");
        const jsonResult = train_model_wasm(flatProductsInt32, saleLengthsInt32);
        console.timeEnd("WASM_Training");

        // 4. Parsear resultado
        coOccurrenceMatrix = JSON.parse(jsonResult);
        
        console.log("[Worker] Recommendation model trained (WASM powered)");
    } catch (e) {
        console.error("[Worker] Error training model with WASM:", e);
        console.warn("[Worker] Falling back to JS implementation...");

        try {
            // JS Fallback: Calculate Co-occurrence Matrix directly from sales
            const ventas = await db.ventas.toArray();
            const newMatrix = {};

            ventas.forEach(venta => {
                if (!venta.productos || venta.productos.length < 2) return;
                const ids = venta.productos.map(p => p.id);

                // O(N^2) loop per sale - acceptably fast for small/medium datasets in a Worker
                for (let i = 0; i < ids.length; i++) {
                    const pA = ids[i];
                    if (!newMatrix[pA]) newMatrix[pA] = {};

                    for (let j = 0; j < ids.length; j++) {
                        if (i === j) continue;
                        const pB = ids[j];
                        
                        // Increment frequency
                        newMatrix[pA][pB] = (newMatrix[pA][pB] || 0) + 1;
                    }
                }
            });

            coOccurrenceMatrix = newMatrix;
            console.log("[Worker] Recommendation model trained (JS Fallback)");
        } catch (errFallback) {
             console.error("[Worker] JS Fallback also failed:", errFallback);
        }
    }
};

/**
 * Identifica productos que tienen stock pero no han tenido salidas (ventas) recientes.
 */
const findStagnantProducts = async () => {
    try {
        // Obtener productos con stock positivo
        const allProducts = await db.productos.where('cantidad').above(0).toArray();
        const now = Date.now();
        const cutoffDate = now - (STAGNANT_DAYS * 24 * 60 * 60 * 1000);

        const stagnant = [];
        
        // Verificar historial de movimientos para cada producto
        // Si no hay movimientos de SALIDA en el rango [cutoffDate, now], es estancado.
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
        
        stagnantProducts = stagnant;
        console.log(`[Worker] Found ${stagnantProducts.length} stagnant products`);
    } catch (e) {
        console.error("[Worker] Error finding stagnant products:", e);
    }
};

/**
 * Genera una recomendación para un producto dado.
 * Estrategia de Prioridad:
 * 1. Producto Relacionado Y Estancado (El mejor caso: mueves inventario pegado).
 * 2. Producto Relacionado con Stock (Buen caso: aumentas ticket promedio).
 * 3. Cualquier Producto Estancado (Caso fallback: intentas mover inventario muerto).
 * 
 * @param {number} currentProductId - ID del producto recién agregado al carrito.
 * @param {Array} excludedIds - IDs de productos que ya están en el carrito.
 */
const getRecommendation = async (currentProductId, excludedIds = []) => {
    // Entrenamiento perezoso (lazy) si la matriz está vacía
    if (Object.keys(coOccurrenceMatrix).length === 0) {
        await trainModel();
        await findStagnantProducts();
    }

    const related = coOccurrenceMatrix[currentProductId];
    
    console.log(`[Worker] GetRec for ID: ${currentProductId}`);
    
    // Si no hay relaciones históricas, saltar a lógica de fallback
    if (!related) {
        console.log(`[Worker] No co-occurrence data for product ${currentProductId}`);
        return null; // O pasar directo al fallback si se desea forzar siempre una recomendación
    }
    
    // Ordenar productos relacionados por frecuencia de compra conjunta (mayor a menor)
    const sortedRelatedIds = Object.keys(related)
        .sort((a, b) => related[b] - related[a])
        .map(id => parseInt(id));

    console.log(`[Worker] Top related IDs:`, sortedRelatedIds.slice(0, 5));

    // 1. Obtener detalles de los candidatos top (para verificar stock)
    // Limitamos a 5 para no hacer consultas pesadas innecesarias
    const topCandidatesIds = sortedRelatedIds.slice(0, 5);
    const topCandidates = await db.productos.where('id').anyOf(topCandidatesIds).toArray();

    // 2. Buscar el mejor match según prioridades
    let bestMatch = null;            // Prioridad A
    let fallbackRelatedMatch = null; // Prioridad B

    for (const id of sortedRelatedIds) {
        if (excludedIds.includes(id)) continue; // Ignorar si ya está en el carrito

        const candidate = topCandidates.find(p => p.id === id);
        if (!candidate || candidate.cantidad <= 0) continue; // Debe tener stock

        const isStagnant = stagnantProducts.some(sp => sp.id === id);
        
        if (isStagnant) {
            bestMatch = candidate;
            break; // ¡Encontramos Prioridad A! Detener búsqueda.
        }

        if (!fallbackRelatedMatch) {
            fallbackRelatedMatch = candidate; // Guardar el primero válido como Prioridad B
        }
    }

    // Retorno Prioridad A: Relacionado + Estancado
    if (bestMatch) {
        console.log(`[Worker] Match found (Stagnant & Related): ${bestMatch.nombre} (ID: ${bestMatch.id})`);
        return bestMatch;
    }

    // Retorno Prioridad B: Solo Relacionado (con Stock)
    if (fallbackRelatedMatch) {
        console.log(`[Worker] Match found (Related & In Stock): ${fallbackRelatedMatch.nombre} (ID: ${fallbackRelatedMatch.id})`);
        return fallbackRelatedMatch;
    }

    console.log(`[Worker] No related match found. Trying generic fallback...`);
    
    // Fallback (Prioridad C): Si no hay nada relacionado, sugerir cualquier producto estancado
    // Esto asegura que siempre se muestre ALGUNA sugerencia para intentar mover stock viejo.
    const fallbackMatch = stagnantProducts.find(p => !excludedIds.includes(p.id));
    if (fallbackMatch) {
         console.log(`[Worker] Fallback match found: ${fallbackMatch.nombre} (ID: ${fallbackMatch.id})`);
         return fallbackMatch;
    }

    return null;
};

// MANEJADOR DE MENSAJES (Interfaz con el hilo principal)
self.onmessage = async (e) => {
    const { type, payload, id } = e.data;

    try {
        switch (type) {
            case 'INIT':
                console.log('[Worker] Received INIT config');
                configuredWasmSource = payload.wasmBytes || payload.wasmUrl;
                break;
            case 'TRAIN':
                // Entrena y actualiza estancados
                await trainModel();
                await findStagnantProducts();
                self.postMessage({ type: 'TRAIN_SUCCESS', id });
                break;
            case 'RECOMMEND':
                const result = await getRecommendation(payload.currentProductId, payload.excludedIds);
                self.postMessage({ type: 'RECOMMEND_RESULT', payload: result, id });
                break;
            default:
                console.warn('[Worker] Unknown message type:', type);
        }
    } catch (error) {
        self.postMessage({ type: 'ERROR', payload: error.message, id });
    }
};
