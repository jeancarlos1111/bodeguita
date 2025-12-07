import { movimientosDAO } from '../db/movimientosDAO';
import { productosDAO } from '../db/productosDAO';
import { date } from 'quasar';

export class KardexService {
    static getInstance() {
        return new KardexService();
    }

    /**
     * Calcula la velocidad de ventas (promedio de unidades vendidas por día)
     * basándose en los últimos 30 días de movimientos.
     * @param {number} productoId 
     */
    async calcularVelocidadVentas(productoId) {
        // Rango: Últimos 30 días
        const hoy = new Date();
        const hace30dias = date.subtractFromDate(hoy, { days: 30 });
        
        // Obtener historial completo (ya que DAO filtra por fecha opcionalmente, 
        // pero aquí necesitamos filtrar en lógica o pedirle al DAO un rango)
        // Optimizamos usando el DAO con rango
        const inicio = hace30dias.getTime(); // Timestamp
        const fin = hoy.getTime(); // Timestamp

        // Obtener todos los movimientos y filtrar por este producto y tipo SALIDA
        // Nota: Idealmente el DAO tendría un método query específico, pero
        // por simplicidad iteramos sobre getByProducto o mejoramos el DAO.
        // Asumimos que getByProducto devuelve todo y filtramos en JS.
        const movimientos = await movimientosDAO.getInstance().getByProducto(productoId);
        
        const salidasRecientes = movimientos.filter(m => 
            m.tipo === 'SALIDA' && 
            m.fecha >= inicio && 
            m.fecha <= fin
        );

        if (salidasRecientes.length === 0) return 0;

        const totalUnidadesVendidas = salidasRecientes.reduce((sum, m) => sum + m.cantidad, 0);
        
        // Calcular promedio diario (dividir por 30 es un estándar simple, 
        // o por días transcurridos desde la primera venta si es < 30)
        return totalUnidadesVendidas / 30;
    }

    /**
     * Genera sugerencias de reabastecimiento para todos los productos.
     */
    async generarSugerencias() {
        const productos = await productosDAO.getInstance().get();
        const sugerencias = [];

        for (const producto of productos) {
            const velocidad = await this.calcularVelocidadVentas(producto.id);
            
            // Si no hay ventas, verificar si el stock absoluto es crítico (fallback)
            if (velocidad === 0) {
                if (producto.cantidad <= 3) {
                     sugerencias.push({
                        producto: producto,
                        velocidadDia: '---', 
                        diasRestantes: 0, 
                        mensaje: producto.cantidad === 0 ? '¡Agotado!' : 'Stock Crítico (Sin ventas previas)',
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
                    mensaje: diasRestantes < 1 ? '¡Agotado o por agotarse hoy!' : `Quedan para ${Math.floor(diasRestantes)} días`,
                    prioridad: diasRestantes < 3 ? 'ALTA' : 'MEDIA'
                });
            }
        }

        // Ordenar por prioridad (menor días restantes primero)
        return sugerencias.sort((a, b) => a.diasRestantes - b.diasRestantes);
    }

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
}
