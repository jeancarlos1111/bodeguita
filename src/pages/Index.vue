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
        <q-btn color="primary" label="Pagar" icon="payments" @click="save" rounded unelevated class="q-px-lg" />
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
        <q-btn color="white" text-color="primary" label="Pagar" icon="payments" @click="save" rounded unelevated
          size="lg" class="q-px-xl" />
      </div>
    </q-page-sticky>

  </q-page>
</template>

<script>
import { date } from 'quasar';
import { productosDAO } from '../db/productosDAO';
import { valor_dolarDAO } from '../db/valor_dolarDAO';
import { ventasDAO } from '../db/ventasDAO';
import { Ventas } from '../models/Ventas';
import { db } from '../db/db';

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
        });
      } else {
        this.$q.notify({
          position: 'top',
          type: 'negative',
          message: `Debe agregar un producto a la lista`
        });
      }


    },
    save() {
      this.$q.loading.show();
      this.form.create_at = this.fechaCreacion;
      this.form.total = this.total;
      this.form.productos = this.lista_compras;
      ventasDAO.getInstance().save(this.form).then(() => {
        this.lista_compras.forEach(element => {
          db.productos.get(element.id).then(function (producto) {
            let resta_producto = producto.cantidad - element.cantidad;
            db.productos.update(element.id, { cantidad: resta_producto });
            //console.log(`Productos: ${resta_producto}`);
          });
          //console.log(product.cantidad)
        })
        this.form = new Ventas();
        this.lista_compras = [];
        this.total = 0;
        this.$q.loading.hide();
        this.$q.notify({
          position: 'top',
          type: 'positive',
          message: `Datos guardados.`
        });
      }).catch(function (e) {
        console.error(`Error: ${e.stack}`);
        this.$q.notify({
          position: 'top',
          type: 'negative',
          message: `Error: ${e.stack}`
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
  }
}
</script>
