<template>
  <q-page class="q-pa-md q-pb-xl bg-grey-1">

    <!-- Input Section -->
    <q-card class="rounded-card q-mb-md shadow-1 bg-white">
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-8">
            <q-select filled v-model="producto" use-input hide-selected fill-input input-debounce="0" :options="options"
              @filter="filterFn" label="Buscar Producto" color="primary" behavior="menu" class="rounded-borders">
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">Sin resultados</q-item-section>
                </q-item>
              </template>
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-select>
          </div>
          <div class="col-6 col-sm-2">
            <q-input filled v-model.number="cantidad" type="number" label="Cant." color="primary" min="1"
              class="rounded-borders" />
          </div>
          <div class="col-6 col-sm-2">
            <q-btn color="primary" icon="add_shopping_cart" class="full-width full-height shadow-0 rounded-borders"
              @click="agregarListaCompra" label="Agregar" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- List Section -->
    <div v-if="lista_compras.length > 0" class="q-mb-xl" style="padding-bottom: 80px">
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-h6 text-grey-8">Carrito ({{ lista_compras.length }})</div>
        <q-btn flat dense color="negative" label="Limpiar" @click="lista_compras = []; total = 0" size="sm" />
      </div>

      <div class="row q-col-gutter-sm">
        <div v-for="(item, index) in lista_compras" :key="index" class="col-12 col-md-6">
          <q-card class="rounded-card shadow-1">
            <q-item class="q-py-md">
              <q-item-section avatar>
                <q-avatar color="indigo-1" text-color="primary" icon="inventory_2" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold text-dark">{{ item.producto }}</q-item-label>
                <q-item-label caption>
                  Cant: {{ item.cantidad }} | Stock: {{ item.existencia }}
                </q-item-label>
              </q-item-section>

              <q-item-section side class="text-right">
                <div class="text-weight-bold text-primary">
                  Bs {{ formatMoney(item.valor_bs) }}
                </div>
                <div class="text-caption text-grey" v-if="valor_dolar">
                  $ {{ formatMoneyUSD(item.valor_bs / valor_dolar) }}
                </div>
              </q-item-section>

              <q-item-section side>
                <q-btn flat round color="negative" icon="delete_outline" @click="eliminarProductoLista(index)" />
              </q-item-section>
            </q-item>
          </q-card>
        </div>
      </div>
    </div>

    <div v-else class="text-center q-mt-xl text-grey-5">
      <q-icon name="shopping_cart" size="64px" class="q-mb-md" />
      <div class="text-h6">Carrito vacío</div>
      <div class="text-caption">Agrega productos para comenzar</div>
    </div>

    <!-- Sticky Total Footer (Mobile) -->
    <!-- Sticky Total Footer (Mobile) -->
    <q-page-sticky position="bottom" :offset="[0, 0]" class="lt-md" expand v-if="lista_compras.length > 0"
      style="z-index: 2000">
      <div class="bg-white q-pa-md shadow-up-2 row items-center justify-between full-width"
        style="border-top-left-radius: 16px; border-top-right-radius: 16px;">
        <div>
          <div class="text-caption text-grey">Total a Pagar</div>
          <div class="text-h6 text-primary text-weight-bold">
            Bs {{ formatMoney(total) }}
          </div>
          <div class="text-subtitle2 text-grey-7" v-if="valor_dolar">
            $ {{ formatMoneyUSD(total / valor_dolar) }}
          </div>
        </div>
        <q-btn color="primary" label="Pagar" icon="payments" @click="confirmPaymentDialog = true" rounded unelevated
          class="q-px-lg" />
      </div>
    </q-page-sticky>

    <!-- Desktop Total Footer (Sticky) -->
    <q-page-sticky position="bottom" :offset="[0, 0]" class="gt-sm" expand v-if="lista_compras.length > 0"
      style="z-index: 2000">
      <div class="bg-primary text-white shadow-up-2 row items-center justify-between full-width q-px-xl q-py-md">
        <div class="row items-center q-gutter-x-md">
          <div class="text-subtitle1 text-indigo-2">Total a Pagar:</div>
          <div class="text-h4 text-indigo-2 text-weight-bold">Bs {{ formatMoney(total) }}</div>
          <div class="text-h5 text-indigo-2" v-if="valor_dolar">
            $ {{ formatMoneyUSD(total / valor_dolar) }}
          </div>
        </div>
        <q-btn color="white" text-color="primary" label="Pagar" icon="payments" @click="confirmPaymentDialog = true"
          rounded unelevated size="lg" class="q-px-xl" />
      </div>
    </q-page-sticky>


    <!-- Payment Confirmation Dialog -->
    <q-dialog v-model="confirmPaymentDialog">
      <q-card style="min-width: 350px; border-radius: 16px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-primary">Confirmar Pago</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1">
            ¿Deseas procesar la venta por <span class="text-weight-bold">Bs {{ formatMoney(total) }}</span>?
          </div>
          <div class="text-caption text-grey" v-if="valor_dolar">
            Equivalente a $ {{ formatMoneyUSD(total / valor_dolar) }}
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pt-none q-pb-md q-px-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn unelevated label="Confirmar" color="primary" @click="confirmAndSave" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import { date } from 'quasar';
import { productosDAO } from '../db/productosDAO';
import { valor_dolarDAO } from '../db/valor_dolarDAO';
import { ventasDAO } from '../db/ventasDAO';
import { Ventas } from '../models/Ventas';
import { db } from '../db/db';
import { movimientosDAO } from '../db/movimientosDAO';
import { Movimientos } from '../models/Movimientos';
import { recommendationService } from '../services/RecommendationService';

