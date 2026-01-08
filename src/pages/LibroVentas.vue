<template>
    <q-page class="q-pa-md bg-grey-1">
        <div class="row items-center justify-between no-wrap q-mb-md">
            <div class="text-h5 text-primary text-weight-bold col">Libro de Ventas</div>
            <div class="col-auto">
                <q-btn icon="download" label="Exportar CSV" color="positive" @click="exportCSV"
                    :disable="!ventasMensuales.length" outline rounded />
            </div>
        </div>

        <!-- Filter Card -->
        <q-card class="rounded-card shadow-1 q-mb-md bg-white">
            <q-card-section>
                <div class="row q-col-gutter-sm items-center">
                    <div class="col-6 col-md-3">
                        <q-select filled v-model="mes" :options="meses" label="Mes" emit-value map-options
                            @input="cargarLibro" />
                    </div>
                    <div class="col-6 col-md-3">
                        <q-input filled v-model.number="anio" type="number" label="Año" @input="cargarLibro" />
                    </div>
                    <div class="col-12 col-md-6 text-right">
                        <div class="text-h6 text-primary">
                            Total Mes: Bs {{ formatMoney(totalMes) }}
                        </div>
                        <div class="text-caption text-grey">Base: {{ formatMoney(totalBase) }} | IVA: {{
                            formatMoney(totalIVA) }} | IGTF: {{ formatMoney(totalIGTF) }}</div>
                    </div>
                </div>
            </q-card-section>
        </q-card>

        <!-- Table -->
        <q-table :data="ventasMensuales" :columns="columns" row-key="id" class="rounded-card shadow-1"
            :pagination.sync="pagination" no-data-label="No hay registros para este mes">
            <template v-slot:body-cell-fecha="props">
                <q-td :props="props">
                    {{ formatDate(props.row.create_at) }}
                </q-td>
            </template>

            <template v-slot:body-cell-cliente="props">
                <q-td :props="props">
                    <div class="text-weight-bold">{{ props.row.cliente_nombre || 'Cliente Genérico' }}</div>
                    <div class="text-caption text-grey">{{ props.row.cliente_cedula || 'Varios' }}</div>
                </q-td>
            </template>

            <template v-slot:body-cell-factura="props">
                <q-td :props="props">
                    <q-badge color="indigo-1" text-color="primary">
                        {{ String(props.row.numero_factura || '0').padStart(6, '0') }}
                    </q-badge>
                </q-td>
            </template>

            <template v-slot:body-cell-total="props">
                <q-td :props="props" class="text-weight-bold text-primary">
                    {{ formatMoney(props.row.total) }}
                </q-td>
            </template>
        </q-table>

    </q-page>
</template>

<script>
import { date } from 'quasar'
import { ventasDAO } from '../db/ventasDAO'
import { clientesDAO } from '../db/clientesDAO'

