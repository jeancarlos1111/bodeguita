<template>
  <q-page :class="$q.dark.isActive ? 'bg-dark' : 'bg-slate-50'" class="q-pb-xl">
    <div class="pos-container q-mx-auto q-px-sm-md q-py-sm">

      <!-- 1. Barra Superior Profesional (Screenshot 1 y 2) -->
      <div class="row items-center justify-between q-py-xs q-mb-sm">
        <div class="row items-center">
          <q-btn flat round dense icon="chevron_left" color="grey-8" size="md" to="/" class="q-mr-xs"
            title="Ir al Dashboard" />
          <div class="text-h5 text-weight-bold text-grey-9 q-mr-sm" :class="$q.dark.isActive ? 'text-white' : ''">
            Venta
          </div>
          <!-- Badge sutil de estado (Screenshot 1: Plan Pro) -->
          <!-- <div class="status-pill row items-center q-px-sm q-py-xs">
            <span class="status-dot q-mr-xs"></span>
            <span class="text-caption text-weight-bold text-primary">Bodeguita POS</span>
          </div> -->
        </div>

        <div class="row items-center q-gutter-x-xs">
          <!-- Tasa de Dólar rápida -->
          <q-chip v-if="$valor_dolar" dense clickable @click="getProdutos(); $getDolar()"
            class="bg-white text-grey-8 soft-shadow cursor-pointer lt-sm" style="font-size: 11px;">
            ${{ $formatMoney($valor_dolar) }}
          </q-chip>
          <q-btn flat round dense icon="history" color="grey-7" to="/ventas" title="Historial de Ventas" />
          <q-btn flat round dense icon="refresh" color="grey-7" @click="recargarDatos" title="Recargar Productos" />
        </div>
      </div>

      <!-- 2. Selector Segmentado en Píldora: [ Productos ] / [ Escanear ] -->
      <div class="row items-center justify-center q-mb-md">
        <div class="segmented-pill-container row no-wrap" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'">
          <button type="button" class="pill-tab-btn row items-center"
            :class="{ 'pill-tab-active': activeTab === 'productos' }" @click="activeTab = 'productos'">
            <q-icon name="add" size="18px" class="q-mr-xs" />
            <span>Productos</span>
          </button>

          <button type="button" class="pill-tab-btn row items-center"
            :class="{ 'pill-tab-active': activeTab === 'escanear' }" @click="activeTab = 'escanear'">
            <q-icon name="qr_code_scanner" size="18px" class="q-mr-xs" />
            <span>Escanear</span>
          </button>
        </div>
      </div>

      <!-- 3. PESTAÑA 1: MODO CATÁLOGO / PRODUCTOS -->
      <div v-show="activeTab === 'productos'" class="fade-in-section">
        <!-- Cabecera de Catálogo -->
        <div class="row items-center justify-between q-mb-sm q-px-xs">
          <div class="row items-center">
            <div class="text-subtitle1 text-weight-bold text-grey-9" :class="$q.dark.isActive ? 'text-white' : ''">
              Agregar productos
            </div>
          </div>
          <div class="text-caption text-grey-6">
            {{ productosFiltrados.length }} disponibles
          </div>
        </div>

        <!-- Buscador tipo Píldora (Screenshot 3: 'Buscar por código, barras o nombre') -->
        <div class="q-mb-sm">
          <q-input outlined dense rounded v-model="catalogoSearch" :debounce="250" placeholder="Buscar por código, barras o nombre"
            bg-color="white" class="search-pill-input" clearable>
            <template v-slot:prepend>
              <q-icon name="search" color="grey-6" />
            </template>
          </q-input>
        </div>

        <!-- Filtro Horizontal de Categorías (Screenshot 3) -->
        <div class="category-scroll-row row no-wrap q-py-xs q-mb-md q-gutter-x-xs no-scrollbar">
          <div class="filter-pill" :class="filtroCategoria === null ? 'filter-pill-active' : 'filter-pill-inactive'"
            @click="setFiltroCategoria(null)">
            Todos
          </div>

          <div v-for="(cat, idx) in categorias" :key="cat.id" class="filter-pill" :class="[
            filtroCategoria === cat.id ? 'filter-pill-active' : 'filter-pill-inactive',
            getCategoryPastelClass(idx)
          ]" @click="setFiltroCategoria(cat.id)">
            {{ cat.nombre }}
          </div>
        </div>

        <!-- Lista de Tarjetas de Producto con Carga Progresiva (Infinite Scroll) -->
        <q-infinite-scroll ref="infiniteScroll" @load="onLoadMore" :offset="300" :disable="displayLimit >= productosFiltrados.length">
          <div class="column q-gutter-y-xs q-mb-xl" style="padding-bottom: 70px;">
            <div v-for="prod in productosVisibles" :key="prod.id"
              class="modern-card product-catalog-card q-pa-sm row items-center justify-between"
              :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'">
              <div class="row items-center no-wrap col ellipsis q-pr-sm">
                <!-- Miniatura con ícono / empaque -->
                <div class="catalog-thumb flex flex-center q-mr-sm">
                  <q-icon name="inventory_2" size="24px" color="primary" />
                </div>

                <!-- Textos del producto (Screenshot 3) -->
                <div class="col ellipsis">
                  <div class="text-weight-bold text-body2 ellipsis"
                    :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">
                    {{ prod.nombre }}
                  </div>
                  <!-- Código de barras / SKU en mayúscula gris -->
                  <div class="text-caption text-grey-6 text-weight-medium ellipsis text-uppercase"
                    style="font-size: 11px;">
                    {{ prod.codigo_barras || 'SIN-CÓDIGO' }}
                  </div>
                  <!-- Precio y Stock -->
                  <div class="text-caption text-weight-bold text-grey-8 row items-center q-gutter-x-xs"
                    style="font-size: 12px;">
                    <span class="text-primary">Bs {{ $formatMoney(calcularPrecioBs(prod)) }}</span>
                    <span class="text-grey-5">·</span>
                    <span class="text-grey-6">Stock: {{ prod.cantidad }}</span>
                    <span v-if="$valor_dolar" class="text-grey-5">
                      · ${{ $formatMoneyUSD(calcularPrecioUSD(prod)) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Control de Cantidad: [ Menos ] [ Casilla Número ] [ Más ] -->
              <div class="col-auto">
                <!-- Si el producto ya está en el carrito (producto agregado) -->
                <div v-if="getProductCartQty(prod.id) > 0"
                  class="catalog-stepper-control row items-center no-wrap"
                  :class="$q.dark.isActive ? 'bg-grey-8' : 'bg-slate-100'">
                  <!-- 1. Botón Menos -->
                  <button
                    type="button"
                    class="catalog-stepper-btn btn-minus flex flex-center cursor-pointer"
                    @click.stop="disminuirProducto(prod)"
                    title="Disminuir cantidad"
                  >
                    <q-icon name="remove" size="16px" :color="$q.dark.isActive ? 'white' : 'grey-8'" />
                  </button>

                  <!-- 2. Casilla para ingresar el número -->
                  <input
                    type="number"
                    inputmode="numeric"
                    class="catalog-qty-input text-center text-weight-bold"
                    :class="$q.dark.isActive ? 'catalog-qty-input-dark' : 'catalog-qty-input-light'"
                    :value="getProductCartQty(prod.id)"
                    min="1"
                    :max="prod.cantidad"
                    @click.stop
                    @focus="$event.target.select()"
                    @change="onQtyInputChange(prod, $event.target.value, $event)"
                    @keydown.enter="$event.target.blur()"
                    title="Ingresar cantidad"
                  />

                  <!-- 3. Botón Más -->
                  <button
                    type="button"
                    class="catalog-stepper-btn btn-plus flex flex-center cursor-pointer"
                    @click.stop="aumentarProducto(prod)"
                    title="Aumentar cantidad"
                    :disabled="getProductCartQty(prod.id) >= prod.cantidad"
                  >
                    <q-icon name="add" size="16px" color="primary" />
                  </button>
                </div>

                <!-- Si no ha sido agregado, botón circular simple (+) -->
                <button v-else
                  type="button"
                  class="catalog-qty-badge badge-empty flex flex-center cursor-pointer"
                  @click="agregarProductoDirecto(prod)"
                  title="Agregar al carrito"
                >
                  <q-icon name="add" size="18px" />
                </button>
              </div>
            </div>

            <div v-if="productosFiltrados.length === 0" class="text-center q-py-xl text-grey-5">
              <q-icon name="search_off" size="48px" class="q-mb-sm" />
              <div class="text-subtitle1">No se encontraron productos</div>
              <div class="text-caption">Intenta con otro término de búsqueda o categoría</div>
            </div>
          </div>

          <template v-slot:loading>
            <div class="row justify-center q-my-sm">
              <q-spinner-dots color="primary" size="30px" />
            </div>
          </template>
        </q-infinite-scroll>
      </div>

      <!-- 4. PESTAÑA 2: MODO ESCÁNER -->
      <div v-show="activeTab === 'escanear'" class="fade-in-section">
        <!-- Visor de cámara en vivo embebido -->
        <div class="scanner-card-wrapper q-mb-sm">
          <barcode-scanner v-if="activeTab === 'escanear'" ref="barcodeScannerRef" :inline="true" :auto-start="true" mode="continuous"
            @scanned="escanearEnCaja" @close="activeTab = 'productos'" />
        </div>

        <!-- Notificación Toast Inmediata estilo Píldora Verde -->
        <transition name="slide-toast">
          <div v-if="scanBanner.show"
            class="scan-success-banner row items-center justify-between q-py-sm q-px-md q-mb-md">
            <div class="row items-center no-wrap ellipsis text-white text-body2 text-weight-medium">
              <q-icon name="check_circle" size="18px" class="q-mr-sm" />
              <span class="ellipsis">{{ scanBanner.text }}</span>
            </div>
            <q-btn flat round dense icon="close" size="xs" color="white" @click="scanBanner.show = false" />
          </div>
        </transition>

        <!-- Lista de Carrito o Estado Vacío -->
        <CartList :items="lista_compras" @clear="limpiarCarrito" @change-qty="handleQtyChange"
          @remove="eliminarProductoLista" />
      </div>

      <!-- 5. Barra Flotante Inferior Sticky (Screenshots 2 y 4) -->
      <q-page-sticky position="bottom" :offset="[0, 0]" expand v-if="lista_compras.length > 0" style="z-index: 1000;">
        <div class="sticky-bottom-bar row items-center justify-between full-width q-px-md q-py-sm shadow-up-3"
          :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'">
          <div>
            <div class="text-caption text-grey-6 text-weight-medium">
              {{ totalProductosCount }} {{ totalProductosCount === 1 ? 'producto' : 'productos' }}
            </div>
            <div class="row items-baseline q-gutter-x-sm">
              <span class="text-h6 text-weight-bold text-primary">
                Total: Bs {{ $formatMoney(total) }}
              </span>
              <span class="text-caption text-grey-6 text-weight-bold" v-if="$valor_dolar">
                ≈ ${{ $formatMoneyUSD(total / $valor_dolar) }}
              </span>
            </div>
          </div>

          <q-btn unelevated color="primary" class="pill-btn-active q-px-lg text-weight-bold" label="Revisar orden"
            icon-right="arrow_forward" @click="confirmPaymentDialog = true" />
        </div>
      </q-page-sticky>

      <!-- 6. Diálogo 'Revisar orden' (Screenshot 4) -->
      <PaymentDialog v-model="confirmPaymentDialog" :total="total" :items="lista_compras"
        :cliente-nombre="form.cliente_nombre" @select-client="clienteDialog = true" @confirm="onPaymentConfirm" />

      <!-- 7. Diálogo de Selección de Cliente / Fiado -->
      <FiadoDialog v-model="clienteDialog" @confirm="onClienteSelect" />

      <!-- 8. Diálogo de Ticket de Venta Completada -->
      <q-dialog v-model="m_ticket_dialog" persistent>
        <q-card style="min-width: 320px; border-radius: 20px;">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6 text-primary text-weight-bold">Venta Exitosa</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="flex flex-center q-py-md">
            <ticket-venta v-if="ultimaVenta" :venta="ultimaVenta" ref="ticketComponent" />
          </q-card-section>

          <q-card-actions align="center" class="q-pb-md q-gutter-x-sm">
            <q-btn unelevated label="Imprimir Ticket" color="primary" icon="print" class="pill-btn"
              @click="imprimirTicket" />
            <q-btn flat label="Nueva Venta" color="grey-8" class="pill-btn" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

    </div>
  </q-page>
</template>

<script>
import { date } from 'quasar';
import { productosDAO } from '../db/productosDAO';
import { categoriasDAO } from '../db/categoriasDAO';
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
import Decimal from 'decimal.js';
import BarcodeScanner from '../components/BarcodeScanner.vue';
import TicketVenta from '../components/TicketVenta.vue';
import CartList from '../components/CartList.vue';
import PaymentDialog from '../components/PaymentDialog.vue';
import FiadoDialog from '../components/FiadoDialog.vue';

export default {
  name: 'PageIndex',
  components: { BarcodeScanner, TicketVenta, CartList, PaymentDialog, FiadoDialog },
  data() {
    return {
      // Estado de interfaz
      activeTab: 'productos', // 'productos' | 'escanear'
      catalogoSearch: '',
      scanBanner: {
        show: false,
        text: '',
        timer: null
      },

      // Carrito y ventas
      lista_compras: [],
      form: new Ventas(),
      total: 0,
      totalConIGTF: 0,
      montoIGTF: 0,
      descuentoTotal: 0,
      observaciones: '',

      // Opciones de catálogo
      stringOptions: [],
      barcodeMap: {},
      categorias: [],
      filtroCategoria: null,
      batchSize: 10,
      displayLimit: 10,

      // Modales y flujo
      confirmPaymentDialog: false,
      clienteDialog: false,
      m_ticket_dialog: false,
      ultimaVenta: null,
      recommendedProduct: null,

      // Tributos y sugerencias
      tributos: {
        cobrar_iva: false,
        cobrar_igtf: false
      },
      sugerencias_activas: true,

      // Listener de teclado para lector de código de barras físico USB / Bluetooth
      _barcodeBuffer: '',
      _barcodeTimer: null,
      _barcodeKeyHandler: null
    };
  },
  computed: {
    totalProductosCount() {
      return this.lista_compras.reduce((acc, el) => acc + (el.cantidad || 0), 0);
    },
    productosFiltrados() {
      let list = this.stringOptions || [];
      if (this.filtroCategoria !== null) {
        list = list.filter(p => p.categoria_id === this.filtroCategoria);
      }
      if (this.catalogoSearch && this.catalogoSearch.trim()) {
        const q = this.catalogoSearch.trim().toLowerCase();
        list = list.filter(p => {
          const matchName = (p.nombre || '').toLowerCase().includes(q);
          const matchCode = (p.codigo_barras || '').toLowerCase().includes(q);
          return matchName || matchCode;
        });
      }
      return list;
    },
    cartQtyMap() {
      const map = {};
      const list = this.lista_compras;
      for (let i = 0; i < list.length; i++) {
        map[list[i].id] = list[i].cantidad;
      }
      return map;
    },
    productosVisibles() {
      return this.productosFiltrados.slice(0, this.displayLimit);
    }
  },
  watch: {
    catalogoSearch() {
      this.displayLimit = this.batchSize;
      if (this.$refs.infiniteScroll) {
        this.$refs.infiniteScroll.reset();
        this.$refs.infiniteScroll.resume();
      }
    },
    filtroCategoria() {
      this.displayLimit = this.batchSize;
      if (this.$refs.infiniteScroll) {
        this.$refs.infiniteScroll.reset();
        this.$refs.infiniteScroll.resume();
      }
    }
  },
  mounted() {
    this.batchSize = this.calcBatchSize();
    this.displayLimit = this.batchSize;
    this.recargarDatos();
    recommendationService.init();
    this.initBarcodeListener();
  },
  beforeDestroy() {
    this.destroyBarcodeListener();
    if (this.scanBanner.timer) {
      clearTimeout(this.scanBanner.timer);
    }
  },
  methods: {
    async recargarDatos() {
      await Promise.all([
        this.getProdutos(),
        this.loadCategorias(),
        this.loadConfig(),
        this.$getDolar()
      ]);
    },
    async loadCategorias() {
      try {
        this.categorias = await categoriasDAO.get();
      } catch (e) {
        console.error('Error cargando categorías:', e);
      }
    },
    setFiltroCategoria(id) {
      this.filtroCategoria = id;
    },
    getCategoryPastelClass(idx) {
      const colors = ['chip-pastel-blue', 'chip-pastel-purple', 'chip-pastel-teal', 'chip-pastel-amber'];
      return colors[idx % colors.length];
    },
    async loadConfig() {
      try {
        const taxes = await configuracionDAO.get('tributos');
        if (taxes) this.tributos = { ...taxes };
        const sug = await configuracionDAO.get('sugerencias_activas');
        if (sug !== null) this.sugerencias_activas = sug;
      } catch (e) {
        console.error('Error cargando configuración:', e);
      }
    },
    async getProdutos() {
      try {
        const result = await productosDAO.get();
        this.stringOptions = result || [];
        this.barcodeMap = {};
        this.stringOptions.forEach(element => {
          if (element.codigo_barras) {
            this.barcodeMap[element.codigo_barras.trim()] = element.nombre;
          }
        });
      } catch (e) {
        console.error('Error obteniendo productos:', e);
      }
    },

    // Calcula cuántos productos caben en el área visible de la pantalla del teléfono
    calcBatchSize() {
      if (typeof window === 'undefined') return 10;
      // Descontar cabecera, buscador y tabs (~230px de alto)
      const usableHeight = window.innerHeight - 230;
      const cardsInView = Math.ceil(usableHeight / 68);
      // Mínimo 8, máximo 15 tarjetas para cubrir exactamente la pantalla visible
      return Math.max(8, Math.min(15, cardsInView + 2));
    },

    // Carga progresiva de productos conforme el usuario desliza la pantalla
    onLoadMore(index, done) {
      if (this.displayLimit >= this.productosFiltrados.length) {
        done(true);
        return;
      }
      setTimeout(() => {
        this.displayLimit += this.batchSize;
        done();
      }, 50);
    },

    // Retorna la cantidad agregada al carrito para un producto (O(1) lookup optimizado)
    getProductCartQty(productId) {
      return this.cartQtyMap[productId] || 0;
    },

    // Agrega 1 unidad de forma instantánea desde la lista del catálogo (Screenshot 3)
    agregarProductoDirecto(prod) {
      this.agregarProductoALista(prod, 1);
    },

    // Escáner de cámara: recibe el código decodificado
    async escanearEnCaja(codigo) {
      await this.procesarCodigoBarras(codigo);
    },

    // Procesa un código de barras leído por escáner de cámara, lector físico o catálogo
    async procesarCodigoBarras(codigo) {
      if (!codigo) return;
      try {
        const result = await productosDAO.getByBarcode(codigo.trim());
        if (result) {
          this.agregarProductoALista(result, 1);

          // Mostrar banner verde estilo píldora debajo de la cámara (Screenshot 2)
          this.scanBanner.text = `Agregado: ${result.nombre}`;
          this.scanBanner.show = true;
          clearTimeout(this.scanBanner.timer);
          this.scanBanner.timer = setTimeout(() => {
            this.scanBanner.show = false;
          }, 3200);
        } else {
          this.$q.notify({
            type: 'warning',
            message: `Código no encontrado: ${codigo}`,
            caption: 'Verifica que el producto tenga asignado este código de barras',
            icon: 'qr_code_scanner',
            position: 'top',
            timeout: 3500
          });
        }
      } catch (e) {
        console.error('Error procesando código de barras:', e);
        this.$q.notify({ type: 'negative', message: 'Error al buscar el código escaneado' });
      }
    },

    // Cálculo centralizado de precios y adición al carrito
    agregarProductoALista(result, cant = 1) {
      const cantidad = new Decimal(cant);
      const porcentaje = new Decimal(result.porcentaje_ganancia || 0);
      const ivaPorc = new Decimal(result.porcentaje_iva || 0);
      const costo = new Decimal(result.costo || 0);

      // Precio Base en USD
      const precioBaseUsd = costo.mul(new Decimal(1).plus(porcentaje.div(100)));

      let precioFinalUsd = precioBaseUsd;
      let montoIvaUsd = new Decimal(0);

      if (this.tributos.cobrar_iva && ivaPorc.gt(0)) {
        montoIvaUsd = precioBaseUsd.mul(ivaPorc.div(100));
        precioFinalUsd = precioBaseUsd.plus(montoIvaUsd);
      }

      const tasa = new Decimal(this.$valor_dolar || 1);

      // Validar Stock
      const cantidadEnCarrito = this.lista_compras
        .filter(item => item.id === result.id)
        .reduce((acc, item) => acc + item.cantidad, 0);

      if ((cantidad.plus(cantidadEnCarrito)).gt(result.cantidad)) {
        this.$q.notify({
          type: 'negative',
          message: `Stock insuficiente para ${result.nombre}. Disponible: ${result.cantidad}. (En carrito: ${cantidadEnCarrito})`
        });
        return;
      }

      const costoTotalBs = costo.mul(tasa).mul(cantidad);
      const valor_unitario_bs = precioFinalUsd.mul(tasa);
      const monto_total_bs = valor_unitario_bs.mul(cantidad);
      const base_linea_bs = precioBaseUsd.mul(tasa).mul(cantidad);
      const iva_linea_bs = montoIvaUsd.mul(tasa).mul(cantidad);

      const itemExistente = this.lista_compras.find(item => item.id === result.id);

      if (itemExistente) {
        const nuevaCantidad = new Decimal(itemExistente.cantidad).plus(cantidad);
        const nuevoCostoTotal = costo.mul(tasa).mul(nuevaCantidad);
        const nuevoMontoTotal = valor_unitario_bs.mul(nuevaCantidad);
        const nuevaBaseLinea = precioBaseUsd.mul(tasa).mul(nuevaCantidad);
        const nuevaIvaLinea = montoIvaUsd.mul(tasa).mul(nuevaCantidad);

        itemExistente.cantidad = nuevaCantidad.toNumber();
        itemExistente.valor_bs = nuevoMontoTotal.toDecimalPlaces(2).toNumber();
        itemExistente.costo_total_bs = nuevoCostoTotal.toDecimalPlaces(6).toNumber();
        itemExistente.monto_base_bs = nuevaBaseLinea.toDecimalPlaces(2).toNumber();
        itemExistente.monto_iva_bs = nuevaIvaLinea.toDecimalPlaces(2).toNumber();
      } else {
        this.lista_compras.push({
          id: result.id,
          producto: result.nombre,
          valor_bs: monto_total_bs.toDecimalPlaces(2).toNumber(),
          valor_unitario_bs: valor_unitario_bs.toDecimalPlaces(2).toNumber(),
          costo_total_bs: costoTotalBs.toDecimalPlaces(6).toNumber(),
          costo_unitario_bs: costo.mul(tasa).toDecimalPlaces(6).toNumber(),
          cantidad: cantidad.toNumber(),
          valor_dolar: tasa.toNumber(),
          existencia: result.cantidad,
          es_exento: !this.tributos.cobrar_iva || ivaPorc.eq(0),
          tasa_iva: this.tributos.cobrar_iva ? ivaPorc.toNumber() : 0,
          monto_base_bs: base_linea_bs.toDecimalPlaces(2).toNumber(),
          monto_iva_bs: iva_linea_bs.toDecimalPlaces(2).toNumber()
        });
      }

      this.recalcularTotal();
      this.checkRecommendation(result.id);
    },

    calcularPrecioBs(prod) {
      if (!prod) return 0;
      const porcentaje = new Decimal(prod.porcentaje_ganancia || 0);
      const ivaPorc = new Decimal(prod.porcentaje_iva || 0);
      const costo = new Decimal(prod.costo || 0);
      const precioBaseUsd = costo.mul(new Decimal(1).plus(porcentaje.div(100)));
      let precioFinalUsd = precioBaseUsd;
      if (this.tributos.cobrar_iva && ivaPorc.gt(0)) {
        precioFinalUsd = precioBaseUsd.plus(precioBaseUsd.mul(ivaPorc.div(100)));
      }
      const tasa = new Decimal(this.$valor_dolar || 1);
      return precioFinalUsd.mul(tasa).toDecimalPlaces(2).toNumber();
    },

    calcularPrecioUSD(prod) {
      if (!prod) return 0;
      const porcentaje = new Decimal(prod.porcentaje_ganancia || 0);
      const ivaPorc = new Decimal(prod.porcentaje_iva || 0);
      const costo = new Decimal(prod.costo || 0);
      const precioBaseUsd = costo.mul(new Decimal(1).plus(porcentaje.div(100)));
      let precioFinalUsd = precioBaseUsd;
      if (this.tributos.cobrar_iva && ivaPorc.gt(0)) {
        precioFinalUsd = precioBaseUsd.plus(precioBaseUsd.mul(ivaPorc.div(100)));
      }
      return precioFinalUsd.toDecimalPlaces(2).toNumber();
    },

    actualizarCantidadItem(index, nuevaCantidad) {
      const item = this.lista_compras[index];
      if (!item) return;

      if (nuevaCantidad <= 0) {
        this.lista_compras.splice(index, 1);
        this.recalcularTotal();
        return;
      }

      if (nuevaCantidad > item.existencia) {
        this.$q.notify({
          type: 'negative',
          message: `Stock insuficiente. Disponible: ${item.existencia}`
        });
        nuevaCantidad = item.existencia;
      }

      const precioUnit = new Decimal(item.valor_unitario_bs);
      const costoUnit = new Decimal(item.costo_unitario_bs);
      const cantDec = new Decimal(nuevaCantidad);

      item.cantidad = nuevaCantidad;
      item.valor_bs = precioUnit.mul(cantDec).toDecimalPlaces(2).toNumber();
      item.costo_total_bs = costoUnit.mul(cantDec).toDecimalPlaces(6).toNumber();

      if (!item.es_exento) {
        const baseUnit = precioUnit.div(new Decimal(1).plus(new Decimal(item.tasa_iva).div(100)));
        const ivaUnit = precioUnit.minus(baseUnit);
        item.monto_base_bs = baseUnit.mul(cantDec).toDecimalPlaces(2).toNumber();
        item.monto_iva_bs = ivaUnit.mul(cantDec).toDecimalPlaces(2).toNumber();
      } else {
        item.monto_base_bs = item.valor_bs;
        item.monto_iva_bs = 0;
      }

      this.recalcularTotal();
    },

    handleQtyChange({ index, delta }) {
      const item = this.lista_compras[index];
      if (!item) return;
      this.actualizarCantidadItem(index, item.cantidad + delta);
    },

    disminuirProducto(prod) {
      const index = this.lista_compras.findIndex(i => i.id === prod.id);
      if (index > -1) {
        this.actualizarCantidadItem(index, this.lista_compras[index].cantidad - 1);
      }
    },

    aumentarProducto(prod) {
      const index = this.lista_compras.findIndex(i => i.id === prod.id);
      if (index > -1) {
        this.actualizarCantidadItem(index, this.lista_compras[index].cantidad + 1);
      } else {
        this.agregarProductoALista(prod, 1);
      }
    },

    onQtyInputChange(prod, val, event) {
      const parsed = parseFloat(val);
      const index = this.lista_compras.findIndex(i => i.id === prod.id);

      if (isNaN(parsed) || parsed <= 0) {
        if (index > -1) {
          this.eliminarProductoLista(index);
        }
        if (event && event.target) {
          event.target.value = 0;
        }
        return;
      }

      if (index > -1) {
        this.actualizarCantidadItem(index, parsed);
        if (event && event.target) {
          event.target.value = this.getProductCartQty(prod.id);
        }
      } else {
        this.agregarProductoALista(prod, parsed);
        if (event && event.target) {
          event.target.value = this.getProductCartQty(prod.id);
        }
      }
    },

    eliminarProductoLista(index) {
      this.lista_compras.splice(index, 1);
      this.recalcularTotal();
    },

    limpiarCarrito() {
      this.lista_compras = [];
      this.total = 0;
      this.totalConIGTF = 0;
    },

    recalcularTotal() {
      this.total = this.lista_compras.reduce((acc, el) => new Decimal(acc).plus(el.valor_bs).toNumber(), 0);
      if (['Efectivo $', 'Zelle'].includes(this.form.metodo_pago) && this.tributos.cobrar_igtf) {
        this.calcularIGTF();
      } else {
        this.totalConIGTF = this.total;
      }
    },

    calcularIGTF() {
      if (this.tributos.cobrar_igtf) {
        this.montoIGTF = new Decimal(this.total).mul(0.03).toDecimalPlaces(2).toNumber();
        this.totalConIGTF = new Decimal(this.total).plus(this.montoIGTF).toNumber();
      }
    },

    // Selección de cliente desde FiadoDialog o PaymentDialog
    onClienteSelect({ cliente_id, cliente_nombre }) {
      this.form.cliente_id = cliente_id;
      this.form.cliente_nombre = cliente_nombre;
      this.$q.notify({
        type: 'positive',
        message: `Cliente asignado: ${cliente_nombre}`,
        position: 'top',
        timeout: 2000
      });
    },

    // Callback de confirmación desde PaymentDialog (Screenshot 4)
    onPaymentConfirm({ metodo_pago, observaciones, descuento, totalFinal }) {
      this.form.metodo_pago = metodo_pago;
      this.observaciones = observaciones;
      this.descuentoTotal = descuento || 0;
      if (totalFinal !== undefined) {
        this.totalConIGTF = totalFinal;
      }

      if (metodo_pago === 'Fiado') {
        if (!this.form.cliente_id) {
          this.clienteDialog = true;
          return;
        }
        this.form.estado = 'PENDIENTE';
        this.save(true);
      } else {
        this.save();
      }
    },

    async save(isFiadoConfirmed = false) {
      this.$q.loading.show();
      this.form.create_at = this.$getFechaCreacion();
      this.form.total = this.totalConIGTF || this.total;
      this.form.productos = this.lista_compras;

      let monto_exento = new Decimal(0);
      let monto_base = new Decimal(0);
      let monto_iva = new Decimal(0);

      this.lista_compras.forEach(item => {
        if (item.es_exento) {
          monto_exento = monto_exento.plus(item.valor_bs);
        } else {
          monto_base = monto_base.plus(item.monto_base_bs);
          monto_iva = monto_iva.plus(item.monto_iva_bs);
        }
      });

      this.form.monto_exento = monto_exento.toDecimalPlaces(2).toNumber();
      this.form.monto_base = monto_base.toDecimalPlaces(2).toNumber();
      this.form.monto_iva = monto_iva.toDecimalPlaces(2).toNumber();
      this.form.tasa_iva = 16;
      this.form.monto_igtf = this.montoIGTF;
      this.form.tasa_dolar = this.$valor_dolar;

      if (['Efectivo $', 'Zelle'].includes(this.form.metodo_pago)) {
        this.form.monto_dolar = new Decimal(this.total).div(this.$valor_dolar).toDecimalPlaces(2).toNumber();
      } else {
        this.form.monto_dolar = 0;
      }

      this.form.observaciones = this.observaciones;

      try {
        let currentSeq = 1;
        let ventaId = null;

        await db.transaction('rw', [db.ventas, db.movimientos, db.productos, db.configuracion], async () => {
          const seqObj = await db.configuracion.get('secuencia_factura');
          currentSeq = seqObj ? Number(seqObj.value) + 1 : 1;
          this.form.numero_factura = currentSeq;

          ventaId = await db.ventas.add(this.form);
          await db.configuracion.put({ key: 'secuencia_factura', value: currentSeq });

          for (const element of this.lista_compras) {
            const movimiento = new Movimientos();
            movimiento.producto_id = element.id;
            movimiento.tipo = 'SALIDA';
            movimiento.cantidad = element.cantidad;
            movimiento.fecha = Date.now();
            movimiento.referencia = `Venta #${ventaId} (Fac: ${currentSeq})`;
            movimiento.create_at = this.$getFechaCreacion();

            await db.movimientos.add(movimiento);

            const producto = await db.productos.get(element.id);
            if (producto) {
              let resta_producto = producto.cantidad - element.cantidad;
              await db.productos.update(element.id, { cantidad: resta_producto });
            }
          }
        });

        this.ultimaVenta = JSON.parse(JSON.stringify(this.form));
        this.ultimaVenta.id = ventaId;

        this.form = new Ventas();
        this.form.cliente_id = null;
        this.form.cliente_nombre = null;
        this.form.estado = 'PAGADO';
        this.montoIGTF = 0;
        this.totalConIGTF = 0;
        this.lista_compras = [];
        this.total = 0;
        this.observaciones = '';
        this.$q.loading.hide();

        recommendationService.train();

        this.$q.notify({
          position: 'top',
          type: 'positive',
          message: `Venta #${currentSeq} registrada exitosamente`,
          icon: 'check_circle'
        });

        this.m_ticket_dialog = true;
      } catch (e) {
        console.error(`Error guardando venta: ${e.stack || e}`);
        this.$q.loading.hide();
        this.$q.notify({
          position: 'top',
          type: 'negative',
          message: `Error al guardar venta: ${e.message}`
        });
      }
    },

    imprimirTicket() {
      window.print();
    },

    async checkRecommendation(productId) {
      if (!this.sugerencias_activas) return;
      try {
        const excludedIds = this.lista_compras.map(item => item.id);
        const recommendation = await recommendationService.getRecommendation(productId, excludedIds);
        if (recommendation) {
          this.recommendedProduct = recommendation;
          this.$q.notify({
            message: `💡 Sugerencia: Clientes también llevan ${recommendation.nombre}`,
            color: 'primary',
            icon: 'lightbulb',
            position: 'bottom-right',
            timeout: 6000,
            actions: [
              { label: 'Omitir', color: 'white' },
              {
                label: 'Agregar',
                color: 'amber',
                handler: () => {
                  this.agregarProductoALista(this.recommendedProduct, 1);
                }
              }
            ]
          });
        }
      } catch (e) {
        console.error('Error recomendación:', e);
      }
    },

    // Listener global de teclado para lectores de código de barras USB/Bluetooth físicos
    initBarcodeListener() {
      const BARCODE_MIN_LENGTH = 4;
      const BARCODE_MAX_DELAY = 80;

      this._barcodeBuffer = '';
      this._barcodeTimer = null;

      this._barcodeKeyHandler = (e) => {
        if (this.confirmPaymentDialog || this.clienteDialog) return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        // Si el usuario está escribiendo activamente en el input de búsqueda del catálogo
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

        if (e.key === 'Enter') {
          if (this._barcodeBuffer.length >= BARCODE_MIN_LENGTH) {
            const codigo = this._barcodeBuffer;
            this._barcodeBuffer = '';
            clearTimeout(this._barcodeTimer);
            this.procesarCodigoBarras(codigo);
          } else {
            this._barcodeBuffer = '';
          }
          return;
        }

        if (e.key.length === 1) {
          this._barcodeBuffer += e.key;
          clearTimeout(this._barcodeTimer);
          this._barcodeTimer = setTimeout(() => {
            this._barcodeBuffer = '';
          }, BARCODE_MAX_DELAY);
        }
      };

      window.addEventListener('keydown', this._barcodeKeyHandler);
    },

    destroyBarcodeListener() {
      if (this._barcodeKeyHandler) {
        window.removeEventListener('keydown', this._barcodeKeyHandler);
        this._barcodeKeyHandler = null;
      }
      clearTimeout(this._barcodeTimer);
    }
  }
};
</script>

<style scoped>
.pos-container {
  max-width: 680px;
}

.bg-slate-50 {
  background-color: #F8FAFC;
}

/* Status Pill en la barra superior (Screenshot 1: Plan Pro) */
.status-pill {
  background-color: #E8F5F1;
  border-radius: 9999px;
  border: 1px solid rgba(13, 104, 79, 0.15);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #0D684F;
}

/* Switcher de Píldoras Superior (Screenshots 1, 2 y 3) */
.segmented-pill-container {
  border-radius: 9999px;
  padding: 4px;
  gap: 4px;
}

.pill-tab-btn {
  border: none;
  background: transparent;
  padding: 8px 24px;
  border-radius: 9999px;
  font-size: 0.92rem;
  font-weight: 600;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pill-tab-active {
  background-color: #0D684F !important;
  color: #FFFFFF !important;
  box-shadow: 0 2px 8px rgba(13, 104, 79, 0.25);
}

/* Banner Notificación Toast Inmediata (Screenshot 2: 'Agregado: ...') */
.scan-success-banner {
  background-color: #0D684F;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(13, 104, 79, 0.25);
}

.slide-toast-enter-active,
.slide-toast-leave-active {
  transition: all 0.25s ease-out;
}

.slide-toast-enter,
.slide-toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Buscador en Catálogo (Screenshot 3) */
.search-pill-input :deep(.q-field__control) {
  border-radius: 9999px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

/* Categorías con scroll horizontal */
.category-scroll-row {
  overflow-x: auto;
}

.chip-pastel-blue {
  background-color: #E0F2FE;
  color: #0369A1;
  border-color: #BAE6FD;
}

.chip-pastel-purple {
  background-color: #E8F5F1;
  color: #0D684F;
  border-color: #A7F3D0;
}

.chip-pastel-teal {
  background-color: #CCFBF1;
  color: #0F766E;
  border-color: #99F6E4;
}

.chip-pastel-amber {
  background-color: #FEF3C7;
  color: #B45309;
  border-color: #FDE68A;
}

/* Tarjetas de Producto en Catálogo (Screenshot 3) */
.product-catalog-card {
  border-radius: 14px;
  padding: 8px 12px;
}

.catalog-thumb {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background-color: #E8F5F1;
  flex-shrink: 0;
}

/* Badge Circular Verde de Cantidad (Screenshot 3) */
.catalog-qty-badge {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  transition: all 0.15s ease;
}

.badge-in-cart {
  background-color: #0D684F;
  color: #FFFFFF;
  box-shadow: 0 2px 6px rgba(13, 104, 79, 0.3);
}

.badge-empty {
  background-color: #E8F5F1;
  color: #0D684F;
}

.badge-empty:hover {
  background-color: #0D684F;
  color: #FFFFFF;
}

/* Stepper en Tarjeta de Catálogo: [ - ] [ Casilla ] [ + ] */
.catalog-stepper-control {
  border-radius: 9999px;
  padding: 2px 4px;
  gap: 3px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.catalog-stepper-btn {
  width: 26px;
  height: 26px;
  min-width: 26px;
  border-radius: 50%;
  border: none;
  background: transparent;
  padding: 0;
  transition: all 0.15s ease;
}

.catalog-stepper-btn:hover {
  background-color: rgba(13, 104, 79, 0.12);
}

.catalog-stepper-btn:active {
  transform: scale(0.9);
}

.catalog-stepper-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.catalog-qty-input {
  width: 42px;
  height: 26px;
  border-radius: 6px;
  font-size: 13px;
  padding: 0 2px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.catalog-qty-input-light {
  background-color: #FFFFFF;
  color: #0F172A;
  border: 1px solid #CBD5E1;
}

.catalog-qty-input-dark {
  background-color: #1E293B;
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.catalog-qty-input:focus {
  border-color: #0D684F !important;
  box-shadow: 0 0 0 2px rgba(13, 104, 79, 0.2) !important;
}

/* Ocultar flechas numéricas nativas en todos los navegadores */
.catalog-qty-input::-webkit-outer-spin-button,
.catalog-qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.catalog-qty-input[type=number] {
  -moz-appearance: textfield;
}

/* Barra Flotante Inferior Sticky (Screenshot 2) */
.sticky-bottom-bar {
  border-top: 1px solid #E2E8F0;
  max-width: 680px;
  margin: 0 auto;
  border-radius: 18px 18px 0 0;
}

.fade-in-section {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
