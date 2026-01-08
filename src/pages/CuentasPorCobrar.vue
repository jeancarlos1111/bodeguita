<template>
    <q-page class="q-pa-md bg-grey-1">
        <div class="row items-center q-mb-md">
            <div class="text-h6 text-primary">Cuentas por Cobrar (Fiado)</div>
            <q-space />
            <div class="text-subtitle1 text-grey-8">
                Total Pendiente: <strong>Bs {{ formatMoney(totalPendiente) }}</strong>
                <span v-if="valor_dolar" class="text-caption q-ml-sm">($ {{ formatMoneyUSD(totalPendiente / valor_dolar)
                }})</span>
            </div>
        </div>

        <q-card class="rounded-card shadow-1">
            <q-table title="Ventas Pendientes" :data="ventasPendientes" :columns="columns" row-key="id" :filter="filter"
                :pagination="pagination">
                <template v-slot:top-right>
                    <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                </template>

                <template v-slot:body-cell-fecha="props">
                    <q-td :props="props">
                        {{ formatDate(props.row.create_at) }}
                    </q-td>
                </template>

                <template v-slot:body-cell-total="props">
                    <q-td :props="props" class="text-weight-bold">
                        Bs {{ formatMoney(props.row.total) }}
                        <div class="text-caption text-grey" v-if="valor_dolar">
                            $ {{ formatMoneyUSD(props.row.total / valor_dolar) }}
                        </div>
                    </q-td>
                </template>

                <template v-slot:body-cell-pagado="props">
                    <q-td :props="props">
                        Bs {{ formatMoney(props.row.monto_pagado) }}
                    </q-td>
                </template>

                <template v-slot:body-cell-restante="props">
                    <q-td :props="props" class="text-weight-bold text-negative">
                        Bs {{ formatMoney(props.row.restante) }}
                        <div class="text-caption text-grey" v-if="valor_dolar">
                            $ {{ formatMoneyUSD(props.row.restante / valor_dolar) }}
                        </div>
                    </q-td>
                </template>

                <template v-slot:body-cell-acciones="props">
                    <q-td :props="props" auto-width>
                        <q-btn flat round color="primary" icon="visibility" @click="verDetalle(props.row)">
                            <q-tooltip>Ver Detalle</q-tooltip>
                        </q-btn>
                        <q-btn flat round color="green" icon="attach_money" @click="abrirDialogoPago(props.row)">
                            <q-tooltip>Registrar Pago</q-tooltip>
                        </q-btn>
                    </q-td>
                </template>
            </q-table>
        </q-card>

        <q-dialog v-model="detalleDialog">
            <q-card style="min-width: 350px">
                <q-card-section>
                    <div class="text-h6">Detalle de Venta #{{ selectedVenta?.numero_factura }}</div>
                    <div class="text-subtitle2">{{ selectedVenta?.cliente_nombre }} - {{
                        formatDate(selectedVenta?.create_at) }}
                    </div>
                </q-card-section>

                <q-card-section>
                    <q-list dense separator>
                        <q-item v-for="(prod, index) in selectedVenta?.productos" :key="index">
                            <q-item-section>
                                <q-item-label>{{ prod.producto }}</q-item-label>
                                <q-item-label caption>Cant: {{ prod.cantidad }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                Bs {{ formatMoney(prod.valor_bs) }}
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="Cerrar" color="primary" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>


        <q-dialog v-model="paymentDialog">
            <q-card style="min-width: 350px">
                <q-card-section class="row items-center">
                    <div class="text-h6">Registrar Pago</div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup />
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <div class="text-subtitle1 q-mb-sm">
                        Deuda Restante: <span class="text-negative text-weight-bold">Bs {{ formatMoney(paymentForm.max)
                            }}</span>
                    </div>

                    <q-input filled v-model="paymentForm.amount" label="Monto a Pagar" type="number" prefix="Bs"
                        autofocus
                        :rules="[val => val > 0 || 'El monto debe ser mayor a 0', val => val <= paymentForm.max || 'Monto excede deuda']" />
                </q-card-section>

                <q-card-actions align="right" class="text-primary">
                    <q-btn flat label="Pagar Totalidad" color="secondary" @click="setPagoCompleto" />
                    <q-btn flat label="Abonar" color="primary" @click="procesarPago" />
                </q-card-actions>
            </q-card>
        </q-dialog>

    </q-page>
</template>

<script>
import { date } from 'quasar';
import { ventasDAO } from '../db/ventasDAO';
import { valor_dolarDAO } from '../db/valor_dolarDAO';
import { db } from '../db/db';

export default {
    name: 'CuentasPorCobrar',
    data() {
        return {
            ventasPendientes: [],
            valor_dolar: null,
            filter: '',
            pagination: {
                rowsPerPage: 10
            },
            columns: [
                { name: 'fecha', align: 'left', label: 'Fecha', field: 'create_at', sortable: true },
                { name: 'cedula', align: 'left', label: 'Cédula', field: 'cliente_cedula', sortable: true },
                { name: 'cliente', align: 'left', label: 'Cliente', field: 'cliente_nombre', sortable: true },
                { name: 'factura', align: 'center', label: 'N° Factura', field: 'numero_factura', sortable: true },
                { name: 'total', align: 'right', label: 'Total', field: 'total', sortable: true },
                { name: 'pagado', align: 'right', label: 'Abonado', field: 'monto_pagado', sortable: true },
                { name: 'restante', align: 'right', label: 'Restante', field: 'restante', sortable: true },
                { name: 'acciones', align: 'center', label: 'Acciones', field: 'acciones' }
            ],
            detalleDialog: false,
            paymentDialog: false,
            selectedVenta: null,
            totalPendiente: 0,
            paymentForm: {
                amount: 0,
                max: 0
            }
        }
    },
    mounted() {
        this.getDolar();
        this.getVentasPendientes();
    },
    methods: {
        formatMoney(amount) {
            return new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);
        },
        formatMoneyUSD(amount) {
            return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);
        },
        formatDate(timeStamp) {
            if (!timeStamp) return '';
            return date.formatDate(timeStamp, 'DD/MM/YYYY hh:mm A');
        },
        getDolar() {
            valor_dolarDAO.getInstance().getUltimo().then(result => { this.valor_dolar = result.valor_dolar });
        },
        async getVentasPendientes() {
            const ventas = await db.ventas
                .where('estado')
                .equals('PENDIENTE')
                .toArray();

            // Enriquecer con datos del cliente
            this.ventasPendientes = await Promise.all(ventas.map(async (venta) => {
                let cliente = {};
                if (venta.cliente_id) {
                    cliente = await db.clientes.get(venta.cliente_id) || {};
                }

                const pagado = venta.monto_pagado || 0;
                const restante = venta.total - pagado;

                // Asegurar que cliente_nombre exista si no viene del join
                const nombreCliente = cliente.nombre || venta.cliente_nombre || 'Cliente Desconocido';
                const cedulaCliente = cliente.cedula || 'S/C';

                return {
                    ...venta,
                    cliente_cedula: cedulaCliente,
                    cliente_nombre: nombreCliente, // Prioridad al nombre en tabla clientes, fallback al de la venta
                    monto_pagado: pagado,
                    restante: restante
                };
            }));

            this.calculateTotal();
        },
        calculateTotal() {
            this.totalPendiente = this.ventasPendientes.reduce((acc, curr) => acc + Number(curr.restante), 0);
        },
        verDetalle(venta) {
            this.selectedVenta = venta;
            this.detalleDialog = true;
        },
        abrirDialogoPago(venta) {
            this.selectedVenta = venta;
            this.paymentForm.amount = 0;
            this.paymentForm.max = venta.restante;
            this.paymentDialog = true;
        },
        setPagoCompleto() {
            this.paymentForm.amount = this.paymentForm.max;
        },
        async procesarPago() {
            const montoAbonar = Number(this.paymentForm.amount);

            if (montoAbonar <= 0) {
                this.$q.notify({ type: 'warning', message: 'El monto debe ser mayor a 0' });
                return;
            }

            if (montoAbonar > this.paymentForm.max) {
                this.$q.notify({ type: 'negative', message: 'El monto excede la deuda restante' });
                return;
            }

            try {
                const nuevoPagado = (this.selectedVenta.monto_pagado || 0) + montoAbonar;
                const nuevoEstado = nuevoPagado >= this.selectedVenta.total ? 'PAGADO' : 'PENDIENTE';

                await db.ventas.update(this.selectedVenta.id, {
                    monto_pagado: nuevoPagado,
                    estado: nuevoEstado,
                    update_at: date.formatDate(Date.now(), 'YYYY/MM/DD HH:mm:ss')
                });

                this.$q.notify({ type: 'positive', message: 'Pago registrado exitosamente' });
                this.paymentDialog = false;
                this.getVentasPendientes();

            } catch (error) {
                console.error(error);
                this.$q.notify({ type: 'negative', message: 'Error al registrar el pago' });
            }
        }
    }
}
</script>

<style scoped>
.rounded-card {
    border-radius: 16px;
}
</style>
