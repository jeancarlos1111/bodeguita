<template>
  <q-page :class="$q.dark.isActive ? 'bg-dark' : ''" class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-bold" :class="$q.dark.isActive ? 'text-white' : 'text-primary'">Dashboard</div>
      <q-space />
      <div class="text-caption text-grey">Hoy: {{ m_hoyFecha }}</div>
    </div>

    <!-- KPI Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="rounded-card shadow-1 bg-primary text-white">
          <q-card-section>
            <div class="text-subtitle2 opacity-70">Ventas Hoy</div>
            <div class="text-h5 text-weight-bold text-white">Bs {{ m_formatMoney(kpis.ventasHoy) }}</div>
            <div class="text-caption" v-if="m_valor_dolar">
              $ {{ m_formatMoneyUSD(kpis.ventasHoy / m_valor_dolar) }}
            </div>
          </q-card-section>
          <q-icon name="payments" class="absolute-bottom-right q-ma-sm opacity-20" size="48px" />
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="rounded-card shadow-1 bg-positive text-white">
          <q-card-section>
            <div class="text-subtitle2 opacity-70">Ganancia Est. Hoy</div>
            <div class="text-h5 text-weight-bold text-white">Bs {{ m_formatMoney(kpis.gananciaHoy) }}</div>
            <div class="text-caption" v-if="m_valor_dolar">
              $ {{ m_formatMoneyUSD(kpis.gananciaHoy / m_valor_dolar) }}
            </div>
          </q-card-section>
          <q-icon name="trending_up" class="absolute-bottom-right q-ma-sm opacity-20" size="48px" />
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="rounded-card shadow-1 bg-orange text-white">
          <q-card-section>
            <div class="text-subtitle2 opacity-70">Transacciones</div>
            <div class="text-h5 text-weight-bold text-white">{{ kpis.transacciones }}</div>
            <div class="text-caption">Ticket prom: Bs {{ m_formatMoney(kpis.ventasHoy / (kpis.transacciones || 1)) }}
            </div>
          </q-card-section>
          <q-icon name="receipt" class="absolute-bottom-right q-ma-sm opacity-20" size="48px" />
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="rounded-card shadow-1 bg-negative text-white cursor-pointer" @click="$router.push('/productos')">
          <q-card-section>
            <div class="text-subtitle2 opacity-70">Stock Crítico</div>
            <div class="text-h5 text-weight-bold text-white">{{ kpis.stockBajo }}</div>
            <div class="text-caption">Productos por agotarse</div>
          </q-card-section>
          <q-icon name="warning" class="absolute-bottom-right q-ma-sm opacity-20" size="48px" />
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- Weekly Chart -->
      <div class="col-12 col-md-8">
        <q-card class="rounded-card shadow-1 full-height">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-grey-8">Ventas de la Semana</div>
          </q-card-section>
          <q-card-section style="height: 300px">
            <canvas ref="weeklyChart"></canvas>
          </q-card-section>
        </q-card>
      </div>

      <!-- Quick Actions / Alerts -->
      <div class="col-12 col-md-4">
        <q-card class="rounded-card shadow-1 full-height">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-grey-8">Acciones Rápidas</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-list separator>
              <q-item clickable v-ripple to="/venta">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" icon="shopping_cart" />
                </q-item-section>
                <q-item-section>Nueva Venta</q-item-section>
                <q-item-section side><q-icon name="chevron_right" /></q-item-section>
              </q-item>
              <q-item clickable v-ripple to="/productos">
                <q-item-section avatar>
                  <q-avatar color="secondary" text-color="white" icon="inventory_2" />
                </q-item-section>
                <q-item-section>Gestionar Inventario</q-item-section>
                <q-item-section side><q-icon name="chevron_right" /></q-item-section>
              </q-item>
              <q-item clickable v-ripple to="/cuentas-por-cobrar">
                <q-item-section avatar>
                  <q-avatar color="warning" text-color="white" icon="account_balance_wallet" />
                </q-item-section>
                <q-item-section>Cuentas por Cobrar</q-item-section>
                <q-item-section side><q-icon name="chevron_right" /></q-item-section>
              </q-item>
              <q-item clickable v-ripple to="/configuracion">
                <q-item-section avatar>
                  <q-avatar color="grey-7" text-color="white" icon="settings" />
                </q-item-section>
                <q-item-section>Configuración</q-item-section>
                <q-item-section side><q-icon name="chevron_right" /></q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Low Stock List -->
      <div class="col-12">
        <q-card class="rounded-card shadow-1" :class="$q.dark.isActive ? 'bg-grey-9 text-white' : ''">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold" :class="$q.dark.isActive ? 'text-white' : 'text-grey-8'">Productos con Stock Bajo</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-table :data="productosBajoStock" :columns="stockColumns" row-key="id" flat dense
              no-data-label="Todos los productos tienen stock suficiente">
              <template v-slot:body-cell-cantidad="props">
                <q-td :props="props">
                  <q-chip :color="props.row.cantidad <= 0 ? 'negative' : 'warning'" text-color="white" dense>
                    {{ props.row.cantidad }}
                  </q-chip>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { date } from 'quasar';