export default {
  name: 'PageIndex',
  data() {
    return {
      valor_dolar: null,
      lista_compras: [],
      form: new Ventas(),
      total: 0,
      cantidad: 1,
      producto: null,
      options: [],
      stringOptions: [],
      recommendedProduct: null,
      confirmPaymentDialog: false
    }
  },
  computed: {
    hoyDate() {
      let timeStamp = Date.now();
      return date.formatDate(timeStamp, 'dddd D MMMM hh:mm A');
    },
    fechaCreacion() {
      let timeStamp = Date.now();
      return date.formatDate(timeStamp, 'YYYY/MM/DD HH:mm:ss');
    }
  },
  mounted() {
    this.getProdutos();
    this.getDolar();
    recommendationService.init();
  },
  methods: {
    formatMoney(amount) {
      return new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    },
    formatMoneyUSD(amount) {
      return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    },
    getProdutos() {
      productosDAO.getInstance().get().then(result => { result.forEach(element => this.stringOptions.push(element.nombre)) });
    },
    getDolar() {
      valor_dolarDAO.getInstance().getUltimo().then(result => { this.valor_dolar = result.valor_dolar });
    },
    agregarListaCompra() {
      let producto = this.producto;
      if (producto) {
        this.$q.loading.show();
        productosDAO.getInstance().getNombre(producto).then((result) => {
          //console.log(result);
          this.$q.loading.hide();
          const porcentaje = Number(result.porcentaje_ganancia || 0);
          const iva = Number(result.porcentaje_iva || 0);
          // Precio sin IVA: Costo + Ganancia
          const precioSinIva = Number(result.costo || 0) * (1 + (porcentaje / 100));
          // IVA sobre precio sin IVA
          const montoIva = precioSinIva * (iva / 100);
          // Precio final con IVA
          const precioUsdConGanancia = precioSinIva + montoIva;
          const costoUsd = Number(result.costo || 0);
          const costoTotalBs = (costoUsd * Number(this.valor_dolar) * Number(this.cantidad));
          let monto_producto = (precioUsdConGanancia * Number(this.valor_dolar) * Number(this.cantidad));
          const valor_unitario_bs = (precioUsdConGanancia * Number(this.valor_dolar));
          const costo_unitario_bs = (costoUsd * Number(this.valor_dolar));
          this.lista_compras.push({
            id: result.id,
            producto: result.nombre,
            valor_bs: monto_producto,
            valor_unitario_bs: valor_unitario_bs,
            costo_total_bs: costoTotalBs,
            costo_unitario_bs: costo_unitario_bs,
            cantidad: this.cantidad,
            valor_dolar: this.valor_dolar,
            existencia: result.cantidad
          });
          //this.lista_compras.forEach(element => this.total += Number(element.valor_bs));
          this.total = this.total + monto_producto;
          this.producto = null;
          this.cantidad = 1; // Reset quantity
          //console.log(monto_producto);

          // Check for recommendations
          this.checkRecommendation(result.id);
        });
      } else {
        this.$q.notify({
          position: 'top',
          type: 'negative',
          message: `Debe agregar un producto a la lista`
        });
      }


    },
    confirmAndSave() {
      this.save();
    },
    save() {
      this.$q.loading.show();
      this.form.create_at = this.fechaCreacion;
      this.form.total = this.total;
      this.form.productos = this.lista_compras;

      ventasDAO.getInstance().save(this.form).then(async (ventaId) => {
        // Guardar movimientos y actualizar stock
        for (const element of this.lista_compras) {
          try {
            // 1. Registrar Movimiento (SALIDA)
            const movimiento = new Movimientos();
            movimiento.producto_id = element.id;
            movimiento.tipo = 'SALIDA';
            movimiento.cantidad = element.cantidad;
            movimiento.fecha = Date.now();
            movimiento.referencia = `Venta #${ventaId}`;
            movimiento.create_at = this.fechaCreacion;

            await movimientosDAO.getInstance().save(movimiento);

            // 2. Actualizar Stock (existente)
            const producto = await db.productos.get(element.id);
            if (producto) {
              let resta_producto = producto.cantidad - element.cantidad;
              await db.productos.update(element.id, { cantidad: resta_producto });
            }
          } catch (err) {
            console.error("Error al procesar producto en venta:", element.producto, err);
          }
        }

        this.form = new Ventas();
        this.lista_compras = [];
        this.total = 0;
        this.$q.loading.hide();

        // Trigger model retraining in background
        console.log("Training recommendation model with new sale data...");
        recommendationService.train(); // Fire and forget, don't await to not block UI

        this.$q.notify({
          position: 'top',
          type: 'positive',
          message: `Venta registrada con éxito.`
        });
      }).catch((e) => {
        console.error(`Error: ${e.stack || e}`);
        this.$q.loading.hide();
        this.$q.notify({
          position: 'top',
          type: 'negative',
          message: `Error al guardar venta: ${e.message}`
        });
      });
    },
    eliminarProductoLista(index) {
      console.log(index)
      let monto_quitar = this.lista_compras[index];
      this.lista_compras.splice(index, 1);
      this.total = this.total - monto_quitar.valor_bs;

    },
    filterFn(val, update, abort) {
      if (val.length < 2) {
        abort()
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.stringOptions.filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    },
    calcularPrecioUSD(valorBs, valorDolar) {
      if (!valorBs || !valorDolar) return 0;
      return parseFloat((valorBs / valorDolar).toFixed(2));
    },
    async checkRecommendation(productId) {
      try {
        // Excluir productos que ya estan en el carrito
        const excludedIds = this.lista_compras.map(item => item.id);

        const recommendation = await recommendationService.getRecommendation(productId, excludedIds);
        if (recommendation) {
          this.recommendedProduct = recommendation;

          // Usar Notify en lugar de Dialog para no bloquear
          this.$q.notify({
            message: `💡 Sugerencia: Clientes también llevan ${recommendation.nombre}`,
            caption: 'Producto con poco movimiento disponible',
            color: 'indigo-10',
            icon: 'lightbulb',
            position: 'bottom-right',
            timeout: 10000, // 10 segundos para decidir
            actions: [
              { label: 'Omitir', color: 'white', handler: () => { /* Do nothing */ } },
              { label: 'Agregar', color: 'yellow', handler: () => { this.confirmRecommendation() } }
            ]
          });
        }
      } catch (e) {
        console.error("Error checking recommendation:", e);
      }
    },
    confirmRecommendation() {
      if (this.recommendedProduct) {
        this.producto = this.recommendedProduct.nombre; // Set select value
        this.agregarListaCompra();
        this.recommendedProduct = null;
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
