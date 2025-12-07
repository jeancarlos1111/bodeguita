export class Movimientos {
    constructor() {
        this.producto_id = null;
        this.tipo = ''; // ENTRADA, SALIDA, AJUSTE
        this.cantidad = 0;
        this.fecha = null; // Timestamp
        this.referencia = ''; // ID de Venta o Nota
        this.create_at = null;
    }
}
