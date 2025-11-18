<template>
  <q-page class="bg-grey-3 q-pa-md" padding>
    <div class="row q-mb-md">
      <q-input
        class="col q-mr-sm"
        filled
        v-model="inicio"
        mask="date"
        :rules="['date']"
        label="Fecha Inicio"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              ref="qDateProxy"
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="inicio">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Cerrar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-input
        class="col"
        filled
        v-model="fin"
        mask="date"
        :rules="['date']"
        label="Fecha Fin"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              ref="qDateProxy"
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="fin" @input="cargarDatos">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Cerrar" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Ventas por Producto</div>
        <div class="text-caption text-grey-7">
          Total de ventas agrupadas por producto en el rango seleccionado
        </div>
      </q-card-section>
      <q-card-section>
        <canvas ref="chartCanvas"></canvas>
      </q-card-section>
    </q-card>

    <q-card v-if="datosProductos.length > 0">
      <q-card-section>
        <div class="text-h6">Resumen de Ventas</div>
      </q-card-section>
      <q-card-section>
        <q-markup-table>
          <thead>
            <tr>
              <th class="text-left">Producto</th>
              <th class="text-right">Cantidad Vendida</th>
              <th class="text-right">Total Ventas (Bs)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in datosProductos" :key="index">
              <td class="text-left">{{ item.producto }}</td>
              <td class="text-right">{{ item.cantidadTotal }}</td>
              <td class="text-right">
                {{
                  new Intl.NumberFormat("es-VE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(item.totalVentas)
                }}
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>

    <q-banner v-if="datosProductos.length === 0" class="bg-info text-white">
      No hay datos para mostrar. Seleccione un rango de fechas.
    </q-banner>
  </q-page>
</template>

<script>
import { ventasDAO } from "../db/ventasDAO";
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { date } from "quasar";

// Registrar los componentes necesarios para el gráfico de barras
ChartJS.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default {
  name: "VentasPorProducto",
  data() {
    return {
      inicio: null,
      fin: null,
      ventas: [],
      datosProductos: [],
      chart: null
    };
  },
  mounted() {
    // Establecer fechas por defecto (día actual)
    const hoy = new Date();
    const fechaHoy = date.formatDate(hoy, "YYYY/MM/DD");

    this.inicio = fechaHoy;
    this.fin = fechaHoy;

    // Cargar datos iniciales solo si hay fechas
    if (this.inicio && this.fin) {
      this.$nextTick(() => {
        this.cargarDatos();
      });
    }
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  methods: {
    async cargarDatos() {
      if (!this.inicio || !this.fin) {
        return;
      }

      // Asegurar que las fechas estén en el formato correcto (YYYY/MM/DD)
      let fechaInicio = this.inicio;
      let fechaFin = this.fin;

      // Si la fecha viene en formato diferente, convertirla
      if (typeof fechaInicio === 'string' && fechaInicio.includes('/')) {
        // Ya está en formato YYYY/MM/DD
      } else if (fechaInicio) {
        // Convertir a formato YYYY/MM/DD
        fechaInicio = date.formatDate(fechaInicio, "YYYY/MM/DD");
      }

      if (typeof fechaFin === 'string' && fechaFin.includes('/')) {
        // Ya está en formato YYYY/MM/DD
      } else if (fechaFin) {
        // Convertir a formato YYYY/MM/DD
        fechaFin = date.formatDate(fechaFin, "YYYY/MM/DD");
      }

      console.log("Fechas para filtrar:", fechaInicio, fechaFin);

      this.$q.loading.show();

      try {
        // Obtener ventas del rango de fechas (igual que en Ventas.vue)
        await ventasDAO
          .getInstance()
          .get(fechaInicio, fechaFin)
          .then(result => {
            console.log("Ventas encontradas:", result);
            this.ventas = result || [];

            // Agrupar ventas por producto
            this.agruparPorProducto();

            // Actualizar gráfico
            this.actualizarGrafico();
          });
      } catch (error) {
        console.error("Error al cargar datos:", error);
        this.$q.notify({
          position: "top",
          type: "negative",
          message: `Error al cargar los datos de ventas: ${error.message || error}`
        });
      } finally {
        this.$q.loading.hide();
      }
    },
    agruparPorProducto() {
      const productosMap = {};

      // Recorrer todas las ventas
      this.ventas.forEach(venta => {
        if (venta.productos && Array.isArray(venta.productos)) {
          // Recorrer los productos de cada venta
          venta.productos.forEach(producto => {
            const nombreProducto = producto.producto || "Sin nombre";

            if (!productosMap[nombreProducto]) {
              productosMap[nombreProducto] = {
                producto: nombreProducto,
                cantidadTotal: 0,
                totalVentas: 0
              };
            }

            // Sumar cantidad y total de ventas
            productosMap[nombreProducto].cantidadTotal += Number(producto.cantidad || 0);
            productosMap[nombreProducto].totalVentas += Number(producto.valor_bs || 0);
          });
        }
      });

      // Convertir el mapa a array y ordenar por total de ventas (descendente)
      this.datosProductos = Object.values(productosMap).sort(
        (a, b) => b.totalVentas - a.totalVentas
      );
    },
    actualizarGrafico() {
      if (!this.$refs.chartCanvas) {
        return;
      }

      // Destruir gráfico anterior si existe
      if (this.chart) {
        this.chart.destroy();
      }

      if (this.datosProductos.length === 0) {
        return;
      }

      // Preparar datos para el gráfico
      const labels = this.datosProductos.map(item => item.producto);
      const datos = this.datosProductos.map(item => item.totalVentas);
      const cantidades = this.datosProductos.map(item => item.cantidadTotal);

      // Crear gráfico de barras
      const ctx = this.$refs.chartCanvas.getContext("2d");
      this.chart = new ChartJS(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Total Ventas (Bs)",
              data: datos,
              backgroundColor: [
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 99, 132, 0.6)",
                "rgba(255, 206, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)",
                "rgba(153, 102, 255, 0.6)",
                "rgba(255, 159, 64, 0.6)",
                "rgba(199, 199, 199, 0.6)",
                "rgba(83, 102, 255, 0.6)",
                "rgba(255, 99, 255, 0.6)",
                "rgba(99, 255, 132, 0.6)"
              ],
              borderColor: [
                "rgba(54, 162, 235, 1)",
                "rgba(255, 99, 132, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
                "rgba(199, 199, 199, 1)",
                "rgba(83, 102, 255, 1)",
                "rgba(255, 99, 255, 1)",
                "rgba(99, 255, 132, 1)"
              ],
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: true,
            position: "top"
          },
          tooltips: {
            callbacks: {
              label: function(tooltipItem, data) {
                const index = tooltipItem.index;
                const cantidad = cantidades[index];
                const total = new Intl.NumberFormat("es-VE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(tooltipItem.yLabel);
                return `Total: Bs ${total} | Cantidad: ${cantidad}`;
              }
            }
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  callback: function(value) {
                    return new Intl.NumberFormat("es-VE", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(value);
                  }
                }
              }
            ]
          }
        }
      });
    }
  }
};
</script>

<style scoped>
canvas {
  max-height: 400px;
}
</style>

