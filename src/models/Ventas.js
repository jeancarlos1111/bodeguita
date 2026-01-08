export class Ventas {
    constructor() {
        // this.id should be undefined for auto-increment
        this.total = 0;
        this.productos = [];
        this.metodo_pago = ''; 
        this.numero_factura = 0;
        this.cliente_id = null;
        this.cliente_nombre = null;
        this.estado = 'PAGADO'; // PAGADO or PENDIENTE
        this.create_at = null;
    }
}