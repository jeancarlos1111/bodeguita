<template>
  <div class="ticket-container" id="printable-ticket">
    <div class="ticket-header text-center">
      <div class="text-bold text-uppercase">{{ negocio.nombre || 'BODEGUITA' }}</div>
      <div class="text-small" v-if="negocio.rif">RIF: {{ negocio.rif }}</div>
      <div class="text-small" v-if="negocio.direccion">{{ negocio.direccion }}</div>
      <div class="divider">********************************</div>
      <div class="text-bold">TICKET #{{ venta.numero_factura || venta.id }}</div>
      <div class="text-small">{{ venta.create_at }}</div>
      <div class="divider">********************************</div>
    </div>

    <div class="ticket-body">
      <table class="full-width">
        <thead>
          <tr>
            <th class="text-left">CANT</th>
            <th class="text-left">DESCRIPCION</th>
            <th class="text-right">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in venta.productos" :key="index">
            <td class="text-left">{{ item.cantidad }}</td>
            <td class="text-left">{{ item.producto }}</td>
            <td class="text-right">{{ m_formatMoney(item.valor_bs) }}</td>
          </tr>
        </tbody>
      </table>
      <div class="divider">--------------------------------</div>
    </div>

    <div class="ticket-footer">
      <div class="row justify-between">
        <span>SUBTOTAL:</span>
        <span>Bs {{ m_formatMoney(venta.monto_base + venta.monto_exento) }}</span>
      </div>
      <div class="row justify-between" v-if="venta.monto_iva > 0">
        <span>IVA (16%):</span>
        <span>Bs {{ m_formatMoney(venta.monto_iva) }}</span>
      </div>
      <div class="row justify-between" v-if="venta.monto_igtf > 0">
        <span>IGTF (3%):</span>
        <span>Bs {{ m_formatMoney(venta.monto_igtf) }}</span>
      </div>
      
      <div class="row justify-between text-bold text-large q-mt-sm">
        <span>TOTAL BS:</span>
        <span>Bs {{ m_formatMoney(venta.total) }}</span>
      </div>

      <div class="row justify-between text-italic" v-if="venta.tasa_dolar">
        <span>TOTAL USD:</span>
        <span>$ {{ m_formatMoneyUSD(venta.total / venta.tasa_dolar) }}</span>
      </div>

      <div class="divider">********************************</div>
      <div class="text-small">MÉTODO: {{ venta.metodo_pago }}</div>
      <div class="text-small" v-if="venta.cliente_nombre">CLIENTE: {{ venta.cliente_nombre }}</div>
      <div class="divider" v-if="venta.observaciones">********************************</div>
      <div class="text-small" v-if="venta.observaciones">NOTAS: {{ venta.observaciones }}</div>
      <div class="divider">********************************</div>
      <div class="text-center q-mt-md">¡GRACIAS POR SU COMPRA!</div>
    </div>
  </div>
</template>

<script>
import { configuracionDAO } from '../db/configuracionDAO';

export default {
  name: 'TicketVenta',
  props: {
    venta: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      negocio: {}
    }
  },
  async mounted() {
    const data = await configuracionDAO.getInstance().get('datos_negocio');
    if (data) {
      this.negocio = data;
    }
  }
}
</script>

<style scoped>
.ticket-container {
  width: 58mm; /* Standard narrow thermal printer */
  padding: 2mm;
  font-family: 'Courier New', Courier, monospace;
  font-size: 10pt;
  line-height: 1.2;
  color: #000;
  background: #fff;
}

.text-center { text-align: center; }
.text-right { text-align: right; }
.text-left { text-align: left; }
.text-bold { font-weight: bold; }
.text-uppercase { text-transform: uppercase; }
.text-small { font-size: 8pt; }
.text-large { font-size: 12pt; }
.text-italic { font-style: italic; }

.full-width { width: 100%; }
.divider { margin: 5px 0; }
.q-mt-sm { margin-top: 5px; }
.q-mt-md { margin-top: 10px; }

.row { display: flex; }
.justify-between { justify-content: space-between; }

@media print {
  body * {
    visibility: hidden;
  }
  #printable-ticket, #printable-ticket * {
    visibility: visible;
  }
  #printable-ticket {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
  }
}
</style>
