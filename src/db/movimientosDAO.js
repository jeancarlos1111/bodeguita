import { db } from './db';

export class movimientosDAO {
    static getInstance() {
        return new movimientosDAO();
    }

    save(movimiento) {
        return db.movimientos.add(movimiento);
    }

    getAll() {
        return db.movimientos.toArray();
    }

    getByProducto(productoId) {
        return db.movimientos.where('producto_id').equals(productoId).toArray();
    }

    getSalidasPorFecha(inicio, fin) {
        // inicio y fin deben ser timestamps o strings ISO fecha
        return db.movimientos
            .where('fecha')
            .between(inicio, fin, true, true)
            .filter(m => m.tipo === 'SALIDA')
            .toArray();
    }
    
    // Para el ML: Obtener movimientos de un producto ordenados por fecha
    getHistorialProducto(productoId) {
        return db.movimientos
            .where('producto_id')
            .equals(productoId)
            .sortBy('fecha');
    }
}
