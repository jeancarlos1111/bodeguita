import { movimientosDAO } from '../db/movimientosDAO';
import { productosDAO } from '../db/productosDAO';
import { date } from 'quasar';

export const KardexService = {

    /**
     * Genera sugerencias de reabastecimiento para todos los productos.
     * Optimizada para realizar consultas en lote (Batch Processing).
     */
    async generarSugerencias() {
        const hoy = new Date();
        const hace30dias = date.subtractFromDate(hoy, { days: 30 });
        const inicio = hace30dias.getTime();
        const fin = hoy.getTime();

        // 1. Obtener todos los productos y TODAS las salidas del periodo en solo 2 queries
        const [productos, todasLasSalidas] = await Promise.all([
            productosDAO.get(),
            movimientosDAO.getSalidasPorFecha(inicio, fin)
        ]);

        // 2. Agrupar salidas por producto_id en memoria (O(n))
        const salidasPorProducto = {};
        todasLasSalidas.forEach(m => {
            if (!salidasPorProducto[m.producto_id]) {
                salidasPorProducto[m.producto_id] = 0;
            }
            salidasPorProducto[m.producto_id] += (m.cantidad || 0);
        });

        const sugerencias = [];

        // 3. Procesar productos
        for (const producto of productos) {
            const totalVendido = salidasPorProducto[producto.id] || 0;
            const velocidad = totalVendido / 30;
            
            // Si no hay ventas, verificar si el stock absoluto es crítico (fallback)
            if (velocidad === 0) {
                if (producto.cantidad <= 3) {
                     sugerencias.push({
                        producto: producto,
                        velocidadDia: '---', 
                        diasRestantes: 0, 
                        mensaje: producto.cantidad === 0 ? '¡Agotado!' : 'Stock Crítico (Sin ventas)',
                        prioridad: 'ALTA'
                    });
                }
                continue;
            }

            // Días restantes = Stock Actual / Velocidad Diaria
            const diasRestantes = producto.cantidad / velocidad;

            // Umbral de alerta: menos de 7 días de inventario
            if (diasRestantes < 7) {
                sugerencias.push({
                    producto: producto,
                    velocidadDia: velocidad.toFixed(2),
                    diasRestantes: Math.floor(diasRestantes),
                    mensaje: diasRestantes < 1 ? '¡Agotado pronto!' : `Quedan para ${Math.floor(diasRestantes)} días`,
                    prioridad: diasRestantes < 3 ? 'ALTA' : 'MEDIA'
                });
            }
        }

        // Ordenar por prioridad (menor días restantes primero)
        return sugerencias.sort((a, b) => a.diasRestantes - b.diasRestantes);
    },

    /**
     * Obtiene estadísticas rápidas para el dashboard
     */
    async getEstadisticasGenerales() {
        const sugerencias = await this.generarSugerencias();
        const productosBajoStock = sugerencias.length;
        const productosCriticos = sugerencias.filter(s => s.diasRestantes < 3).length;

        return {
            productosBajoStock,
            productosCriticos,
            topSugerencias: sugerencias.slice(0, 5) // Top 5 más urgentes
        };
    }
};
