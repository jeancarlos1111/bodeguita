<template>
    <q-page class="q-pa-md bg-grey-2">
        <div class="text-h5 q-mb-md text-primary text-weight-bold">
            <q-icon name="psychology" size="md" class="q-mr-sm" />Kardex Inteligente
        </div>

        <!-- Smart Suggestions Dashboard -->
        <div class="row q-col-gutter-md q-mb-xl">
            <div class="col-12">
                <q-banner rounded class="bg-indigo-1 text-primary shadow-1" v-if="estadisticas.productosBajoStock > 0">
                    <template v-slot:avatar>
                        <q-icon name="add_alert" color="primary" />
                    </template>
                    <div class="text-weight-bold row items-center">
                        Tienes {{ estadisticas.productosBajoStock }} productos sugeridos para reabastecimiento.
                        <q-chip color="negative" text-color="white" size="sm" class="q-ml-sm"
                            v-if="estadisticas.productosCriticos > 0">
                            {{ estadisticas.productosCriticos }} Críticos
                        </q-chip>
                    </div>
                </q-banner>
                <q-banner rounded class="bg-positive text-white shadow-1" v-else>
                    <template v-slot:avatar>
                        <q-icon name="check_circle" color="white" />
                    </template>
                    <div class="text-weight-bold">
                        ¡Tu inventario parece saludable! No hay alertas urgentes.
                    </div>
                </q-banner>
            </div>

            <!-- Suggestion Cards -->
            <div class="col-12 col-md-4" v-for="(sugerencia, index) in estadisticas.topSugerencias" :key="index">
                <q-card class="my-card shadow-2" :class="sugerencia.prioridad === 'ALTA' ? 'bg-red-1' : 'bg-white'">
                    <q-card-section>
                        <div class="row items-center no-wrap">
                            <div class="col">
                                <div class="text-h6">{{ sugerencia.producto.nombre }}</div>
                                <div class="text-subtitle2 text-grey-7">Stock: {{ sugerencia.producto.cantidad }}</div>
                            </div>
                            <div class="col-auto">
                                <q-btn round color="primary" icon="add_shopping_cart" flat dense />
                            </div>
                        </div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                        <div class="text-caption text-weight-bold text-uppercase"
                            :class="sugerencia.prioridad === 'ALTA' ? 'text-negative' : 'text-orange'">
                            {{ sugerencia.mensaje }}
                        </div>
                        <div class="text-caption">
                            Ventas/Día (aprox): {{ sugerencia.velocidadDia }}
                        </div>
                    </q-card-section>
                </q-card>
            </div>
        </div>

        <q-separator class="q-mb-md" />

        <!-- Movement History -->
        <div class="text-h6 q-mb-sm text-grey-8">Movimientos Recientes</div>

        <q-table :data="movimientos" :columns="columns" row-key="id" :filter="filter"
            class="bg-white rounded-card shadow-1" :pagination.sync="pagination"
            no-data-label="No hay movimientos registrados aún">
            <template v-slot:top-right>
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
                    <q-icon slot="append" name="search" />
                </q-input>
            </template>

            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="fecha" :props="props">
                        {{ formatFecha(props.row.fecha) }}
                    </q-td>
                    <q-td key="producto" :props="props">
                        {{ getNombreProducto(props.row.producto_id) }}
                    </q-td>
                    <q-td key="tipo" :props="props">
                        <q-chip dense :color="getColorTipo(props.row.tipo)" text-color="white">
                            {{ props.row.tipo }}
                        </q-chip>
                    </q-td>
                    <q-td key="cantidad" :props="props" class="text-weight-bold">
                        {{ props.row.tipo === 'SALIDA' ? '-' : '+' }}{{ props.row.cantidad }}
                    </q-td>
                    <q-td key="referencia" :props="props" class="text-grey-7">
                        {{ props.row.referencia }}
                    </q-td>
                </q-tr>
            </template>
        </q-table>
    </q-page>
</template>

<script>
import { date } from 'quasar';
import { movimientosDAO } from '../db/movimientosDAO';
import { productosDAO } from '../db/productosDAO';
import { KardexService } from '../services/KardexService';

export default {
    name: 'PageKardex',
    data() {
        return {
            movimientos: [],
            productosMap: {},
            filter: '',
            estadisticas: {
                productosBajoStock: 0,
                productosCriticos: 0,
                topSugerencias: []
            },
            columns: [
                { name: 'fecha', label: 'Fecha', align: 'left', field: 'fecha', sortable: true },
                { name: 'producto', label: 'Producto', align: 'left', field: 'producto_id', sortable: true },
                { name: 'tipo', label: 'Tipo', align: 'center', field: 'tipo', sortable: true },
                { name: 'cantidad', label: 'Cantidad', align: 'right', field: 'cantidad', sortable: true },
                { name: 'referencia', label: 'Referencia', align: 'left', field: 'referencia' }
            ],
            pagination: {
                sortBy: 'fecha',
                descending: true,
                rowsPerPage: 10
            }
        };
    },
    async mounted() {
        await this.loadProductos();
        await this.loadMovimientos();
        await this.loadAnalisis();
    },
    methods: {
        formatFecha(timestamp) {
            return date.formatDate(timestamp, 'YYYY-MM-DD HH:mm');
        },
        async loadProductos() {
            const productos = await productosDAO.getInstance().get();
            productos.forEach(p => {
                this.$set(this.productosMap, p.id, p.nombre);
            });
        },
        getNombreProducto(id) {
            return this.productosMap[id] || 'Producto Desconocido';
        },
        async loadMovimientos() {
            this.movimientos = await movimientosDAO.getInstance().getAll();
        },
        async loadAnalisis() {
            this.estadisticas = await KardexService.getInstance().getEstadisticasGenerales();
        },
        getColorTipo(tipo) {
            if (tipo === 'ENTRADA') return 'positive';
            if (tipo === 'SALIDA') return 'negative';
            return 'warning'; // AJUSTE
        }
    }
};
</script>
