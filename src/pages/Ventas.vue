<template>
  <q-page class="bg-grey-1 q-pa-md" padding>
    <!-- Date Filter Section -->
    <q-card class="rounded-card shadow-1 q-mb-md bg-white">
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input filled v-model="inicio" mask="date" :rules="['date']" label="Fecha Inicio" class="rounded-borders">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer" color="primary">
                  <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="inicio" color="primary">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Cerrar" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6">
            <q-input filled v-model="fin" mask="date" :rules="['date']" label="Fecha Fin" class="rounded-borders">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer" color="primary">
                  <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="fin" @input="getVentas" color="primary">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Cerrar" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Total Banner -->
    <q-card class="rounded-card bg-primary text-white shadow-2 q-mb-md">
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-subtitle2 text-indigo-2">Total Ventas</div>
          <div class="text-h5 text-indigo-2 text-weight-bold">
            Bs {{ formatMoney(total) }}
          </div>
        </div>
        <q-btn round color="white" text-color="green" icon="whatsapp" v-if="total > 0" type="a" :href="url_whatsapp"
          target="__blank" unelevated />
      </q-card-section>
    </q-card>

    <!-- Sales List -->
    <div v-if="ventas.length > 0">
      <div class="text-h6 q-mb-sm text-grey-8">Historial</div>
      <div class="row q-col-gutter-sm">
        <div v-for="venta in ventas" :key="venta.id" class="col-12 col-md-6">
          <q-card class="rounded-card shadow-1">
            <q-item class="q-py-md">
              <q-item-section avatar>
                <q-avatar color="indigo-1" text-color="primary">
                  {{ venta.id }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold text-dark">
                  Bs {{ formatMoney(venta.total) }}
                </q-item-label>
                <q-item-label caption lines="1">
                  <q-icon name="schedule" size="xs" /> {{ venta.create_at }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-xs">
                  <q-btn round flat color="primary" icon="visibility" @click="modalProductos(venta.productos)" />
                  <q-btn round flat color="negative" icon="delete_outline" @click="eliminarProductoLista(venta.id)" />
                </div>
              </q-item-section>
            </q-item>
          </q-card>
        </div>
      </div>
    </div>

    <div v-else class="text-center q-mt-xl text-grey-5">
      <q-icon name="receipt_long" size="64px" class="q-mb-md" />
      <div class="text-h6">Sin ventas registradas</div>
      <div class="text-caption">Selecciona un rango de fechas</div>
    </div>

    <!-- Details Dialog -->
    <q-dialog v-model="m_produtos" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="bg-grey-1">
        <q-toolbar class="bg-white text-primary shadow-1">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-bold">Detalle de Venta</q-toolbar-title>
        </q-toolbar>

        <q-card-section class="q-pa-md">
          <q-list class="bg-white rounded-card shadow-1" separator>
            <q-item v-for="(producto, index) in productos" :key="index" class="q-py-md">
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ producto.producto }}</q-item-label>
                <q-item-label caption>Cant: {{ producto.cantidad }}</q-item-label>
              </q-item-section>

              <q-item-section side class="text-right">
                <q-item-label class="text-primary text-weight-bold">
                  Bs {{ formatMoney(producto.valor_bs || 0) }}
                </q-item-label>
                <q-item-label caption class="text-positive text-weight-bold">
                  Ganancia: Bs {{ formatMoney((producto.valor_bs || 0) - (producto.costo_total_bs || 0)) }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item class="bg-grey-2">
              <q-item-section>
                <q-item-label class="text-weight-bold">TOTAL</q-item-label>
              </q-item-section>
              <q-item-section side class="text-right">
                <q-item-label class="text-h6 text-primary text-weight-bold">
                  Bs {{ formatMoney(totalVenta) }}
                </q-item-label>
                <q-item-label caption class="text-positive text-weight-bold">
                  Ganancia Total: Bs {{ formatMoney(totalGanancia) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ventasDAO } from "../db/ventasDAO";
import { Ventas } from "../models/Ventas";

export default {
  name: "PageVentas",
  data() {
    return {
      inicio: null,
      fin: null,
      ventas: [],
      form: new Ventas(),
      total: 0,
      cantidad: null,
      producto: null,
      options: [],
      stringOptions: [],
      m_produtos: false,
      productos: null,
      url_whatsapp: ''
    };
  },
  mounted() {
    // Initial load if needed
  },
  computed: {
    totalVenta() {
      if (!this.productos) return 0;
      return this.productos.reduce((sum, p) => sum + (p.valor_bs || 0), 0);
    },
    totalCosto() {
      if (!this.productos) return 0;
      return this.productos.reduce((sum, p) => sum + (p.costo_total_bs || 0), 0);
    },
    totalGanancia() {
      return this.totalVenta - this.totalCosto;
    }
  },
  methods: {
    formatMoney(amount) {
      return new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    },
    calcularGanancia(producto) {
      const venta = producto.valor_bs || 0;
      const costo = producto.costo_total_bs || 0;
      return venta - costo;
    },
    async getVentas() {
      await ventasDAO
        .getInstance()
        .get(this.inicio, this.fin)
        .then(result => (this.ventas = result));
      let sum = 0;
      for (let i = 0; i < this.ventas.length; i++) {
        sum += this.ventas[i].total;
      }
      this.total = sum;
      const monto_convertido = this.formatMoney(this.total);
      const mensaje = `El total del sus ventas es de *Bs ${monto_convertido}*`
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`
      this.url_whatsapp = url;
    },
    eliminarProductoLista(id) {
      this.$q
        .dialog({
          title: "¿Desea borrar este registro?",
          message: '<strong class="text-red">¡Los cambios no podrán deshacerse!</strong>',
          html: true,
          cancel: true,
          persistent: true
        })
        .onOk(() => {
          this.$q.loading.show();
          ventasDAO
            .getInstance()
            .delete(id)
            .then(async () => {
              await this.getVentas(); // Refresh list
              this.$q.loading.hide();
              this.$q.notify({
                position: "top",
                type: "positive",
                message: `¡Datos eliminados!`
              });
            });
        });
    },
    modalProductos(productos) {
      this.m_produtos = true;
      this.productos = productos;
    }
  }
};
</script>
