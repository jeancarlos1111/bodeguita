<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="row items-center justify-between no-wrap q-mb-md">
      <div class="text-h5 text-primary text-weight-bold col">Cierre de Caja (Reporte Z)</div>
      <q-btn color="primary" icon-right="share" label="Compartir" outline @click="compartirReporte"
        v-if="totalVenta > 0" class="col-auto q-ml-sm" />
    </div>

    <!-- Date Filter -->
    <q-card class="rounded-card shadow-1 q-mb-md bg-white">
      <q-card-section>
        <div class="row q-col-gutter-sm items-center">
          <div class="col-12 col-md-4">
            <q-input filled v-model="fecha" mask="date" :rules="['date']" label="Fecha de Cierre"
              class="rounded-borders">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="fecha" @input="cargarDatos" color="primary">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Cerrar" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-8 text-right">
            <div class="text-caption text-grey">Ultima actualización: {{ updated_at }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Resumen General Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-card class="bg-primary text-white rounded-card shadow-2">
          <q-card-section>
            <div class="text-subtitle2 text-indigo-2">Venta Total</div>
            <div class="text-h4 text-indigo-1 text-weight-bold">Bs {{ formatMoney(totalVenta) }}</div>
            <div class="text-caption text-indigo-1" v-if="valor_dolar">
              ≈ $ {{ formatMoneyUSD(totalVenta / valor_dolar) }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="bg-white text-dark rounded-card shadow-2">
          <q-card-section>
            <div class="text-subtitle2 text-grey-7">Ganancia Estimada</div>
            <div class="text-h4 text-weight-bold text-positive">Bs {{ formatMoney(totalGanancia) }}</div>
            <div class="text-caption text-grey" v-if="valor_dolar">
              ≈ $ {{ formatMoneyUSD(totalGanancia / valor_dolar) }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="bg-white text-dark rounded-card shadow-2">
          <q-card-section>
            <div class="text-subtitle2 text-grey-7">Transacciones</div>
            <div class="text-h4 text-weight-bold">{{ ventas.length }}</div>
            <div class="text-caption text-grey">Registros de venta</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Desglose por Método de Pago -->
    <div class="text-h6 q-mb-sm text-grey-8">Desglose por Método de Pago</div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-4" v-for="(monto, metodo) in desglosePagos" :key="metodo">
        <q-card class="rounded-card shadow-1">
          <q-card-section class="row items-center">
            <q-avatar color="indigo-1" text-color="primary" icon="payments" size="md" class="q-mr-md" />
            <div>
              <div class="text-caption text-grey">{{ metodo || 'Sin especificar' }}</div>
              <div class="text-h6 text-primary text-weight-bold">Bs {{ formatMoney(monto) }}</div>
              <div class="text-caption text-grey-6" v-if="valor_dolar">
                $ {{ formatMoneyUSD(monto / valor_dolar) }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Fiscal Report Action -->
    <div class="row justify-center q-mb-xl q-gutter-md">
      <q-btn label="Reporte X (Corte)" icon="content_cut" color="indigo-6" class="q-px-xl" rounded unelevated
        @click="abrirReporte('X')" style="width: 350px" />
      <q-btn label="Vista Fiscal (SENIAT)" icon="receipt" color="secondary" class="q-px-xl" rounded unelevated
        @click="abrirReporte('Z')" style="width: 350px" />
    </div>

    <!-- Fiscal Dialog -->
    <q-dialog v-model="modalFiscal">
      <q-card style="width: 400px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none print-hide">
          <div class="text-h6">Reporte {{ tipoReporte }}</div>
          <q-space />
          <q-btn icon="print" flat round color="primary" @click="imprimirFiscal" />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-sm scroll"
          style="max-height: 70vh; font-family: 'Courier New', Courier, monospace;">
          <div class="text-center q-mb-md">
            <div class="text-weight-bold">{{ negocio.nombre }}</div>
            <div class="text-caption">RIF: {{ negocio.rif }}</div>
            <div class="text-caption">Dirección Fiscal: {{ negocio.direccion }}</div>
          </div>

          <div class="text-center q-py-sm border-y">
            <div class="text-weight-bold">{{ tituloReporte }}</div>
            <div v-if="tipoReporte === 'Z'">Nro: {{ reporteNumero }}</div>
          </div>

          <div class="row justify-between q-mt-sm">
            <div>Fecha: {{ fecha }}</div>
            <div>Hora: {{ updated_at }}</div>
          </div>
          <div class="row justify-between">
            <div>Fac. Inicial:</div>
            <div>{{ facInicial }}</div>
          </div>
          <div class="row justify-between">
            <div>Fac. Final:</div>
            <div>{{ facFinal }}</div>
          </div>
          <div class="row justify-between">
            <div>Cant. Facturas:</div>
            <div>{{ ventas.length }}</div>
          </div>

          <q-separator class="q-my-sm" />

          <div class="row justify-between text-weight-bold">
            <div>DESCRIPCION</div>
            <div>MONTO</div>
          </div>

          <!-- Totales Fiscales -->
          <!-- Solo mostrar si la configuración lo permite -->
          <div v-if="tributos.cobrar_iva">
            <div class="row justify-between q-mt-xs">
              <div>Exento (E)</div>
              <div>{{ formatMoney(fiscal.exento) }}</div>
            </div>
            <div class="row justify-between">
              <div>Base Imponible (G) 16%</div>
              <div>{{ formatMoney(fiscal.base) }}</div>
            </div>
            <div class="row justify-between">
              <div>Impuesto (IVA) 16%</div>
              <div>{{ formatMoney(fiscal.iva) }}</div>
            </div>
          </div>

          <div v-if="tributos.cobrar_igtf && fiscal.igtf > 0">
            <div class="row justify-between">
              <div>IGTF (3%)</div>
              <div>{{ formatMoney(fiscal.igtf) }}</div>
            </div>
          </div>

          <!-- Si NO cobra impuestos, mostrar resumen simple -->
          <div v-if="!tributos.cobrar_iva && !tributos.cobrar_igtf">
            <div class="row justify-between q-mt-xs">
              <div>Ventas Exentas</div>
              <div>{{ formatMoney(totalVenta) }}</div>
            </div>
          </div>

          <q-separator class="q-my-sm" />

          <div class="row justify-between text-h6 text-weight-bold">
            <div>TOTAL VENTAS</div>
            <div>{{ formatMoney(totalVenta) }}</div>
          </div>

          <q-separator class="q-my-sm dashed" />

          <div class="text-center q-mt-lg">
            <div class="text-weight-bold">MH-1234567890</div>
            <div class="text-caption">NO FISCAL - REFERENCIAL</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import { date } from 'quasar'
import { ventasDAO } from '../db/ventasDAO'
import { valor_dolarDAO } from '../db/valor_dolarDAO'
import { productosDAO } from '../db/productosDAO'
import { configuracionDAO } from '../db/configuracionDAO'

export default {
  name: 'CierreCaja',
  data() {
    return {
      fecha: date.formatDate(Date.now(), 'YYYY/MM/DD'),
      ventas: [],
      valor_dolar: null,
      updated_at: '',
      modalFiscal: false,
      tipoReporte: 'Z',
      negocio: {
        nombre: 'BODEGUITA',
        rif: 'J-12345678-9',
        direccion: 'Calle Principal, Local 1'
      },
      tributos: {
        cobrar_iva: false,
        cobrar_igtf: false
      }
    }
  },
  computed: {
    tituloReporte() {
      return this.tipoReporte === 'Z' ? 'REPORTE GLOBAL Z' : 'REPORTE X - CORTE';
    },
    totalVenta() {
      return this.ventas.reduce((sum, venta) => sum + (venta.total || 0), 0);
    },
    totalCosto() {
      // Calcular costo total iterando sobre productos de cada venta
      return this.ventas.reduce((sumVentas, venta) => {
        const costoVenta = venta.productos.reduce((sumProd, prod) => sumProd + (prod.costo_total_bs || 0), 0);
        return sumVentas + costoVenta;
      }, 0);
    },
    totalGanancia() {
      return this.totalVenta - this.totalCosto;
    },
    desglosePagos() {
      const desglose = {};
      this.ventas.forEach(venta => {
        const metodo = venta.metodo_pago || 'Desconocido';
        if (!desglose[metodo]) desglose[metodo] = 0;
        desglose[metodo] += venta.total || 0;
      });
      return desglose;
    },
    // Fiscal Computeds
    facInicial() {
      if (this.ventas.length === 0) return '000000';
      const minVal = Math.min(...this.ventas.map(v => v.numero_factura || v.id));
      return minVal.toString().padStart(6, '0');
    },
    facFinal() {
      if (this.ventas.length === 0) return '000000';
      const maxVal = Math.max(...this.ventas.map(v => v.numero_factura || v.id));
      return maxVal.toString().padStart(6, '0');
    },
    reporteNumero() {
      return date.formatDate(Date.now(), 'YYDDD');
    },
    fiscal() {
      let exento = 0;
      let base = 0;
      let iva = 0;
      let igtf = 0;

      this.ventas.forEach(venta => {
        // Use stored fiscal values if available (new logic)
        // Fallback to estimation if old record and config is active? No, just use 0 if not present.

        exento += (venta.monto_exento || 0);
        base += (venta.monto_base || 0);
        iva += (venta.monto_iva || 0);
        igtf += (venta.monto_igtf || 0);

        // Fallback for legacy data if taxes are enabled now but weren't before?
        // If config is enabled but sales have 0, they appear as exento essentially or 0 base.
        // Better not to 'guess' tax on legacy records for Z reports, keep it factual.
        // "If it wasn't recorded as tax, it's not tax".
      });

      // Legacy Hack: If I enabled taxes TODAY but have previous sales in the same day that didn't have tax fields?
      // They will contribute to `totalVenta` but not to `base/iva`.
      // The math: Total != Exento + Base + Iva + IGTF.
      // So `Resto = Total - (Exento + Base + Iva + IGTF)`. Classification? Untaxed/Exento.

      const recorded = exento + base + iva + igtf;
      const remainder = this.totalVenta - recorded;

      if (remainder > 0.01) { // Floating point tolerance
        exento += remainder;
      }

      return {
        exento: exento,
        base: base,
        iva: iva,
        igtf: igtf
      }
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      await this.getDolar();
      await this.cargarConfig();
      await this.cargarDatos();
    },
    abrirReporte(tipo) {
      this.tipoReporte = tipo;
      this.modalFiscal = true;
    },
    async cargarConfig() {
      const datos = await configuracionDAO.getInstance().get('datos_negocio');
      if (datos) {
        this.negocio = datos;
        if (!this.negocio.nombre) this.negocio.nombre = 'BODEGUITA';
        if (!this.negocio.rif) this.negocio.rif = 'J-12345678-9';
        if (!this.negocio.direccion) this.negocio.direccion = 'Calle Principal';
      }

      const taxes = await configuracionDAO.getInstance().get('tributos');
      if (taxes) {
        this.tributos = { ...taxes };
      }
    },
    async getDolar() {
      const result = await valor_dolarDAO.getInstance().getUltimo();
      if (result) this.valor_dolar = result.valor_dolar;
    },
    async cargarDatos() {
      this.$q.loading.show();
      try {
        this.ventas = await ventasDAO.getInstance().get(this.fecha, this.fecha);
        this.updated_at = date.formatDate(Date.now(), 'HH:mm:ss');
      } catch (e) {
        console.error(e);
        this.$q.notify({ type: 'negative', message: 'Error cargando ventas' });
      } finally {
        this.$q.loading.hide();
      }
    },
    formatMoney(amount) {
      return new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    },
    formatMoneyUSD(amount) {
      return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    },
    async imprimirFiscal() {
      await this.$nextTick();
      window.print();
    },
    compartirReporte() {
      let mensaje = `*Reporte Z - ${this.fecha}*\n\n`;
      mensaje += `*Venta Total:* Bs ${this.formatMoney(this.totalVenta)}\n`;
      if (this.valor_dolar) mensaje += `*Equivalente:* $ ${this.formatMoneyUSD(this.totalVenta / this.valor_dolar)}\n`;
      mensaje += `*Transacciones:* ${this.ventas.length}\n\n`;

      mensaje += `*Desglose por Pago:*\n`;
      for (const [metodo, monto] of Object.entries(this.desglosePagos)) {
        mensaje += `- ${metodo}: Bs ${this.formatMoney(monto)}\n`;
      }

      if (this.tributos.cobrar_iva) {
        mensaje += `\n*Fiscal:*\n`;
        mensaje += `Base: ${this.formatMoney(this.fiscal.base)}\n`;
        mensaje += `IVA: ${this.formatMoney(this.fiscal.iva)}\n`;
      }

      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
    }
  }
}
</script>

<style scoped>
.rounded-card {
  border-radius: 16px;
}

.dashed {
  border-style: dashed;
}

.border-y {
  border-top: 1px dashed black;
  border-bottom: 1px dashed black;
}

@media print {

  /* Hide everything NOT the fiscal dialog content if modal is open? 
       Actually, printing a specific div is tricky in Vue without a library.
       Simple hack: Use a print-only class or hide other elements.
    */
  body * {
    visibility: hidden;
  }

  .q-dialog,
  .q-dialog * {
    visibility: visible;
  }

  .q-dialog {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    background: white;
  }

  .q-card {
    box-shadow: none !important;
    border: none !important;
  }

  .print-hide {
    display: none !important;
  }
}
</style>
