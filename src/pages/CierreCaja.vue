<template>
  <q-page class="q-pa-md ">
    <div class="row items-center justify-between no-wrap q-mb-md">
      <div class="text-h5 text-primary text-weight-bold col">Cierre de Caja (Reporte Z)</div>
      <q-btn color="primary" icon-right="share" label="Compartir" outline @click="compartirReporte"
        v-if="totalVenta > 0" class="col-auto q-ml-sm" />
    </div>

    <!-- Date Filter -->
    <q-card class="rounded-card shadow-1 q-mb-md ">
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
            <div class="text-h4 text-indigo-1 text-weight-bold">Bs {{ m_formatMoney(totalVenta) }}</div>
            <div class="text-caption text-indigo-1" v-if="m_valor_dolar">
              ≈ $ {{ m_formatMoneyUSD(totalVenta / m_valor_dolar) }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class=" text-dark rounded-card shadow-2">
          <q-card-section>
            <div class="text-subtitle2 text-grey-7">Ganancia Estimada</div>
            <div class="text-h4 text-weight-bold text-positive">Bs {{ m_formatMoney(totalGanancia) }}</div>
            <div class="text-caption text-grey" v-if="m_valor_dolar">
              ≈ $ {{ m_formatMoneyUSD(totalGanancia / m_valor_dolar) }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class=" text-dark rounded-card shadow-2">
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
              <div class="text-h6 text-primary text-weight-bold">Bs {{ m_formatMoney(monto) }}</div>
              <div class="text-caption text-grey-6" v-if="m_valor_dolar">
                $ {{ m_formatMoneyUSD(monto / m_valor_dolar) }}
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
              <div>{{ m_formatMoney(fiscal.exento) }}</div>
            </div>
            <div class="row justify-between">
              <div>Base Imponible (G) 16%</div>
              <div>{{ m_formatMoney(fiscal.base) }}</div>
            </div>
            <div class="row justify-between">
              <div>Impuesto (IVA) 16%</div>
              <div>{{ m_formatMoney(fiscal.iva) }}</div>
            </div>
          </div>

          <div v-if="tributos.cobrar_igtf && fiscal.igtf > 0">
            <div class="row justify-between">
              <div>IGTF (3%)</div>
              <div>{{ m_formatMoney(fiscal.igtf) }}</div>
            </div>
          </div>

          <!-- Si NO cobra impuestos, mostrar resumen simple -->
          <div v-if="!tributos.cobrar_iva && !tributos.cobrar_igtf">
            <div class="row justify-between q-mt-xs">
              <div>Ventas Exentas</div>
              <div>{{ m_formatMoney(totalVenta) }}</div>
            </div>
          </div>

          <q-separator class="q-my-sm" />

          <div class="row justify-between text-h6 text-weight-bold">
            <div>TOTAL VENTAS</div>
            <div>{{ m_formatMoney(totalVenta) }}</div>
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
import Decimal from 'decimal.js';

export default {
  name: 'CierreCaja',
  data() {
    return {
      fecha: date.formatDate(Date.now(), 'YYYY/MM/DD'),
      ventas: [],
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
      return this.ventas.reduce((sum, venta) => new Decimal(sum).plus(venta.total || 0).toNumber(), 0);
    },
    totalCosto() {
      // Calcular costo total iterando sobre productos de cada venta
      return this.ventas.reduce((sumVentas, venta) => {
        const costoVenta = venta.productos.reduce((sumProd, prod) => new Decimal(sumProd).plus(prod.costo_total_bs || 0), 0);
        return new Decimal(sumVentas).plus(costoVenta).toNumber();
      }, 0);
    },
    totalGanancia() {
      return new Decimal(this.totalVenta).minus(this.totalCosto).toNumber();
    },
    desglosePagos() {
      const desglose = {};
      this.ventas.forEach(venta => {
        const metodo = venta.metodo_pago || 'Desconocido';
        if (!desglose[metodo]) desglose[metodo] = 0;
        desglose[metodo] = new Decimal(desglose[metodo]).plus(venta.total || 0).toNumber();
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
      let exento = new Decimal(0);
      let base = new Decimal(0);
      let iva = new Decimal(0);
      let igtf = new Decimal(0);

      this.ventas.forEach(venta => {
        // Use stored fiscal values if available (new logic)
        // Fallback to estimation if old record and config is active? No, just use 0 if not present.

        exento = exento.plus(venta.monto_exento || 0);
        base = base.plus(venta.monto_base || 0);
        iva = iva.plus(venta.monto_iva || 0);
        igtf = igtf.plus(venta.monto_igtf || 0);

        // Fallback for legacy data if taxes are enabled now but weren't before?
        // If config is enabled but sales have 0, they appear as exento essentially or 0 base.
        // Better not to 'guess' tax on legacy records for Z reports, keep it factual.
        // "If it wasn't recorded as tax, it's not tax".
      });

      // Legacy Hack: If I enabled taxes TODAY but have previous sales in the same day that didn't have tax fields?
      // They will contribute to `totalVenta` but not to `base/iva`.
      // The math: Total != Exento + Base + Iva + IGTF.
      // So `Resto = Total - (Exento + Base + Iva + IGTF)`. Classification? Untaxed/Exento.

      const recorded = exento.plus(base).plus(iva).plus(igtf);
      const remainder = new Decimal(this.totalVenta).minus(recorded);

      if (remainder.gt(0.01)) { // Floating point tolerance check is still valid conceptually but we use Decimal
        exento = exento.plus(remainder);
      }

      return {
        exento: exento.toNumber(),
        base: base.toNumber(),
        iva: iva.toNumber(),
        igtf: igtf.toNumber()
      }
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      await this.m_getDolar();
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
    async imprimirFiscal() {
      await this.$nextTick();
      window.print();
    },
    compartirReporte() {
      let mensaje = `*Reporte Z - ${this.fecha}*\n\n`;
      mensaje += `*Venta Total:* Bs ${this.m_formatMoney(this.totalVenta)}\n`;
      if (this.m_valor_dolar) mensaje += `*Equivalente:* $ ${this.m_formatMoneyUSD(this.totalVenta / this.m_valor_dolar)}\n`;
      mensaje += `*Transacciones:* ${this.ventas.length}\n\n`;

      mensaje += `*Desglose por Pago:*\n`;
      for (const [metodo, monto] of Object.entries(this.desglosePagos)) {
        mensaje += `- ${metodo}: Bs ${this.m_formatMoney(monto)}\n`;
      }

      if (this.tributos.cobrar_iva) {
        mensaje += `\n*Fiscal:*\n`;
        mensaje += `Base: ${this.m_formatMoney(this.fiscal.base)}\n`;
        mensaje += `IVA: ${this.m_formatMoney(this.fiscal.iva)}\n`;
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
