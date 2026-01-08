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
          <div class="text-subtitle1 q-mb-md">
            ¿Deseas procesar la venta por <span class="text-weight-bold">Bs {{ formatMoney(total) }}</span>?
          </div>

          <q-select filled v-model="form.metodo_pago" :options="paymentOptions" label="Método de Pago" class="q-mb-sm"
            :rules="[val => !!val || 'Requerido']">
            <template v-slot:prepend>
              <q-icon name="payments" />
            </template>
          </q-select>

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

    <!-- Client Dialog for Fiado -->
    <q-dialog v-model="clienteDialog" persistent>
      <q-card style="min-width: 350px; border-radius: 16px;">
        <q-card-section class="row items-center">
          <div class="text-h6 text-primary">Cliente para Fiado</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-sm items-end">
            <div class="col">
              <q-input filled v-model="cedulaSearch" label="Cédula" @keyup.enter="buscarCliente" autofocus />
            </div>
            <div class="col-auto">
              <q-btn icon="search" color="primary" @click="buscarCliente" class="q-mb-sm" round unelevated />
            </div>
          </div>
        </q-card-section>

        <q-card-section v-if="clienteFound === false">
          <div class="text-subtitle2 text-orange q-mb-sm">Cliente no encontrado. Registrar nuevo:</div>
          <q-input filled v-model="clienteForm.nombre" label="Nombre y Apellido" class="q-mb-sm" />
          <q-input filled v-model="clienteForm.telefono" label="Teléfono" class="q-mb-sm" />
        </q-card-section>

        <q-card-section v-if="clienteFound">
          <div class="text-subtitle1 text-indigo-10">
            <strong>Cliente:</strong> {{ clienteFound.nombre }} <br>
            <small>{{ clienteFound.telefono }}</small>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />

          <q-btn v-if="clienteFound === false" label="Registrar y Procesar" color="primary"
            @click="registrarYContinuar" />
          <q-btn v-if="clienteFound" label="Confirmar Fiado" color="primary" @click="confirmarFiadoExistente" />
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
import { configuracionDAO } from '../db/configuracionDAO';
import { clientesDAO } from '../db/clientesDAO';
import { Clientes } from '../models/Clientes';

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
      confirmPaymentDialog: false,
      paymentOptions: ['Efectivo Bs', 'Efectivo $', 'Pago Móvil', 'Punto de Venta', 'Zelle', 'Fiado'],

      // Client/Fiado Logic
      clienteDialog: false,
      clienteFound: null,
      clienteForm: new Clientes(),
      cedulaSearch: '',

      // Tax Logic
      tributos: {
        cobrar_iva: false,
        cobrar_igtf: false
      },
      montoIGTF: 0,
      totalConIGTF: 0
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
  watch: {
    'form.metodo_pago'(val) {
      if (['Efectivo $', 'Zelle'].includes(val) && this.tributos.cobrar_igtf) {
        this.calcularIGTF();
      } else {
        this.montoIGTF = 0;
        this.totalConIGTF = this.total;
      }
    }
  },
  mounted() {
    this.getProdutos();
    this.getDolar();
    this.loadConfig();
    recommendationService.init();
  },
  methods: {
    async loadConfig() {
      const taxes = await configuracionDAO.getInstance().get('tributos');
      if (taxes) {
        this.tributos = { ...taxes };
      }
    },
    formatMoney(amount) {
      return new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);
    },
    formatMoneyUSD(amount) {
      return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);
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
          this.$q.loading.hide();
          const porcentaje = Number(result.porcentaje_ganancia || 0);
          const ivaPorc = Number(result.porcentaje_iva || 0);

          // Precio Base (Costo + Ganancia)
          const precioBaseUsd = Number(result.costo || 0) * (1 + (porcentaje / 100));

          let precioFinalUsd = precioBaseUsd;
          let montoIvaUsd = 0;

          // Si 'Cobrar IVA' está activo y el producto tiene IVA definido
          if (this.tributos.cobrar_iva && ivaPorc > 0) {
            montoIvaUsd = precioBaseUsd * (ivaPorc / 100);
            precioFinalUsd = precioBaseUsd + montoIvaUsd;
          }
          // Si NO está activo, asumimos que el precio de venta ya es final y no desglosamos (Fiscalmente Exento en práctica)
          // O si el producto es exento (ivaPorc = 0)

          const tasa = Number(this.valor_dolar);
          const cantidad = Number(this.cantidad);

          // VALIDATION: Check Stock
          const cantidadEnCarrito = this.lista_compras
            .filter(item => item.id === result.id)
            .reduce((acc, item) => acc + item.cantidad, 0);

          if ((cantidad + cantidadEnCarrito) > result.cantidad) {
            this.$q.loading.hide();
            this.$q.notify({
              type: 'negative',
              message: `Stock insuficiente. Disponible: ${result.cantidad}. (En carrito: ${cantidadEnCarrito})`
            });
            return;
          }

          const costoTotalBs = (Number(result.costo || 0) * tasa * cantidad);

          const valor_unitario_bs = precioFinalUsd * tasa;
          const monto_total_bs = valor_unitario_bs * cantidad;

          // Fiscal breakdowns per item (total line)
          const base_linea_bs = (precioBaseUsd * tasa * cantidad);
          const iva_linea_bs = (montoIvaUsd * tasa * cantidad);

          this.lista_compras.push({
            id: result.id,
            producto: result.nombre,
            valor_bs: monto_total_bs, // Precio Final Venta en Bs
            valor_unitario_bs: valor_unitario_bs,
            costo_total_bs: costoTotalBs,
            costo_unitario_bs: (Number(result.costo || 0) * tasa),
            cantidad: cantidad,
            valor_dolar: tasa,
            existencia: result.cantidad,

            // Fiscal Data
            es_exento: !this.tributos.cobrar_iva || ivaPorc === 0,
            tasa_iva: this.tributos.cobrar_iva ? ivaPorc : 0,
            monto_base_bs: base_linea_bs,
            monto_iva_bs: iva_linea_bs
          });

          this.total = this.lista_compras.reduce((acc, el) => acc + el.valor_bs, 0);
          this.totalConIGTF = this.total; // Reset logic handles updates

          this.producto = null;
          this.cantidad = 1;

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
    calcularIGTF() {
      // Si pago en Divisas, aplicar 3% sobre el monto equivalente en Bs o sobre el monto $ convertido
      // Asumimos pago total en divisa
      if (this.tributos.cobrar_igtf) {
        this.montoIGTF = this.total * 0.03;
        this.totalConIGTF = this.total + this.montoIGTF;
      }
    },
    confirmAndSave() {
      if (!this.form.metodo_pago) {
        this.$q.notify({
          type: 'warning',
          message: 'Seleccione un método de pago'
        });
        return;
      }
      if (this.form.metodo_pago === 'Fiado') {
        this.clienteDialog = true;
        this.clienteFound = null;
        this.clienteForm = new Clientes();
        this.cedulaSearch = '';
        return;
      }
      this.save();
    },
    async buscarCliente() {
      if (!this.cedulaSearch) return;
      this.$q.loading.show();
      try {
        const cliente = await clientesDAO.getInstance().getByCedula(this.cedulaSearch);
        if (cliente) {
          this.clienteFound = cliente;
          this.clienteForm = { ...cliente };
        } else {
          this.clienteFound = false;
          this.clienteForm = new Clientes();
          this.clienteForm.cedula = this.cedulaSearch;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.$q.loading.hide();
      }
    },
    async registrarYContinuar() {
      if (!this.clienteForm.nombre || !this.clienteForm.telefono) {
        this.$q.notify({ type: 'warning', message: 'Nombre y Teléfono son requeridos' });
        return;
      }

      this.$q.loading.show();
      try {
        let clienteId;
        if (this.clienteFound && this.clienteFound.id) {
          clienteId = this.clienteFound.id;
        } else {
          this.clienteForm.create_at = this.fechaCreacion;
          clienteId = await clientesDAO.getInstance().save(this.clienteForm);
        }

        this.form.cliente_id = clienteId;
        this.form.cliente_nombre = this.clienteForm.nombre;
        this.form.estado = 'PENDIENTE';

        this.clienteDialog = false;
        await this.save(true);

      } catch (e) {
        console.error(e);
        this.$q.notify({ type: 'negative', message: 'Error registrando cliente' });
      } finally {
        this.$q.loading.hide();
      }
    },
    async confirmarFiadoExistente() {
      if (!this.clienteFound) return;

      this.form.cliente_id = this.clienteFound.id;
      this.form.cliente_nombre = this.clienteFound.nombre;
      this.form.estado = 'PENDIENTE';

      this.clienteDialog = false;
      await this.save();
    },
    async save(isFiadoConfirmed = false) {
      this.$q.loading.show();
      this.form.create_at = this.fechaCreacion;
      this.form.total = this.totalConIGTF; // Save total PAID (including tax)
      this.form.productos = this.lista_compras;
      this.form.metodo_pago = this.form.metodo_pago; // Already set

      // Fiscal Summaries
      let monto_exento = 0;
      let monto_base = 0;
      let monto_iva = 0;

      this.lista_compras.forEach(item => {
        if (item.es_exento) {
          monto_exento += item.valor_bs;
        } else {
          monto_base += item.monto_base_bs;
          monto_iva += item.monto_iva_bs;
        }
      });

      this.form.monto_exento = monto_exento;
      this.form.monto_base = monto_base;
      this.form.monto_iva = monto_iva;
      this.form.tasa_iva = 16; // Standard calc reference

      this.form.monto_igtf = this.montoIGTF;
      this.form.tasa_dolar = this.valor_dolar;
      // If paid in dollars, we estimate amount in USD
      if (['Efectivo $', 'Zelle'].includes(this.form.metodo_pago)) {
        this.form.monto_dolar = this.total / this.valor_dolar;
      } else {
        this.form.monto_dolar = 0;
      }


      try {
        let currentSeq = await configuracionDAO.getInstance().get('secuencia_factura');
        if (!currentSeq) currentSeq = 1;
        else currentSeq = Number(currentSeq) + 1;

        this.form.numero_factura = currentSeq;

        const ventaId = await ventasDAO.getInstance().save(this.form);

        await configuracionDAO.getInstance().save('secuencia_factura', currentSeq);

        for (const element of this.lista_compras) {
          const movimiento = new Movimientos();
          movimiento.producto_id = element.id;
          movimiento.tipo = 'SALIDA';
          movimiento.cantidad = element.cantidad;
          movimiento.fecha = Date.now();
          movimiento.referencia = `Venta #${ventaId} (Fac: ${currentSeq})`;
          movimiento.create_at = this.fechaCreacion;

          await movimientosDAO.getInstance().save(movimiento);

          const producto = await db.productos.get(element.id);
          if (producto) {
            let resta_producto = producto.cantidad - element.cantidad;
            await db.productos.update(element.id, { cantidad: resta_producto });
          }
        }

        this.form = new Ventas();
        this.form.cliente_id = null;
        this.form.cliente_nombre = null;
        this.form.estado = 'PAGADO';
        this.montoIGTF = 0;
        this.totalConIGTF = 0;

        this.lista_compras = [];
        this.total = 0;
        this.$q.loading.hide();

        recommendationService.train();

        this.$q.notify({
          position: 'top',
          type: 'positive',
          message: `Venta registrada con éxito. Factura #${currentSeq}`
        });

      } catch (e) {
        console.error(`Error: ${e.stack || e}`);
        this.$q.loading.hide();
        this.$q.notify({
          position: 'top',
          type: 'negative',
          message: `Error al guardar venta: ${e.message}`
        });
      }
    },
    eliminarProductoLista(index) {
      console.log(index)
      let monto_quitar = this.lista_compras[index];
      this.lista_compras.splice(index, 1);

      // Re-sum total from remaining items to be safe and accurate
      this.total = this.lista_compras.reduce((acc, el) => acc + el.valor_bs, 0);

      // Recalc IGTF if needed
      if (['Efectivo $', 'Zelle'].includes(this.form.metodo_pago) && this.tributos.cobrar_igtf) {
        this.calcularIGTF();
      } else {
        this.totalConIGTF = this.total;
      }
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
        const excludedIds = this.lista_compras.map(item => item.id);
        const recommendation = await recommendationService.getRecommendation(productId, excludedIds);
        if (recommendation) {
          this.recommendedProduct = recommendation;
          this.$q.notify({
            message: `💡 Sugerencia: Clientes también llevan ${recommendation.nombre}`,
            caption: 'Producto con poco movimiento disponible',
            color: 'indigo-10',
            icon: 'lightbulb',
            position: 'bottom-right',
            timeout: 10000,
            actions: [
              { label: 'Omitir', color: 'white', handler: () => { } },
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
        this.producto = this.recommendedProduct.nombre;
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
