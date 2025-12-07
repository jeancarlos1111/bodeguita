<template>
  <q-page class="bg-grey-3 q-pa-md" padding>
    <div class="row q-mb-md q-gutter-sm">
      <q-btn class="col-12 col-sm" color="primary" icon="create" label="Nuevo producto" @click="dialogoNuevoValor" />
      <q-btn class="col-12 col-sm-auto" color="positive" icon="file_download" label="Exportar CSV"
        @click="exportarProductosCSV" :disable="data.length === 0" />
      <q-btn class="col-12 col-sm-auto" color="info" icon="file_upload" label="Importar CSV"
        @click="triggerImportCSV" />
    </div>
    <!-- Input file oculto para importar CSV -->
    <input ref="fileInput" type="file" accept=".csv,text/csv" style="display: none" @change="importarProductosCSV" />
    <q-table title="Productos" :data="data" :columns="columns" :filter="filter" no-data-label="No encontré nada para ti"
      no-results-label="El filtro no reveló ningún resultado." row-key="nombre" :grid="$q.screen.lt.md"
      card-class="bg-white rounded-card shadow-1">
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
          <q-icon slot="append" name="search" />
        </q-input>
      </template>
      <!-- Vista desktop -->
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="nombre" :props="props">
            {{ props.row.nombre }}
          </q-td>
          <q-td key="costo" :props="props">
            {{ new Intl.NumberFormat("es-VE", {
              minimumFractionDigits: 2, maximumFractionDigits: 2
            }).format(props.row.costo) }}
          </q-td>
          <q-td key="porcentaje_ganancia" :props="props">
            {{ (props.row.porcentaje_ganancia || 0).toFixed(2) }}%
          </q-td>
          <q-td key="porcentaje_iva" :props="props">
            {{ (props.row.porcentaje_iva || 0).toFixed(2) }}%
          </q-td>
          <q-td key="precio_venta" :props="props">
            <div>
              <div class="text-weight-bold">
                {{ new Intl.NumberFormat("es-VE", {
                  minimumFractionDigits: 2, maximumFractionDigits: 2
                }).format(calcularPrecioVenta(props.row.costo, props.row.porcentaje_ganancia, props.row.porcentaje_iva))
                }}
              </div>
              <div class="text-caption text-grey-7" v-if="props.row.porcentaje_iva">
                Sin IVA: {{ new Intl.NumberFormat("es-VE", {
                  minimumFractionDigits: 2, maximumFractionDigits: 2
                }).format(calcularPrecioSinIva(props.row.costo, props.row.porcentaje_ganancia)) }}
                | IVA: {{ new Intl.NumberFormat("es-VE", {
                  minimumFractionDigits: 2, maximumFractionDigits: 2
                }).format(calcularIva(calcularPrecioSinIva(props.row.costo, props.row.porcentaje_ganancia),
                  props.row.porcentaje_iva)) }}
              </div>
            </div>
          </q-td>
          <q-td key="ganancia_unitaria" :props="props">
            <span class="text-positive text-weight-bold">
              {{ new Intl.NumberFormat("es-VE", {
                minimumFractionDigits: 2, maximumFractionDigits: 2
              }).format(calcularGananciaUnitaria(props.row)) }}
            </span>
          </q-td>
          <q-td key="cantidad" :props="props">
            {{ props.row.cantidad }}
          </q-td>
          <q-td key="create_at" :props="props">
            {{ hoyFecha(props.row.create_at) }}
          </q-td>
          <q-td key="id" :props="props">
            <q-btn-group flat>
              <q-btn flat round color="info" icon="add_circle" @click="agregarCantidad(props.row)" />
              <q-btn flat round color="warning" icon="edit" @click="editarProducto(props.row)" />
              <q-btn flat round color="negative" icon="delete" @click.stop="deleteR(props.row.id)" />
            </q-btn-group>
          </q-td>
        </q-tr>
      </template>

      <!-- Vista mobile -->
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card class="rounded-card shadow-1">
            <q-card-section class="row full-width justify-between items-center">
              <div class="col-6">
                <div class="text-h6">{{ props.row.nombre }}</div>
              </div>
              <div class="col-6 text-right">
                <q-btn-group flat>
                  <q-btn flat round dense color="info" icon="add_circle" @click="agregarCantidad(props.row)" />
                  <q-btn flat round dense color="warning" icon="edit" @click="editarProducto(props.row)" />
                  <q-btn flat round dense color="negative" icon="delete" @click.stop="deleteR(props.row.id)" />
                </q-btn-group>
              </div>
            </q-card-section>
            <q-separator />
            <q-list dense>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Costo</q-item-label>
                  <q-item-label>{{ new Intl.NumberFormat("es-VE", {
                    minimumFractionDigits: 2, maximumFractionDigits: 2
                  }).format(props.row.costo) }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption>Cantidad</q-item-label>
                  <q-item-label class="text-weight-bold">{{ props.row.cantidad }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section class="q-pb-xs">
                  <q-item-label caption>Precio Venta</q-item-label>
                  <q-item-label class="text-primary text-weight-bold">{{ new Intl.NumberFormat("es-VE", {
                    minimumFractionDigits: 2, maximumFractionDigits: 2
                  }).format(calcularPrecioVenta(props.row.costo,
                    props.row.porcentaje_ganancia, props.row.porcentaje_iva)) }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption>Ganancia</q-item-label>
                  <q-item-label class="text-positive">{{ new Intl.NumberFormat("es-VE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(calcularGananciaUnitaria(props.row)) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </template>


      <template v-slot:no-data="{ icon, message, filter }">
        <div class="full-width row flex-center text-accent q-gutter-sm">
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span>
            Bueno, esto es triste... {{ message }}
          </span>
          <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
        </div>
      </template>
    </q-table>
    <!-- Dialogo para registrar un nuevo producto -->
    <q-dialog v-model="m_nuevo_producto" persistent transition-show="scale" transition-hide="scale">
      <q-card>
        <q-toolbar>
          <q-avatar square>
            <img :src="`${$router.options.base || ''}icons/favicon-128x128.png`">
          </q-avatar>

          <q-toolbar-title><span class="text-weight-bold">Nuevo Producto</span></q-toolbar-title>

          <q-btn flat round dense icon="close" @click="cerrar" />
        </q-toolbar>

        <q-card-section>
          <div class="q-gutter-md">
            <q-input v-model="form.nombre" label="Nombre" />
            <q-toggle v-model="ingresarEnBs"
              :label="`Ingresar valores en Bolívares (Bs)${valor_dolar ? ' - Dólar: Bs ' + new Intl.NumberFormat('es-VE').format(valor_dolar) : ' - Sin valor del dólar'}`"
              color="primary" :disable="!valor_dolar" @input="toggleMoneda" />
            <!-- Removed valor inputs -->
            <q-input v-if="!ingresarEnBs" v-model.number="form.costo" type="number" mask="#.##" fill-mask="0"
              reverse-fill-mask input-class="text-right" label="Costo (USD)" />
            <q-input v-else v-model.number="form.costo_bs" type="number" mask="#.##" fill-mask="0" reverse-fill-mask
              input-class="text-right" label="Costo (Bs)" hint="Se convertirá automáticamente a USD">
              <template v-slot:append v-if="form.costo_bs && valor_dolar">
                <q-chip dense color="primary" text-color="white">
                  ${{ (form.costo_bs / valor_dolar).toFixed(2) }}
                </q-chip>
              </template>
            </q-input>
            <q-input v-model.number="form.porcentaje_ganancia" type="number" mask="#.##" fill-mask="0" reverse-fill-mask
              input-class="text-right" label="Porcentaje de Ganancia (%)" />
            <q-input v-model.number="form.porcentaje_iva" type="number" mask="#.##" fill-mask="0" reverse-fill-mask
              input-class="text-right" label="IVA (%)" hint="Impuesto que se sumará al precio de venta" />
            <q-input v-model.number="form.cantidad" type="number" mask="#.##" fill-mask="0" reverse-fill-mask
              input-class="text-right" label="Cantidad" />
            <input type="hidden" v-model="form.create_at">
          </div>
        </q-card-section>
        <q-separator />

        <q-card-actions align="right">
          <q-btn color="primary" label="Guardar" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Dialogo para editar un producto -->
    <q-dialog v-model="m_editar_producto" persistent transition-show="scale" transition-hide="scale">
      <q-card>
        <q-toolbar>
          <q-avatar square>
            <img :src="`${$router.options.base || ''}icons/favicon-128x128.png`">
          </q-avatar>

          <q-toolbar-title><span class="text-weight-bold">Editar Producto</span></q-toolbar-title>

          <q-btn flat round dense icon="close" @click="cerrarEditar" />
        </q-toolbar>

        <q-card-section>
          <div class="q-gutter-md">
            <q-input v-model="form_editar.nombre" label="Nombre" />
            <q-toggle v-model="ingresarEnBsEditar"
              :label="`Ingresar valores en Bolívares (Bs)${valor_dolar ? ' - Dólar: Bs ' + new Intl.NumberFormat('es-VE').format(valor_dolar) : ' - Sin valor del dólar'}`"
              color="primary" :disable="!valor_dolar" @input="toggleMonedaEditar" />
            <!-- Removed valor inputs -->
            <q-input v-if="!ingresarEnBsEditar" v-model.number="form_editar.costo" type="number" mask="#.##"
              fill-mask="0" reverse-fill-mask input-class="text-right" label="Costo (USD)" />
            <q-input v-else v-model.number="form_editar.costo_bs" type="number" mask="#.##" fill-mask="0"
              reverse-fill-mask input-class="text-right" label="Costo (Bs)" hint="Se convertirá automáticamente a USD">
              <template v-slot:append v-if="form_editar.costo_bs && valor_dolar">
                <q-chip dense color="primary" text-color="white">
                  ${{ (form_editar.costo_bs / valor_dolar).toFixed(2) }}
                </q-chip>
              </template>
            </q-input>
            <q-input v-model.number="form_editar.porcentaje_ganancia" type="number" mask="#.##" fill-mask="0"
              reverse-fill-mask input-class="text-right" label="Porcentaje de Ganancia (%)" />
            <q-input v-model.number="form_editar.porcentaje_iva" type="number" mask="#.##" fill-mask="0"
              reverse-fill-mask input-class="text-right" label="IVA (%)"
              hint="Impuesto que se sumará al precio de venta" />
            <q-input v-model.number="form_editar.cantidad" type="number" mask="#.##" fill-mask="0" reverse-fill-mask
              input-class="text-right" label="Cantidad" />
            <input type="hidden" v-model="form_editar.create_at">
          </div>
        </q-card-section>
        <q-separator />

        <q-card-actions align="right">
          <q-btn color="primary" label="Guardar" @click="actualizarProducto(form_editar.id)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Dialogo para agregar más cantidad al producto -->
    <q-dialog v-model="m_cantidad_producto" persistent transition-show="scale" transition-hide="scale">
      <q-card>
        <q-toolbar>
          <q-avatar square>
            <img :src="`${$router.options.base || ''}icons/favicon-128x128.png`">
          </q-avatar>

          <q-toolbar-title><span class="text-weight-bold">{{ form_cantidad.nombre }}</span></q-toolbar-title>

          <q-btn flat round dense icon="close" @click="cerrarCantidad" />
        </q-toolbar>

        <q-card-section>
          <div class="q-gutter-md">
            <q-input v-model.number="form_cantidad.cantidad" type="number" mask="#.##" fill-mask="0" reverse-fill-mask
              input-class="text-right" label="Cantidad Actual" readonly />
            <q-input v-model.number="cantidad_agregar" type="number" mask="#.##" fill-mask="0" reverse-fill-mask
              input-class="text-right" label="Cantidad a agregar" />
            <input type="hidden" v-model="form_cantidad.create_at">
          </div>
        </q-card-section>
        <q-separator />

        <q-card-actions align="right">
          <q-btn color="primary" label="Guardar" @click="actualizarCantidad(form_cantidad.id)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { date } from 'quasar';
import { productosDAO } from '../db/productosDAO';
import { valor_dolarDAO } from '../db/valor_dolarDAO';
import { Productos } from '../models/Productos';
import { movimientosDAO } from '../db/movimientosDAO';
import { Movimientos } from '../models/Movimientos';
export default {
  name: 'Productos',
  data() {
    return {
      form: new Productos(),
      form_editar: {},
      form_cantidad: {},
      cantidad_agregar: null,
      m_nuevo_producto: false,
      m_editar_producto: false,
      m_cantidad_producto: false,
      data: [],
      filter: '',
      ingresarEnBs: false,
      ingresarEnBsEditar: false,
      valor_dolar: null,

      columns: [
        {
          name: 'nombre',
          required: true,
          label: 'Nombre',
          align: 'center',
          field: row => row.nombre,
          sortable: true
        },
        {
          name: 'costo',
          required: true,
          label: 'Costo',
          align: 'center',
          field: row => row.costo,
          format: val => `${new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)}`,
          sortable: true
        },
        {
          name: 'porcentaje_ganancia',
          required: true,
          label: 'Ganancia %',
          align: 'center',
          field: row => row.porcentaje_ganancia || 0,
          format: val => `${parseFloat(val).toFixed(2)}%`,
          sortable: true
        },
        {
          name: 'porcentaje_iva',
          required: true,
          label: 'IVA %',
          align: 'center',
          field: row => row.porcentaje_iva || 0,
          format: val => `${parseFloat(val).toFixed(2)}%`,
          sortable: true
        },
        {
          name: 'precio_venta',
          required: true,
          label: 'Precio de Venta',
          align: 'center',
          field: row => {
            const porcentaje = row.porcentaje_ganancia || 0;
            const iva = row.porcentaje_iva || 0;
            if (!row.costo) return 0;
            const precioSinIva = row.costo + (row.costo * porcentaje / 100);
            const montoIva = precioSinIva * (iva / 100);
            return precioSinIva + montoIva;
          },
          format: val => `${new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)}`,
          sortable: true
        },
        {
          name: 'ganancia_unitaria',
          required: true,
          label: 'Ganancia/Unidad',
          align: 'center',
          field: row => {
            const porcentaje = row.porcentaje_ganancia || 0;
            if (!row.costo) return 0;
            return row.costo * (porcentaje / 100);
          },
          format: val => `${new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)}`,
          sortable: true
        },
        {
          name: 'cantidad',
          required: true,
          label: 'Cantidad',
          align: 'center',
          field: row => row.cantidad,
          format: val => `${new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)}`,
          sortable: true
        },
        { name: 'create_at', align: 'center', label: 'Fecha', field: 'create_at', sortable: true, format: val => `${this.hoyFecha(val)}` },
        {
          name: "id",
          align: "left",
          label: "Acciones",
          field: "id",
          sortable: false
        }
      ]
    }
  },
  mounted() {
    this.get().then(() => {
      this.migrarValorACosto();
    });
    this.getDolar();
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

  methods: {
    hoyFecha(timeStamp) {
      //timeStamp = date.addToDate(timeStamp, { days: 1, month: 0 })
      return date.formatDate(timeStamp, 'DD-MM-YYYY HH:mm:ss');
    },
    calcularPrecioVenta(costo, porcentajeGanancia, porcentajeIva) {
      if (!costo) return 0;
      const porcentaje = porcentajeGanancia || 0;
      const iva = porcentajeIva || 0;
      // Precio sin IVA: Costo + Ganancia
      const precioSinIva = costo + (costo * porcentaje / 100);
      // IVA sobre el precio sin IVA
      const montoIva = precioSinIva * (iva / 100);
      // Precio final con IVA
      return parseFloat((precioSinIva + montoIva).toFixed(2));
    },
    calcularPrecioSinIva(costo, porcentajeGanancia) {
      if (!costo) return 0;
      const porcentaje = porcentajeGanancia || 0;
      return parseFloat((costo + (costo * porcentaje / 100)).toFixed(2));
    },
    calcularIva(precioSinIva, porcentajeIva) {
      if (!precioSinIva) return 0;
      const iva = porcentajeIva || 0;
      return parseFloat((precioSinIva * (iva / 100)).toFixed(2));
    },
    calcularGananciaUnitaria(producto) {
      const costo = producto.costo || 0;
      const porcentaje = producto.porcentaje_ganancia || 0;
      return parseFloat((costo * porcentaje / 100).toFixed(2));
    },
    dialogoNuevoValor() {
      this.m_nuevo_producto = true;
    },
    cerrar() {
      this.form = new Productos();
      this.$set(this.form, 'costo_bs', null);
      this.ingresarEnBs = false;
      this.m_nuevo_producto = false;
    },
    cerrarEditar() {
      this.form_editar = {};
      this.ingresarEnBsEditar = false;
      this.m_editar_producto = false;
    },
    getDolar() {
      valor_dolarDAO.getInstance().getUltimo().then(result => {
        if (result && result.valor_dolar) {
          this.valor_dolar = result.valor_dolar;
        } else {
          this.valor_dolar = null;
          this.$q.notify({
            position: 'top',
            type: 'warning',
            message: 'No hay valor del dólar configurado. Configúralo en la sección "Valor Dolar" para usar conversión de moneda.',
            timeout: 5000
          });
        }
      }).catch(error => {
        console.error('Error al obtener valor del dólar:', error);
        this.valor_dolar = null;
      });
    },
    toggleMoneda() {
      if (!this.ingresarEnBs) {
        // Si se desactiva, limpiar valores en Bs
        this.form.costo_bs = null;
      } else {
        // Si se activa, convertir valores existentes a Bs si hay valor_dolar
        if (this.valor_dolar && this.form.costo) {
          this.form.costo_bs = this.form.costo * this.valor_dolar;
        }
      }
    },
    toggleMonedaEditar() {
      if (!this.ingresarEnBsEditar) {
        // Si se desactiva, limpiar valores en Bs
        this.form_editar.costo_bs = null;
      } else {
        // Si se activa, convertir valores existentes a Bs si hay valor_dolar
        if (this.valor_dolar && this.form_editar.costo) {
          this.form_editar.costo_bs = this.form_editar.costo * this.valor_dolar;
        }
      }
    },
    cerrarCantidad() {
      this.form_cantidad = {};
      this.m_cantidad_producto = false;
      this.cantidad_agregar = null;
    },
    async get() {
      this.$q.loading.show();
      await productosDAO.getInstance().get().then(result => { this.data = result });
      this.$q.loading.hide();
    },
    exportarProductosCSV() {
      if (this.data.length === 0) {
        this.$q.notify({
          position: 'top',
          type: 'warning',
          message: 'No hay productos para exportar'
        });
        return;
      }

      // Encabezados del CSV
      const headers = ['nombre', 'costo', 'cantidad', 'porcentaje_ganancia', 'porcentaje_iva'];
      const headersLabels = ['Nombre', 'Costo (USD)', 'Cantidad', 'Ganancia (%)', 'IVA (%)'];

      // Crear contenido CSV
      let csvContent = headersLabels.join(',') + '\n';

      this.data.forEach(producto => {
        const row = [
          `"${(producto.nombre || '').replace(/"/g, '""')}"`, // Escapar comillas
          producto.costo || 0,
          producto.cantidad || 0,
          producto.porcentaje_ganancia || 0,
          producto.porcentaje_iva || 0
        ];
        csvContent += row.join(',') + '\n';
      });

      // Crear blob y descargar (compatible con móviles)
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM para Excel
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `productos_${date.formatDate(Date.now(), 'YYYY-MM-DD_HH-mm-ss')}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Liberar URL después de un tiempo
      setTimeout(() => URL.revokeObjectURL(url), 100);

      this.$q.notify({
        position: 'top',
        type: 'positive',
        message: `Se exportaron ${this.data.length} producto(s) correctamente`
      });
    },
    triggerImportCSV() {
      // Disparar el input file oculto
      this.$refs.fileInput.click();
    },
    async importarProductosCSV(event) {
      const file = event.target.files[0];
      if (!file) {
        return;
      }

      // Validar extensión
      if (!file.name.toLowerCase().endsWith('.csv')) {
        this.$q.notify({
          position: 'top',
          type: 'negative',
          message: 'El archivo debe ser un CSV (.csv)'
        });
        event.target.value = ''; // Limpiar input
        return;
      }

      this.$q.loading.show({
        message: 'Importando productos...'
      });

      try {
        const text = await this.readFileAsText(file);
        const productos = this.parseCSV(text);

        if (productos.length === 0) {
          this.$q.loading.hide();
          this.$q.notify({
            position: 'top',
            type: 'warning',
            message: 'El archivo CSV está vacío o no tiene el formato correcto'
          });
          event.target.value = '';
          return;
        }

        // Validar y guardar productos
        let exitosos = 0;
        let errores = 0;
        const erroresDetalle = [];

        for (const producto of productos) {
          try {
            // Validar campos requeridos
            if (!producto.nombre || producto.nombre.trim() === '') {
              errores++;
              erroresDetalle.push(`Producto sin nombre en línea ${producto._linea || 'desconocida'}`);
              continue;
            }

            // Preparar producto para guardar
            const productoToSave = {
              nombre: producto.nombre.trim().toUpperCase(),
              costo: parseFloat(producto.costo || 0),
              cantidad: parseFloat(producto.cantidad || 0),
              porcentaje_ganancia: parseFloat(producto.porcentaje_ganancia || 0),
              porcentaje_iva: parseFloat(producto.porcentaje_iva || 0),
              create_at: Date.now()
            };

            // Verificar si el producto ya existe
            const existe = await productosDAO.getInstance().getNombre(productoToSave.nombre);
            if (existe) {
              // Actualizar producto existente
              await productosDAO.getInstance().update(existe.id, productoToSave);
            } else {
              // Crear nuevo producto
              await productosDAO.getInstance().save(productoToSave);
            }
            exitosos++;
          } catch (error) {
            errores++;
            erroresDetalle.push(`Error en "${producto.nombre || 'sin nombre'}": ${error.message}`);
            console.error('Error al importar producto:', error);
          }
        }

        this.$q.loading.hide();

        // Recargar lista
        await this.get();

        // Mostrar resultado
        if (errores === 0) {
          this.$q.notify({
            position: 'top',
            type: 'positive',
            message: `Se importaron ${exitosos} producto(s) correctamente`,
            timeout: 3000
          });
        } else {
          this.$q.notify({
            position: 'top',
            type: 'warning',
            message: `Se importaron ${exitosos} producto(s). ${errores} error(es).`,
            timeout: 5000,
            actions: [
              {
                label: 'Ver detalles',
                handler: () => {
                  this.$q.dialog({
                    title: 'Errores de importación',
                    message: erroresDetalle.join('\n'),
                    html: true
                  });
                }
              }
            ]
          });
        }
      } catch (error) {
        this.$q.loading.hide();
        this.$q.notify({
          position: 'top',
          type: 'negative',
          message: `Error al leer el archivo: ${error.message}`
        });
        console.error('Error al importar CSV:', error);
      }

      // Limpiar input
      event.target.value = '';
    },
    readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Error al leer el archivo'));
        reader.readAsText(file, 'UTF-8');
      });
    },
    parseCSV(text) {
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        return [];
      }

      // Detectar encabezados (primera línea)
      const headerLine = lines[0].toLowerCase();
      const headers = this.parseCSVLine(lines[0]);

      // Mapear índices de columnas
      const columnMap = {
        nombre: -1,
        costo: -1,
        cantidad: -1,
        porcentaje_ganancia: -1,
        porcentaje_iva: -1
      };

      headers.forEach((header, index) => {
        const headerLower = header.toLowerCase().trim().replace(/"/g, '');
        if (headerLower.includes('nombre')) columnMap.nombre = index;
        else if (headerLower.includes('costo')) columnMap.costo = index;
        else if (headerLower.includes('cantidad')) columnMap.cantidad = index;
        else if (headerLower.includes('ganancia')) columnMap.porcentaje_ganancia = index;
        else if (headerLower.includes('iva')) columnMap.porcentaje_iva = index;
      });

      // Validar que al menos el nombre esté presente
      if (columnMap.nombre === -1) {
        throw new Error('No se encontró la columna "Nombre" en el CSV');
      }

      // Parsear datos
      const productos = [];
      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length === 0) continue;

        const producto = {
          _linea: i + 1,
          nombre: columnMap.nombre >= 0 ? (values[columnMap.nombre] || '').replace(/^"|"$/g, '') : '',
          costo: columnMap.costo >= 0 ? parseFloat(values[columnMap.costo] || 0) : 0,
          cantidad: columnMap.cantidad >= 0 ? parseFloat(values[columnMap.cantidad] || 0) : 0,
          porcentaje_ganancia: columnMap.porcentaje_ganancia >= 0 ? parseFloat(values[columnMap.porcentaje_ganancia] || 0) : 0,
          porcentaje_iva: columnMap.porcentaje_iva >= 0 ? parseFloat(values[columnMap.porcentaje_iva] || 0) : 0
        };

        productos.push(producto);
      }

      return productos;
    },
    parseCSVLine(line) {
      const values = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Comilla escapada
            current += '"';
            i++; // Saltar siguiente comilla
          } else {
            // Inicio o fin de campo entre comillas
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // Fin de campo
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }

      // Agregar último campo
      values.push(current.trim());

      return values;
    },
    async migrarValorACosto() {
      let migrados = 0;
      for (const producto of this.data) {
        // Logica de migración: si costo es 0 y hay valor, mover valor a costo
        if ((!producto.costo || producto.costo === 0) && (producto.valor && producto.valor > 0)) {
          producto.costo = producto.valor;
          // Actualizar en DB
          await productosDAO.getInstance().update(producto.id, { costo: producto.costo });
          migrados++;
        }
      }
      if (migrados > 0) {
        console.log(`Se migraron ${migrados} productos de valor a costo`);
        this.$q.notify({
          position: 'top',
          type: 'positive',
          message: `Se actualizaron ${migrados} productos a la nueva estructura de costos.`
        });
      }
    },
    save() {
      // Validar que hay valor del dólar si se ingresó en Bs
      if (this.ingresarEnBs && !this.valor_dolar) {
        this.$q.notify({
          position: 'top',
          type: 'negative',
          message: 'No hay valor del dólar configurado. Por favor, configura un valor del dólar en la sección "Valor Dolar" primero.'
        });
        // Actualizar el valor del dólar por si acaso
        this.getDolar();
        return;
      }

      if (this.form.nombre.trim() === '') {
        this.$q.notify({
          position: 'top',
          type: 'negative',
          message: 'Debe ingresar el nombre del producto'
        });
        return;
      }

      this.$q.loading.show();
      this.form.create_at = this.fechaCreacion;

      // Si se ingresó en Bs, convertir a USD
      if (this.ingresarEnBs && this.valor_dolar) {
        if (this.form.costo_bs) {
          this.form.costo = parseFloat((parseFloat(this.form.costo_bs) / parseFloat(this.valor_dolar)).toFixed(2));
        } else {
          this.form.costo = 0;
        }
      } else {
        this.form.costo = parseFloat(parseFloat(this.form.costo || 0).toFixed(2));
      }

      this.form.porcentaje_ganancia = parseFloat(parseFloat(this.form.porcentaje_ganancia || 0).toFixed(2));
      this.form.porcentaje_iva = parseFloat(parseFloat(this.form.porcentaje_iva || 0).toFixed(2));
      this.form.cantidad = parseFloat(parseFloat(this.form.cantidad).toFixed(2));
      this.form.nombre = this.form.nombre.toUpperCase();

      // Eliminar campos temporales antes de guardar
      const formToSave = { ...this.form };
      delete formToSave.valor_bs;
      delete formToSave.costo_bs;

      productosDAO.getInstance().save(formToSave).then(async (id) => {
        // Registrar Movimiento Inicial (ENTRADA)
        try {
          const movimiento = new Movimientos();
          movimiento.producto_id = id;
          movimiento.tipo = 'ENTRADA';
          movimiento.cantidad = formToSave.cantidad;
          movimiento.fecha = Date.now();
          movimiento.referencia = 'Inventario Inicial';
          movimiento.create_at = this.fechaCreacion;
          await movimientosDAO.getInstance().save(movimiento);
        } catch (error) {
          console.error("Error al registrar movimiento inicial:", error);
        }

        this.m_nuevo_producto = false;
        this.form = new Productos();
        this.get();
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
    editarProducto(producto) {
      this.form_editar = { ...producto };
      // Asegurar que porcentaje_iva exista (para productos antiguos sin IVA)
      if (this.form_editar.porcentaje_iva === undefined || this.form_editar.porcentaje_iva === null) {
        this.$set(this.form_editar, 'porcentaje_iva', 0);
      }
      this.$set(this.form_editar, 'valor_bs', null);
      this.$set(this.form_editar, 'costo_bs', null);
      this.ingresarEnBsEditar = false;
      this.m_editar_producto = true;
    },
    async actualizarProducto(id) {
      // Validar que hay valor del dólar si se ingresó en Bs
      if (this.ingresarEnBsEditar && !this.valor_dolar) {
        this.$q.notify({
          position: 'top',
          type: 'negative',
          message: 'No hay valor del dólar configurado. Por favor, configura un valor del dólar en la sección "Valor Dolar" primero.'
        });
        // Actualizar el valor del dólar por si acaso
        this.getDolar();
        return;
      }

      this.$q.loading.show();
      this.form_editar.create_at = this.fechaCreacion;

      // Si se ingresó en Bs, convertir a USD
      if (this.ingresarEnBsEditar && this.valor_dolar) {
        if (this.form_editar.costo_bs) {
          this.form_editar.costo = parseFloat((parseFloat(this.form_editar.costo_bs) / parseFloat(this.valor_dolar)).toFixed(2));
        } else {
          this.form_editar.costo = 0;
        }
      } else {
        this.form_editar.costo = parseFloat(parseFloat(this.form_editar.costo || 0).toFixed(2));
      }

      this.form_editar.porcentaje_ganancia = parseFloat(parseFloat(this.form_editar.porcentaje_ganancia || 0).toFixed(2));
      this.form_editar.porcentaje_iva = parseFloat(parseFloat(this.form_editar.porcentaje_iva || 0).toFixed(2));
      this.form_editar.cantidad = parseFloat(parseFloat(this.form_editar.cantidad).toFixed(2));
      this.form_editar.nombre = this.form_editar.nombre.toUpperCase();

      // Eliminar campos temporales antes de guardar
      const formToSave = { ...this.form_editar };
      delete formToSave.valor_bs;
      delete formToSave.costo_bs;

      // Obtener producto anterior para calcular diferencia
      let diff = 0;
      try {
        const productoAnterior = await productosDAO.getInstance().getOne(id);
        if (productoAnterior) {
          diff = formToSave.cantidad - productoAnterior.cantidad;
        }
      } catch (error) {
        console.error("Error al obtener producto anterior:", error);
      }

      await productosDAO.getInstance().update(id, formToSave).then(async () => {
        // Registrar Movimiento de Ajuste (AJUSTE) si hubo cambio en cantidad
        if (diff !== 0) {
          try {
            const movimiento = new Movimientos();
            movimiento.producto_id = id;
            movimiento.tipo = 'AJUSTE';
            movimiento.cantidad = diff; // Puede ser negativo o positivo
            movimiento.fecha = Date.now();
            movimiento.referencia = 'Edición de Producto';
            movimiento.create_at = this.fechaCreacion;
            await movimientosDAO.getInstance().save(movimiento);
          } catch (error) {
            console.error("Error al registrar ajuste:", error);
          }
        }

        this.form_editar = {};
        this.m_editar_producto = false;
        this.get();
        this.$q.loading.hide();
        this.$q.notify({
          position: 'top',
          type: 'positive',
          message: `Datos actualizados.`
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
    agregarCantidad(producto) {
      this.m_cantidad_producto = true;
      this.form_cantidad = producto;
    },
    async actualizarCantidad(id) {
      if (this.cantidad_agregar === null || this.cantidad_agregar === undefined || this.cantidad_agregar === '') {
        this.$q.notify({
          position: 'top',
          type: 'negative',
          message: 'Debe ingresar la cantidad'
        });
        return;
      }
      if (parseFloat(this.cantidad_agregar) <= 0) {
        this.$q.notify({
          position: 'top',
          type: 'negative',
          message: 'La cantidad debe ser mayor a 0'
        });
        return;
      }
      this.$q.loading.show();
      this.form_cantidad.create_at = this.fechaCreacion;
      this.form_cantidad.cantidad = parseFloat((parseFloat(this.form_cantidad.cantidad) + parseFloat(this.cantidad_agregar)).toFixed(2));
      await productosDAO.getInstance().update(id, this.form_cantidad).then(async () => {
        // Registrar Movimiento (ENTRADA)
        try {
          const movimiento = new Movimientos();
          movimiento.producto_id = id;
          movimiento.tipo = 'ENTRADA';
          movimiento.cantidad = parseFloat(this.cantidad_agregar);
          movimiento.fecha = Date.now();
          movimiento.referencia = 'Agregado Manualmente';
          movimiento.create_at = this.fechaCreacion;
          await movimientosDAO.getInstance().save(movimiento);
        } catch (error) {
          console.error("Error al registrar entrada manual:", error);
        }

        this.form_cantidad = {};
        this.cantidad_agregar = null;
        this.m_cantidad_producto = false;
        this.get();
        this.$q.loading.hide();
        this.$q.notify({
          position: 'top',
          type: 'positive',
          message: `Cantidad agregada.`
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
    deleteR(id) {
      if (id) {
        this.$q.dialog({
          title: '¿Desea borrar este registro?',
          message: '<strong class="text-red">¡Los cambios no podrán deshacerse!</strong>',
          html: true,
          cancel: true,
          persistent: true
        }).onOk(() => {
          this.$q.loading.show();
          productosDAO.getInstance().delete(id).then(() => {
            this.get();
            this.$q.loading.hide();
            this.$q.notify({
              position: 'top',
              type: 'positive',
              message: `¡Datos eliminados!`
            });
          });
        }).onCancel(() => {
        })
      } else {
        this.$q.notify({
          position: 'top',
          type: 'warning',
          message: `¡Selecione un registro!`
        });
      }
    }
  }
}
</script>