import { ventasDAO } from '../db/ventasDAO';
import { productosDAO } from '../db/productosDAO';
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default {
  name: 'Dashboard',
  data() {
    return {
      kpis: {
        ventasHoy: 0,
        gananciaHoy: 0,
        transacciones: 0,
        stockBajo: 0
      },
      productosBajoStock: [],
      stockColumns: [
        { name: 'nombre', label: 'Producto', field: 'nombre', align: 'left', sortable: true },
        { name: 'cantidad', label: 'Stock', field: 'cantidad', align: 'center', sortable: true },
        { name: 'costo', label: 'Costo (Bs)', field: 'costo', align: 'right', format: val => this.m_formatMoney(val) }
      ],
      chart: null
    };
  },
  async mounted() {
    this.$q.loading.show({ message: 'Cargando Dashboard...' });
    await this.m_getDolar();
    await this.loadKPIs();
    await this.renderChart();
    this.$q.loading.hide();
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  methods: {
    async loadKPIs() {
      const hoy = date.formatDate(new Date(), 'YYYY/MM/DD');

      // Ventas de hoy
      const ventas = await ventasDAO.getInstance().get(hoy, hoy);
      this.kpis.transacciones = ventas.length;

      let totalVenta = 0;
      let totalGanancia = 0;

      ventas.forEach(v => {
        totalVenta += (v.total || 0);
        if (v.productos) {
          v.productos.forEach(p => {
            const ventaItem = p.valor_bs || 0;
            const costoItem = p.costo_total_bs || 0;
            totalGanancia += (ventaItem - costoItem);
          });
        }
      });

      this.kpis.ventasHoy = totalVenta;
      this.kpis.gananciaHoy = totalGanancia;

      // Stock Bajo (menos de 5 unidades)
      const productos = await productosDAO.getInstance().get();
      this.productosBajoStock = productos.filter(p => (p.cantidad || 0) < 5).sort((a, b) => a.cantidad - b.cantidad);
      this.kpis.stockBajo = this.productosBajoStock.length;
    },

    async renderChart() {
      const ctx = this.$refs.weeklyChart.getContext('2d');

      // Obtener datos de los últimos 7 días
      const days = [];
      const salesData = [];
      const labels = [];

      for (let i = 6; i >= 0; i--) {
        const d = date.subtractFromDate(new Date(), { days: i });
        const dayStr = date.formatDate(d, 'YYYY/MM/DD');
        const label = date.formatDate(d, 'ddd'); // Nombre del día

        labels.push(label);
        const dailyVentas = await ventasDAO.getInstance().get(dayStr, dayStr);
        const total = dailyVentas.reduce((acc, v) => acc + (v.total || 0), 0);
        salesData.push(total);
      }

      this.chart = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Ventas (Bs)',
            data: salesData,
            borderColor: '#1976D2',
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#1976D2',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (val) => this.m_formatMoney(val)
              }
            }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.rounded-card {
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.opacity-70 {
  opacity: 0.7;
}

.opacity-20 {
  opacity: 0.2;
}
</style>
