<template>
  <q-page class="bg-grey-3 q-pa-md" padding>
    <div class="row">
      <q-select
        class="col q-mr-sm"
        label="Producto"
        color="teal"
        autofocus
        filled
        v-model="producto"
        use-input
        hide-selected
        fill-input
        input-debounce="0"
        :options="options"
        @filter="filterFn"
        style="width: 250px; padding-bottom: 32px"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              Sin resultados
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <q-input class="col" color="teal" filled v-model.number="cantidad" type="number" label="Cantidad">
        <template v-slot:append>
          <q-icon name="add_shopping_cart" color="teal" @click="agregarListaCompra"/>
        </template>
      </q-input>
      <q-btn color="teal" class="full-width q-mb-md" label="Agregar" @click="agregarListaCompra" icon="add_shopping_cart" />
    </div>
    <div class="row">
      <q-banner inline-actions class="col text-white bg-red">
      Bs {{ new Intl.NumberFormat("es-VE", {minimumFractionDigits: 2, maximumFractionDigits: 2,}).format(total) }}
      <template v-slot:action>
        <q-btn flat  color="white" label="Pagar" @click="save" icon="paid" />
      </template>
    </q-banner>
    </div>
    <q-list class="bg-white" bordered padding>

      <q-item-label header>Listado</q-item-label>

      <q-item v-for="(lista_compra, index) in lista_compras" :key="index" v-ripple>
        <q-item-section side>
          <div class="text-right">
            <div class="text-weight-bold text-primary">
              Total:
              <div>Bs {{ new Intl.NumberFormat("es-VE", {minimumFractionDigits: 2, maximumFractionDigits: 2,}).format(lista_compra.valor_bs) }}</div>
              <div class="text-caption" v-if="valor_dolar">
                $ {{ new Intl.NumberFormat("es-VE", {minimumFractionDigits: 2, maximumFractionDigits: 2,}).format(parseFloat((lista_compra.valor_bs / valor_dolar).toFixed(2))) }}
              </div>
            </div>
            <div class="text-grey-7 text-caption q-mt-xs">
              Unitario:
              <div>Bs {{ new Intl.NumberFormat("es-VE", {minimumFractionDigits: 2, maximumFractionDigits: 2,}).format(lista_compra.valor_unitario_bs) }}</div>
              <div class="text-caption" v-if="valor_dolar">
                $ {{ new Intl.NumberFormat("es-VE", {minimumFractionDigits: 2, maximumFractionDigits: 2,}).format(parseFloat((lista_compra.valor_unitario_bs / valor_dolar).toFixed(2))) }}
              </div>
            </div>
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ lista_compra.cantidad }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ lista_compra.existencia }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ lista_compra.producto }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat round color="negative" icon="delete" @click="eliminarProductoLista(index)">
              <q-tooltip
                transition-show="rotate"
                transition-hide="rotate"
              >
                Eliminar registro selecionado
              </q-tooltip>
              </q-btn>
        </q-item-section>
      </q-item>

    </q-list>
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
  data () {
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
    getProdutos() {
      productosDAO.getInstance().get().then(result => { result.forEach(element => this.stringOptions.push(element.nombre))});
    },
    getDolar() {
      valor_dolarDAO.getInstance().getUltimo().then(result => { this.valor_dolar = result.valor_dolar});
    },
    agregarListaCompra() {
      let producto = this.producto;
      if(producto) {
        this.$q.loading.show();
      productosDAO.getInstance().getNombre(producto).then((result) => {
        //console.log(result);
        this.$q.loading.hide();
        const porcentaje = Number(result.porcentaje_ganancia || 0);
        const iva = Number(result.porcentaje_iva || 0);
        // Precio sin IVA: Valor Base + Ganancia
        const precioSinIva = Number(result.valor) * (1 + (porcentaje / 100));
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
            db.productos.get(element.id).then(function(producto) {
              let resta_producto = producto.cantidad - element.cantidad;
              db.productos.update(element.id, {cantidad: resta_producto});
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
      }).catch (function (e) {
        console.error(`Error: ${e.stack}`);
        this.$q.notify({
          position: 'top',
        type: 'negative',
        message: `Error: ${e.stack}`
      });
    });
    },
    eliminarProductoLista(index) {
      console.log(index )
      let monto_quitar = this.lista_compras[index];
      this.lista_compras.splice(index,1);
      this.total = this.total - monto_quitar.valor_bs;

    },
    filterFn (val, update, abort) {
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