export default {
    name: 'LibroVentas',
    data() {
        return {
            mes: new Date().getMonth() + 1,
            anio: new Date().getFullYear(),
            meses: [
                { label: 'Enero', value: 1 }, { label: 'Febrero', value: 2 },
                { label: 'Marzo', value: 3 }, { label: 'Abril', value: 4 },
                { label: 'Mayo', value: 5 }, { label: 'Junio', value: 6 },
                { label: 'Julio', value: 7 }, { label: 'Agosto', value: 8 },
                { label: 'Septiembre', value: 9 }, { label: 'Octubre', value: 10 },
                { label: 'Noviembre', value: 11 }, { label: 'Diciembre', value: 12 }
            ],
            ventasMensuales: [],
            pagination: { rowsPerPage: 20 },
            columns: [
                { name: 'fecha', align: 'left', label: 'Fecha', field: 'create_at', sortable: true },
                { name: 'factura', align: 'center', label: 'Nro Fact', field: 'numero_factura', sortable: true },
                { name: 'cliente', align: 'left', label: 'Cliente (RIF/Nombre)', field: 'cliente_nombre' },
                { name: 'total', align: 'right', label: 'Total Venta', field: 'total', format: val => this.formatMoney(val) },
                { name: 'exento', align: 'right', label: 'Exento', field: 'monto_exento', format: val => this.formatMoney(val) },
                { name: 'base', align: 'right', label: 'Base Imp.', field: 'monto_base', format: val => this.formatMoney(val) },
                { name: 'iva', align: 'right', label: 'IVA (16%)', field: 'monto_iva', format: val => this.formatMoney(val) },
                { name: 'igtf', align: 'right', label: 'IGTF (3%)', field: 'monto_igtf', format: val => this.formatMoney(val) }
            ]
        }
    },
    computed: {
        totalMes() {
            return this.ventasMensuales.reduce((sum, v) => sum + (v.total || 0), 0);
        },
        totalBase() {
            return this.ventasMensuales.reduce((sum, v) => sum + (v.monto_base || 0), 0);
        },
        totalIVA() {
            return this.ventasMensuales.reduce((sum, v) => sum + (v.monto_iva || 0), 0);
        },
        totalIGTF() {
            return this.ventasMensuales.reduce((sum, v) => sum + (v.monto_igtf || 0), 0);
        }
    },
    mounted() {
        this.cargarLibro();
    },
    methods: {
        formatMoney(amount) {
            if (amount === undefined || amount === null) return '0,00';
            return new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
        },
        formatDate(timestamp) {
            return date.formatDate(timestamp, 'DD/MM/YYYY');
        },
        async cargarLibro() {
            this.$q.loading.show();
            try {
                // Construct date range correctly for start/end of selected month
                // We know db stores create_at as "YYYY/MM/DD HH:mm:ss" string (from Index.vue)
                // ventasDAO.get(start, end) uses string comparison.

                const strMonth = String(this.mes).padStart(2, '0');
                const startDate = `${this.anio}/${strMonth}/01`;

                // Find last day of month
                const lastDay = new Date(this.anio, this.mes, 0).getDate();
                const endDate = `${this.anio}/${strMonth}/${lastDay}`;

                const ventas = await ventasDAO.getInstance().get(startDate, endDate);

                // Enrich with client data if needed (some clients might be just ID)
                // But for table display we just need basic info. 
                // Index.vue stores 'cliente_nombre' directly in venta! Excellent.
                // We might want to fetch 'cedula' if not stored. Index.vue doesn't store cedula directly in venta, only ID and Name.

                const enhancedVentas = await Promise.all(ventas.map(async (v) => {
                    let cedula = 'S/C';
                    // Try to find client if ID exists
                    if (v.cliente_id) {
                        const client = await clientesDAO.getInstance().get(v.cliente_id);
                        if (client) cedula = client.cedula;
                    }
                    return {
                        ...v,
                        cliente_cedula: cedula
                    };
                }));

                this.ventasMensuales = enhancedVentas.sort((a, b) => (a.numero_factura || 0) - (b.numero_factura || 0));

            } catch (e) {
                console.error(e);
                this.$q.notify({ type: 'negative', message: 'Error cargando libro' });
            } finally {
                this.$q.loading.hide();
            }
        },
        exportCSV() {
            const headers = ['Fecha', 'Nro Fact', 'Nro Control', 'Nombre Cliente', 'RIF/Cedula', 'Total Venta', 'Monto Exento', 'Base Imponible', 'IVA', 'IGTF'];

            let csvContent = headers.join(';') + '\n';

            this.ventasMensuales.forEach(v => {
                const row = [
                    this.formatDate(v.create_at),
                    String(v.numero_factura).padStart(6, '0'),
                    String(v.numero_factura).padStart(6, '0'), // Control same as Factura for now
                    `"${v.cliente_nombre || 'Cliente Genérico'}"`,
                    v.cliente_cedula || '',
                    Number(v.total || 0).toFixed(2).replace('.', ','),
                    Number(v.monto_exento || 0).toFixed(2).replace('.', ','),
                    Number(v.monto_base || 0).toFixed(2).replace('.', ','),
                    Number(v.monto_iva || 0).toFixed(2).replace('.', ','),
                    Number(v.monto_igtf || 0).toFixed(2).replace('.', ',')
                ];
                csvContent += row.join(';') + '\n';
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `Libro_Ventas_${this.mes}_${this.anio}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}
</script>

<style scoped>
.rounded-card {
    border-radius: 16px;
}
</style>
