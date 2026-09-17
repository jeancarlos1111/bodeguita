<template>
  <q-dialog
    :value="value"
    @input="$emit('input', $event)"
    @hide="reset"
    :maximized="$q.screen.lt.md"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card
      class="revisar-orden-card"
      :style="$q.screen.gt.sm ? 'width: 480px; max-width: 95vw; border-radius: 20px;' : 'border-radius: 20px 20px 0 0;'"
      :class="$q.dark.isActive ? 'bg-dark' : 'bg-slate-50'"
    >
      <!-- Cabecera con flecha de retorno y título (Screenshot 4) -->
      <div class="row items-center q-px-md q-pt-md q-pb-sm">
        <q-btn flat round dense icon="chevron_left" size="md" color="grey-8" v-close-popup />
        <div class="text-h6 text-weight-bold q-ml-sm text-grey-9" :class="$q.dark.isActive ? 'text-white' : ''">
          Revisar orden
        </div>
        <q-space />
        <q-btn flat round dense icon="close" size="sm" color="grey-6" v-close-popup />
      </div>

      <div class="q-px-md q-pb-xl scroll" style="max-height: 80vh;">
        <!-- Badge de Fecha (Screenshot 4) -->
        <div class="row items-center text-grey-6 text-caption text-weight-medium q-mb-md q-px-xs">
          <q-icon name="calendar_today" size="15px" class="q-mr-xs" />
          <span>{{ formattedDate }}</span>
        </div>

        <!-- Tarjeta 1: Recibo y Desglose de Ítems (Screenshot 4) -->
        <q-card class="modern-card q-pa-md q-mb-md" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'">
          <div class="column q-gutter-y-sm">
            <div
              v-for="item in items"
              :key="item.id || item.producto"
              class="row items-center justify-between text-body2"
            >
              <div class="text-grey-8 ellipsis q-pr-sm" style="max-width: 70%;">
                <span class="text-weight-bold">{{ item.cantidad }} ×</span> {{ item.producto }}
              </div>
              <div class="text-weight-medium text-grey-9">
                Bs {{ $formatMoney(item.valor_bs) }}
              </div>
            </div>

            <q-separator class="q-my-xs" />

            <!-- Fila de Total destacado en verde (Screenshot 4) -->
            <div class="row items-center justify-between text-h6 text-weight-bold q-pt-xs">
              <span class="text-grey-9" :class="$q.dark.isActive ? 'text-white' : ''">Total</span>
              <div class="text-right">
                <div class="text-primary">
                  Bs {{ $formatMoney(finalTotal) }}
                </div>
                <div class="text-caption text-grey-6" v-if="$valor_dolar">
                  ≈ ${{ $formatMoneyUSD(finalTotal / $valor_dolar) }}
                </div>
              </div>
            </div>
          </div>
        </q-card>

        <!-- Tarjeta 2: Descuento opcional (Screenshot 4) -->
        <div class="q-mb-md">
          <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-xs q-px-xs" :class="$q.dark.isActive ? 'text-white' : ''">
            Descuento <span class="text-weight-regular text-grey-6">(opcional)</span>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                outlined
                dense
                v-model.number="descuentoMonto"
                type="number"
                min="0"
                step="0.1"
                placeholder="Monto (Bs)"
                bg-color="white"
                class="rounded-input"
                @input="onDescuentoMontoChange"
              >
                <template v-slot:prepend>
                  <span class="text-caption text-grey-6">Bs</span>
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                outlined
                dense
                v-model.number="descuentoPorc"
                type="number"
                min="0"
                max="100"
                placeholder="Porcentaje"
                bg-color="white"
                class="rounded-input"
                @input="onDescuentoPorcChange"
              >
                <template v-slot:append>
                  <span class="text-caption text-grey-6">%</span>
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <!-- Tarjeta 3: Cliente (Screenshot 4) -->
        <div class="q-mb-md">
          <q-card
            clickable
            v-ripple
            class="modern-card q-pa-sm cursor-pointer"
            :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'"
            @click="$emit('select-client')"
          >
            <div class="row items-center no-wrap">
              <q-avatar size="38px" class="q-mr-sm" color="green-1" text-color="primary" icon="person_outline" />
              <div class="col">
                <div class="text-caption text-grey-6">Cliente</div>
                <div class="text-weight-bold text-body2 text-grey-9" :class="$q.dark.isActive ? 'text-white' : ''">
                  {{ clienteNombre || 'Sin cliente' }}
                </div>
              </div>
              <q-icon name="chevron_right" size="20px" color="grey-5" />
            </div>
          </q-card>
        </div>

        <!-- Tarjeta 4: Medio de Pago con tarjetas visuales (Screenshot 4) -->
        <div class="q-mb-md">
          <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-sm q-px-xs" :class="$q.dark.isActive ? 'text-white' : ''">
            Medio de pago
          </div>

          <div class="row q-col-gutter-xs">
            <div
              v-for="opt in paymentOptions"
              :key="opt.id"
              class="col-4 q-mb-xs"
            >
              <div
                class="payment-option-card flex flex-center column text-center cursor-pointer"
                :class="{
                  'payment-option-active': metodo_pago === opt.id,
                  'bg-white text-grey-8': metodo_pago !== opt.id && !$q.dark.isActive,
                  'bg-grey-9 text-grey-4': metodo_pago !== opt.id && $q.dark.isActive
                }"
                @click="metodo_pago = opt.id"
              >
                <q-icon :name="opt.icon" size="24px" class="q-mb-xs" />
                <div class="text-caption text-weight-medium ellipsis" style="font-size: 11px; line-height: 1.2;">
                  {{ opt.label }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Campo de observaciones -->
        <q-input
          outlined
          dense
          autogrow
          v-model="observaciones"
          label="Observaciones / Notas"
          placeholder="Ej: Pago exacto, comprobante..."
          bg-color="white"
          class="rounded-input q-mb-lg"
        />

        <!-- Botón de Cobro Principal (Screenshot 4) -->
        <q-btn
          unelevated
          color="primary"
          class="full-width py-sm text-weight-bold submit-pay-btn"
          size="lg"
          @click="confirm"
          :disable="!metodo_pago || finalTotal <= 0"
        >
          <div class="row items-center justify-between full-width q-px-md">
            <span>Cobrar</span>
            <span>Bs {{ $formatMoney(finalTotal) }}</span>
          </div>
        </q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { date } from 'quasar';

export default {
  name: 'PaymentDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    total: {
      type: Number,
      required: true
    },
    items: {
      type: Array,
      default: () => []
    },
    clienteNombre: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      metodo_pago: 'Efectivo Bs',
      observaciones: '',
      descuentoMonto: null,
      descuentoPorc: null,
      paymentOptions: [
        { id: 'Efectivo Bs', label: 'Efectivo', icon: 'payments' },
        { id: 'Punto de Venta', label: 'Tarjeta', icon: 'credit_card' },
        { id: 'Pago Móvil', label: 'Transferencia', icon: 'swap_horiz' },
        { id: 'Efectivo $', label: 'Divisas $', icon: 'attach_money' },
        { id: 'Fiado', label: 'Fiado', icon: 'assignment_ind' },
        { id: 'Zelle', label: 'Zelle', icon: 'bolt' }
      ]
    };
  },
  computed: {
    formattedDate() {
      // Formato ej: 11 sep. 2026
      const meses = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'];
      const now = new Date();
      return `${now.getDate()} ${meses[now.getMonth()]} ${now.getFullYear()}`;
    },
    calculatedDiscount() {
      if (this.descuentoMonto && this.descuentoMonto > 0) {
        return Math.min(this.total, Number(this.descuentoMonto));
      }
      if (this.descuentoPorc && this.descuentoPorc > 0) {
        return (this.total * Math.min(100, Number(this.descuentoPorc))) / 100;
      }
      return 0;
    },
    finalTotal() {
      const discounted = this.total - this.calculatedDiscount;
      return Math.max(0, discounted);
    }
  },
  methods: {
    onDescuentoMontoChange(val) {
      if (val && Number(val) > 0) {
        this.descuentoPorc = null;
      }
    },
    onDescuentoPorcChange(val) {
      if (val && Number(val) > 0) {
        this.descuentoMonto = null;
      }
    },
    confirm() {
      if (!this.metodo_pago) return;
      this.$emit('confirm', {
        metodo_pago: this.metodo_pago,
        observaciones: this.observaciones,
        descuento: this.calculatedDiscount,
        totalFinal: this.finalTotal
      });
      this.$emit('input', false);
    },
    reset() {
      this.metodo_pago = 'Efectivo Bs';
      this.observaciones = '';
      this.descuentoMonto = null;
      this.descuentoPorc = null;
    }
  }
};
</script>

<style scoped>
.bg-slate-50 {
  background-color: #F8FAFC;
}

.revisar-orden-card {
  box-shadow: 0 -4px 25px rgba(0, 0, 0, 0.12);
}

.rounded-input :deep(.q-field__control) {
  border-radius: 12px;
}

.payment-option-card {
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 10px 4px;
  min-height: 68px;
  transition: all 0.2s ease;
}

.payment-option-active {
  border-color: #0D684F !important;
  background-color: #E8F5F1 !important;
  color: #0D684F !important;
  box-shadow: 0 2px 8px rgba(13, 104, 79, 0.15);
}

.submit-pay-btn {
  border-radius: 14px;
  height: 52px;
}
</style>
