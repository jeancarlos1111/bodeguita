import Dexie from 'dexie';

import { ValorDolar } from '../models/ValorDolar';
import { Movimientos } from '../models/Movimientos';

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

db.open().catch (function (err) {
    console.error('Fallo al abrir la base de datos: ' + (err.stack || err));
});

db.valores_dolar.mapToClass(ValorDolar);
db.movimientos.mapToClass(Movimientos);
