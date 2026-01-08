import Dexie from 'dexie';

import { ValorDolar } from '../models/ValorDolar';
import { Movimientos } from '../models/Movimientos';
import { Clientes } from '../models/Clientes';

export const db = new Dexie('BODEGUITA');
db.version(1).stores({
    valores_dolar: `++id, valor, create_at, update_at`,
    productos: `++id, &nombre, valor, create_at, update_at`,
    ventas: `++id, total, *productos, create_at, update_at`
});

db.version(2).stores({
    valores_dolar: `++id, valor, create_at, update_at`,
    productos: `++id, &nombre, valor, create_at, update_at, cantidad`
});

db.version(3).stores({
    valores_dolar: `++id, valor, create_at, update_at`,
    productos: `++id, &nombre, valor, create_at, update_at, cantidad, porcentaje_ganancia`
});

db.version(4).stores({
    valores_dolar: `++id, valor, create_at, update_at`,
    productos: `++id, &nombre, valor, create_at, update_at, cantidad, porcentaje_ganancia, costo`
});

db.version(5).stores({
    valores_dolar: `++id, valor, create_at, update_at`,
    productos: `++id, &nombre, valor, create_at, update_at, cantidad, porcentaje_ganancia, costo, porcentaje_iva`
});

db.version(6).stores({
    valores_dolar: `++id, valor, create_at, update_at`,
    productos: `++id, &nombre, valor, create_at, update_at, cantidad, porcentaje_ganancia, costo, porcentaje_iva`,
    movimientos: `++id, producto_id, tipo, cantidad, fecha, referencia, [producto_id+fecha]`
});

db.version(7).stores({
    valores_dolar: `++id, valor, create_at, update_at`,
    productos: `++id, &nombre, valor, create_at, update_at, cantidad, porcentaje_ganancia, costo, porcentaje_iva`,
    movimientos: `++id, producto_id, tipo, cantidad, fecha, referencia, [producto_id+fecha]`
});

db.version(8).stores({
    valores_dolar: `++id, valor, create_at, update_at`,
    productos: `++id, &nombre, valor, create_at, update_at, cantidad, porcentaje_ganancia, costo, porcentaje_iva`,
    ventas: `++id, total, *productos, create_at, update_at, metodo_pago, numero_factura`,
    movimientos: `++id, producto_id, tipo, cantidad, fecha, referencia, [producto_id+fecha]`,
    configuracion: `&key, value`
});

db.version(9).stores({
    valores_dolar: `++id, valor, create_at, update_at`,
    productos: `++id, &nombre, valor, create_at, update_at, cantidad, porcentaje_ganancia, costo, porcentaje_iva`,
    ventas: `++id, total, *productos, create_at, update_at, metodo_pago, numero_factura, cliente_id, estado`,
    movimientos: `++id, producto_id, tipo, cantidad, fecha, referencia, [producto_id+fecha]`,
    configuracion: `&key, value`,
    clientes: `++id, &cedula, nombre, telefono, create_at, update_at`
});

db.version(10).stores({
    valores_dolar: `++id, valor, create_at, update_at`,
    productos: `++id, &nombre, valor, create_at, update_at, cantidad, porcentaje_ganancia, costo, porcentaje_iva`,
    ventas: `++id, total, *productos, create_at, update_at, metodo_pago, numero_factura, cliente_id, estado, monto_pagado`,
    movimientos: `++id, producto_id, tipo, cantidad, fecha, referencia, [producto_id+fecha]`,
    configuracion: `&key, value`,
    clientes: `++id, &cedula, nombre, telefono, create_at, update_at`
});

db.version(11).stores({
    valores_dolar: `++id, valor, create_at, update_at`,
    productos: `++id, &nombre, valor, create_at, update_at, cantidad, porcentaje_ganancia, costo, porcentaje_iva`,
    ventas: `++id, total, *productos, create_at, update_at, metodo_pago, numero_factura, cliente_id, estado, monto_pagado, monto_exento, monto_base, monto_iva, tasa_iva, monto_igtf, tasa_dolar, monto_dolar`,
    movimientos: `++id, producto_id, tipo, cantidad, fecha, referencia, [producto_id+fecha]`,
    configuracion: `&key, value`,
    clientes: `++id, &cedula, nombre, telefono, create_at, update_at`
});

db.open().catch (function (err) {
    console.error('Fallo al abrir la base de datos: ' + (err.stack || err));
});

db.valores_dolar.mapToClass(ValorDolar);
db.movimientos.mapToClass(Movimientos);
db.clientes.mapToClass(Clientes);
