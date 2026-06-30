import Dexie from 'dexie';

import { ValorDolar } from '../models/ValorDolar';
import { Movimientos } from '../models/Movimientos';
import { Clientes } from '../models/Clientes';

export const db = new Dexie('BODEGUITA');

// Consolidamos todas las versiones previas en la versión actual (12)
// Dexie puede actualizar desde cualquier versión previa a esta directamente.
db.version(14).stores({
    valores_dolar: `++id, valor, create_at, update_at`,
    productos: `++id, &nombre, valor, create_at, update_at, cantidad, porcentaje_ganancia, costo, porcentaje_iva, codigo_barras, categoria_id`,
    ventas: `++id, total, *productos, create_at, update_at, metodo_pago, numero_factura, cliente_id, estado, monto_pagado, monto_exento, monto_base, monto_iva, tasa_iva, monto_igtf, tasa_dolar, monto_dolar, observaciones`,
    movimientos: `++id, producto_id, tipo, cantidad, fecha, referencia, [producto_id+fecha]`,
    configuracion: `&key, value`,
    clientes: `++id, &cedula, nombre, telefono, create_at, update_at`,
    categorias: `++id, &nombre`
});

db.open().catch(function (err) {
    console.error('Fallo al abrir la base de datos: ' + (err.stack || err));
});

db.valores_dolar.mapToClass(ValorDolar);
db.movimientos.mapToClass(Movimientos);
db.clientes.mapToClass(Clientes);

/**
 * Exporta todos los datos de las tablas de Dexie a un string JSON.
 */
export async function exportDatabase() {
    const allData = {};
    for (const table of db.tables) {
        allData[table.name] = await table.toArray();
    }
    return JSON.stringify(allData);
}

/**
 * Importa datos desde un string JSON a las tablas de Dexie, sobrescribiendo el contenido actual.
 */
export async function importDatabase(jsonData) {
    const data = JSON.parse(jsonData);
    // Usar una transacción para asegurar integridad
    await db.transaction('rw', db.tables, async () => {
        for (const table of db.tables) {
            if (data[table.name]) {
                await table.clear();
                await table.bulkAdd(data[table.name]);
            }
        }
    });
}
