<template>
  <q-page class="bg-grey-3 q-pa-md" padding>
    <div class="row">
      <q-input
        class="col q-mr-sm"
        filled
        v-model="inicio"
        mask="date"
        :rules="['date']"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              ref="qDateProxy"
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="inicio">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Cerrar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-input class="col" filled v-model="fin" mask="date" :rules="['date']">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              ref="qDateProxy"
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="fin" @input="getVentas">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Cerrar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
    <div class="row">
      <q-banner inline-actions class="col text-white bg-red">
        Bs
        {{
          new Intl.NumberFormat("es-VE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(total)
        }}
        <template v-slot:action>
          <q-btn round color="green" icon="whatsapp" v-if="total > 0" type="a" :href="url_whatsapp" target="__blank" />
        </template>
      </q-banner>
    </div>
    <q-list bordered>
      <q-item
        v-for="venta in ventas"
        :key="venta.id"
        class="q-my-sm"
        clickable
        v-ripple
      >
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white">
            {{ venta.id }}
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{
            new Intl.NumberFormat("es-VE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(venta.total)
          }}</q-item-label>
          <q-item-label caption lines="1">{{ venta.create_at }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="text-grey-8 q-gutter-xs">
            <q-btn
              size="12px"
              flat
              dense
              round
              color="primary"
              icon="more_vert"
              @click="modalProductos(venta.productos)"
            />
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              @click="eliminarProductoLista(venta.id)"
            >
              <q-tooltip transition-show="rotate" transition-hide="rotate">
                Eliminar registro selecionado
              </q-tooltip>
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <q-dialog v-model="m_produtos">
      <q-card>
        <q-toolbar>
          <q-avatar square>
            <img :src="`${$router.options.base || ''}icons/favicon-128x128.png`" />
          </q-avatar>

          <q-toolbar-title
            ><span class="text-weight-bold">Productos</span></q-toolbar-title
          >

          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section>
          <q-markup-table>
            <thead>
              <tr>
                <th class="text-left">Producto</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Precio Venta Bs</th>
                <th class="text-right">Costo Total Bs</th>
                <th class="text-right">Ganancia Bs</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(producto, index) in productos" :key="index">
                <td class="text-left">{{ producto.producto }}</td>
                <td class="text-right">{{ producto.cantidad }}</td>
                <td class="text-right">
                  {{
                    new Intl.NumberFormat("es-VE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(producto.valor_bs || 0)
                  }}
                </td>
                <td class="text-right text-grey-7">
                  {{
                    new Intl.NumberFormat("es-VE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(producto.costo_total_bs || 0)
                  }}
                </td>
                <td class="text-right text-positive text-weight-bold">
                  {{
                    new Intl.NumberFormat("es-VE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format((producto.valor_bs || 0) - (producto.costo_total_bs || 0))
                  }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th class="text-left">TOTAL</th>
                <th class="text-right"></th>
                <th class="text-right">
                  {{
                    new Intl.NumberFormat("es-VE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(this.totalVenta)
                  }}
                </th>
                <th class="text-right text-grey-7">
                  {{
                    new Intl.NumberFormat("es-VE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(this.totalCosto)
                  }}
                </th>
                <th class="text-right text-positive text-weight-bold">
                  {{
                    new Intl.NumberFormat("es-VE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(this.totalGanancia)
                  }}
                </th>
              </tr>
            </tfoot>
          </q-markup-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
// import { date } from "quasar";
import { ventasDAO } from "../db/ventasDAO";
import { Ventas } from "../models/Ventas";
export default {
  name: "PageIndex",
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
    /*this.getProdutos();
    this.getDolar();*/
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
    calcularGanancia(producto) {
      const venta = producto.valor_bs || 0;
      const costo = producto.costo_total_bs || 0;
      return venta - costo;
    },
    async getVentas() {
      //console.log(this.fin)
      await ventasDAO
        .getInstance()
        .get(this.inicio, this.fin)
        .then(result => (this.ventas = result));
      let sum = 0;
      for (let i = 0; i < this.ventas.length; i++) {
        //console.log(this.ventas[i]);
        sum += this.ventas[i].total;
      }
      this.total = sum;
      const monto_convertido = new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.total)
      const mensaje = `El total del sus ventas es de *Bs ${monto_convertido}*`
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`
      this.url_whatsapp = url;
    },
    eliminarProductoLista(id) {
      this.$q
        .dialog({
          title: "¿Desea borrar este registro?",
          message:
            '<strong class="text-red">¡Los cambios no podrán deshacerse!</strong>',
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
              await ventasDAO
                .getInstance()
                .get(this.inicio, this.fin)
                .then(result => (this.ventas = result));
              let sum = 0;
              for (let i = 0; i < this.ventas.length; i++) {
                //console.log(this.ventas[i]);
                sum += this.ventas[i].total;
              }
              this.total = sum;
              this.$q.loading.hide();
              this.$q.notify({
                position: "top",
                type: "positive",
                message: `¡Datos eliminados!`
              });
            });
        })
        .onCancel(() => {});
    },
    modalProductos(productos) {
      this.m_produtos = true;
      this.productos = productos;
    },
    filterFn(val, update, abort) {
      if (val.length < 2) {
        abort();
        return;
      }

      update(() => {
        const needle = val.toLowerCase();
        this.options = this.stringOptions.filter(
          v => v.toLowerCase().indexOf(needle) > -1
        );
      });
    },
    enviarPorWhatsApp(total) {
      // const monto_convertido = new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(venta.total)
      // const mensaje = `El total del sus ventas es de *Bs ${monto_convertido}*`
      // const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`
      // this.url_whatsapp = url;
      // this.url_whatsapp.click();
    }
  }
};
</script>
