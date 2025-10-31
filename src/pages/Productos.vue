<template>
  <q-page class="bg-grey-3 q-pa-md" padding>
    <div class="row q-mb-md">
      <q-btn class="col" color="primary" icon="create" label="nuevo producto" @click="dialogoNuevoValor" />
    </div>
    <q-table
      title="Productos"
      :data="data"
      :columns="columns"
      :filter="filter"
      no-data-label="No encontré nada para ti"
      no-results-label="El filtro no reveló ningún resultado."
      row-key="nombre"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar">
          <q-icon slot="append" name="search" />
        </q-input>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="nombre" :props="props">
            {{ props.row.nombre }}
          </q-td>
          <q-td key="valor" :props="props">
              {{ new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(props.row.valor) }}
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
                  {{ new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(calcularPrecioVenta(props.row.valor, props.row.porcentaje_ganancia, props.row.porcentaje_iva)) }}
                </div>
                <div class="text-caption text-grey-7" v-if="props.row.porcentaje_iva">
                  Sin IVA: {{ new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(calcularPrecioSinIva(props.row.valor, props.row.porcentaje_ganancia)) }}
                  | IVA: {{ new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(calcularIva(calcularPrecioSinIva(props.row.valor, props.row.porcentaje_ganancia), props.row.porcentaje_iva)) }}
                </div>
              </div>
          </q-td>
          <q-td key="ganancia_unitaria" :props="props">
              <span class="text-positive text-weight-bold">
                {{ new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(calcularGananciaUnitaria(props.row)) }}
              </span>
          </q-td>
          <q-td key="cantidad" :props="props">
              {{ props.row.cantidad }}
          </q-td>
          <q-td key="create_at" :props="props">
              {{ hoyFecha(props.row.create_at) }}
          </q-td>
          <q-td key="id" :props="props">
              <q-btn-group>
                <q-btn flat round color="info" icon="add" @click="agregarCantidad(props.row)" />
          <q-btn flat round color="warning" icon="edit" @click="editarProducto(props.row)" />
          <q-btn flat round color="negative" icon="delete" @click.stop="deleteR(props.row.id)" />
        </q-btn-group>
          </q-td>
        </q-tr>
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

          <q-btn flat round dense icon="close" @click="cerrar"  />
        </q-toolbar>

        <q-card-section>
          <div class="q-gutter-md">
            <q-input v-model="form.nombre" label="Nombre" />
            <q-toggle
              v-model="ingresarEnBs"
              :label="`Ingresar valores en Bolívares (Bs)${valor_dolar ? ' - Dólar: Bs ' + new Intl.NumberFormat('es-VE').format(valor_dolar) : ' - Sin valor del dólar'}`"
              color="primary"
              :disable="!valor_dolar"
              @input="toggleMoneda"
            />
            <q-input
              v-if="!ingresarEnBs"
              v-model.number="form.valor"
              type="number"
              mask="#.##"
              fill-mask="0"
              reverse-fill-mask
              input-class="text-right"
              label="Valor Base (USD)"
              hint="Precio base antes de aplicar ganancia"
            />
            <q-input
              v-else
              v-model.number="form.valor_bs"
              type="number"
              mask="#.##"
              fill-mask="0"
              reverse-fill-mask
              input-class="text-right"
              label="Valor Base (Bs)"
              hint="Precio base antes de aplicar ganancia. Se convertirá automáticamente a USD"
            >
              <template v-slot:append v-if="form.valor_bs && valor_dolar">
                <q-chip dense color="primary" text-color="white">
                  ${{ (form.valor_bs / valor_dolar).toFixed(2) }}
                </q-chip>
              </template>
            </q-input>
            <q-input
              v-if="!ingresarEnBs"
              v-model.number="form.costo"
              type="number"
              mask="#.##"
              fill-mask="0"
              reverse-fill-mask
              input-class="text-right"
              label="Costo (USD)"
            />
            <q-input
              v-else
              v-model.number="form.costo_bs"
              type="number"
              mask="#.##"
              fill-mask="0"
              reverse-fill-mask
              input-class="text-right"
              label="Costo (Bs)"
              hint="Se convertirá automáticamente a USD"
            >
              <template v-slot:append v-if="form.costo_bs && valor_dolar">
                <q-chip dense color="primary" text-color="white">
                  ${{ (form.costo_bs / valor_dolar).toFixed(2) }}
                </q-chip>
              </template>
            </q-input>
            <q-input v-model.number="form.porcentaje_ganancia" type="number" mask="#.##" fill-mask="0" reverse-fill-mask input-class="text-right" label="Porcentaje de Ganancia (%)" />
            <q-input v-model.number="form.porcentaje_iva" type="number" mask="#.##" fill-mask="0" reverse-fill-mask input-class="text-right" label="IVA (%)" hint="Impuesto que se sumará al precio de venta" />
            <q-input v-model.number="form.cantidad" type="number" mask="#.##" fill-mask="0" reverse-fill-mask input-class="text-right" label="Cantidad" />
            <input type="hidden" v-model="form.create_at">
          </div>
        </q-card-section>
        <q-separator />

        <q-card-actions align="right">
          <q-btn flat color="primary" label="Guardar" @click="save" />
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

          <q-btn flat round dense icon="close" @click="cerrarEditar"  />
        </q-toolbar>

        <q-card-section>
          <div class="q-gutter-md">
            <q-input v-model="form_editar.nombre" label="Nombre" />
            <q-toggle
              v-model="ingresarEnBsEditar"
              :label="`Ingresar valores en Bolívares (Bs)${valor_dolar ? ' - Dólar: Bs ' + new Intl.NumberFormat('es-VE').format(valor_dolar) : ' - Sin valor del dólar'}`"
              color="primary"
              :disable="!valor_dolar"
              @input="toggleMonedaEditar"
            />
            <q-input
              v-if="!ingresarEnBsEditar"
              v-model.number="form_editar.valor"
              type="number"
              mask="#.##"
              fill-mask="0"
              reverse-fill-mask
              input-class="text-right"
              label="Valor Base (USD)"
              hint="Precio base antes de aplicar ganancia"
            />
            <q-input
              v-else
              v-model.number="form_editar.valor_bs"
              type="number"
              mask="#.##"
              fill-mask="0"
              reverse-fill-mask
              input-class="text-right"
              label="Valor Base (Bs)"
              hint="Precio base antes de aplicar ganancia. Se convertirá automáticamente a USD"
            >
              <template v-slot:append v-if="form_editar.valor_bs && valor_dolar">
                <q-chip dense color="primary" text-color="white">
                  ${{ (form_editar.valor_bs / valor_dolar).toFixed(2) }}
                </q-chip>
              </template>
            </q-input>
            <q-input
              v-if="!ingresarEnBsEditar"
              v-model.number="form_editar.costo"
              type="number"
              mask="#.##"
              fill-mask="0"
              reverse-fill-mask
              input-class="text-right"
              label="Costo (USD)"
            />
            <q-input
              v-else
              v-model.number="form_editar.costo_bs"
              type="number"
              mask="#.##"
              fill-mask="0"
              reverse-fill-mask
              input-class="text-right"
              label="Costo (Bs)"
              hint="Se convertirá automáticamente a USD"
            >
              <template v-slot:append v-if="form_editar.costo_bs && valor_dolar">
                <q-chip dense color="primary" text-color="white">
                  ${{ (form_editar.costo_bs / valor_dolar).toFixed(2) }}
                </q-chip>
              </template>
            </q-input>
            <q-input v-model.number="form_editar.porcentaje_ganancia" type="number" mask="#.##" fill-mask="0" reverse-fill-mask input-class="text-right" label="Porcentaje de Ganancia (%)" />
            <q-input v-model.number="form_editar.porcentaje_iva" type="number" mask="#.##" fill-mask="0" reverse-fill-mask input-class="text-right" label="IVA (%)" hint="Impuesto que se sumará al precio de venta" />
            <q-input v-model.number="form_editar.cantidad" type="number" mask="#.##" fill-mask="0" reverse-fill-mask input-class="text-right" label="Cantidad" />
            <input type="hidden" v-model="form_editar.create_at">
          </div>
        </q-card-section>
        <q-separator />

        <q-card-actions align="right">
          <q-btn flat color="primary" label="Guardar" @click="actualizarProducto(form_editar.id)" />
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

          <q-btn flat round dense icon="close" @click="cerrarCantidad"  />
        </q-toolbar>

        <q-card-section>
          <div class="q-gutter-md">
            <q-input v-model.number="form_cantidad.cantidad" type="number" mask="#.##" fill-mask="0" reverse-fill-mask input-class="text-right" label="Cantidad Actual" readonly />
            <q-input v-model.number="cantidad_agregar" type="number" mask="#.##" fill-mask="0" reverse-fill-mask input-class="text-right" label="Cantidad a agregar"  />
            <input type="hidden" v-model="form_cantidad.create_at">
          </div>
        </q-card-section>
        <q-separator />

        <q-card-actions align="right">
          <q-btn flat color="primary" label="Guardar" @click="actualizarCantidad(form_cantidad.id)" />
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
export default {
  name: 'Productos',
  data () {
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
          name: 'valor',
          required: true,
          label: 'Valor Base',
          align: 'center',
          field: row => row.valor,
          format: val => `${ new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) }`,
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
            if (!row.valor) return 0;
            const precioSinIva = row.valor + (row.valor * porcentaje / 100);
            const montoIva = precioSinIva * (iva / 100);
            return precioSinIva + montoIva;
          },
          format: val => `${ new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) }`,
          sortable: true
        },
        {
          name: 'ganancia_unitaria',
          required: true,
          label: 'Ganancia/Unidad',
          align: 'center',
          field: row => {
            const porcentaje = row.porcentaje_ganancia || 0;
            const iva = row.porcentaje_iva || 0;
            if (!row.valor) return 0;
            const precioSinIva = row.valor + (row.valor * porcentaje / 100);
            const montoIva = precioSinIva * (iva / 100);
            const precioVenta = precioSinIva + montoIva;
            const costo = row.costo || 0;
            return precioVenta - costo;
          },
          format: val => `${ new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) }`,
          sortable: true
        },
        {
          name: 'cantidad',
          required: true,
          label: 'Cantidad',
          align: 'center',
          field: row => row.cantidad,
          format: val => `${ new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) }`,
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
    this.get();
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
    calcularPrecioVenta(valor, porcentajeGanancia, porcentajeIva) {
      if (!valor) return 0;
      const porcentaje = porcentajeGanancia || 0;
      const iva = porcentajeIva || 0;
      // Precio sin IVA: Valor Base + Ganancia
      const precioSinIva = valor + (valor * porcentaje / 100);
      // IVA sobre el precio sin IVA
      const montoIva = precioSinIva * (iva / 100);
      // Precio final con IVA
      return parseFloat((precioSinIva + montoIva).toFixed(2));
    },
    calcularPrecioSinIva(valor, porcentajeGanancia) {
      if (!valor) return 0;
      const porcentaje = porcentajeGanancia || 0;
      return parseFloat((valor + (valor * porcentaje / 100)).toFixed(2));
    },
    calcularIva(precioSinIva, porcentajeIva) {
      if (!precioSinIva) return 0;
      const iva = porcentajeIva || 0;
      return parseFloat((precioSinIva * (iva / 100)).toFixed(2));
    },
    calcularGananciaUnitaria(producto) {
      const precioVenta = this.calcularPrecioVenta(producto.valor, producto.porcentaje_ganancia, producto.porcentaje_iva);
      const costo = producto.costo || 0;
      return parseFloat((precioVenta - costo).toFixed(2));
    },
    dialogoNuevoValor() {
      this.m_nuevo_producto = true;
    },
    cerrar() {
      this.form = new Productos();
      this.$set(this.form, 'valor_bs', null);
      this.$set(this.form, 'costo_bs', null);
      this.ingresarEnBs = false;
      this.m_nuevo_producto = false;
    },
    cerrarEditar(){
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
        this.form.valor_bs = null;
        this.form.costo_bs = null;
      } else {
        // Si se activa, convertir valores existentes a Bs si hay valor_dolar
        if (this.valor_dolar && this.form.valor) {
          this.form.valor_bs = this.form.valor * this.valor_dolar;
        }
        if (this.valor_dolar && this.form.costo) {
          this.form.costo_bs = this.form.costo * this.valor_dolar;
        }
      }
    },
    toggleMonedaEditar() {
      if (!this.ingresarEnBsEditar) {
        // Si se desactiva, limpiar valores en Bs
        this.form_editar.valor_bs = null;
        this.form_editar.costo_bs = null;
      } else {
        // Si se activa, convertir valores existentes a Bs si hay valor_dolar
        if (this.valor_dolar && this.form_editar.valor) {
          this.form_editar.valor_bs = this.form_editar.valor * this.valor_dolar;
        }
        if (this.valor_dolar && this.form_editar.costo) {
          this.form_editar.costo_bs = this.form_editar.costo * this.valor_dolar;
        }
      }
    },
    cerrarCantidad(){
      this.form_cantidad = {};
      this.m_cantidad_producto = false;
      this.cantidad_agregar = null;
    },
    async get() {
      this.$q.loading.show();
      await productosDAO.getInstance().get().then(result => { this.data = result});
      this.$q.loading.hide();
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

      this.$q.loading.show();
       this.form.create_at = this.fechaCreacion;

       // Si se ingresó en Bs, convertir a USD
       if (this.ingresarEnBs && this.valor_dolar) {
         if (this.form.valor_bs) {
           this.form.valor = parseFloat((parseFloat(this.form.valor_bs) / parseFloat(this.valor_dolar)).toFixed(2));
         } else {
           this.$q.notify({
             position: 'top',
             type: 'warning',
             message: 'Debe ingresar el valor del producto'
           });
           this.$q.loading.hide();
           return;
         }
         if (this.form.costo_bs) {
           this.form.costo = parseFloat((parseFloat(this.form.costo_bs) / parseFloat(this.valor_dolar)).toFixed(2));
         } else {
           this.form.costo = 0;
         }
       } else {
         this.form.valor = parseFloat(parseFloat(this.form.valor).toFixed(2));
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

      productosDAO.getInstance().save(formToSave).then(() => {
        this.m_nuevo_producto = false;
        this.form = new Productos();
        this.get();
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
         if (this.form_editar.valor_bs) {
           this.form_editar.valor = parseFloat((parseFloat(this.form_editar.valor_bs) / parseFloat(this.valor_dolar)).toFixed(2));
         } else {
           this.$q.notify({
             position: 'top',
             type: 'warning',
             message: 'Debe ingresar el valor del producto'
           });
           this.$q.loading.hide();
           return;
         }
         if (this.form_editar.costo_bs) {
           this.form_editar.costo = parseFloat((parseFloat(this.form_editar.costo_bs) / parseFloat(this.valor_dolar)).toFixed(2));
         } else {
           this.form_editar.costo = 0;
         }
       } else {
         this.form_editar.valor = parseFloat(parseFloat(this.form_editar.valor).toFixed(2));
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

       await productosDAO.getInstance().update(id, formToSave).then(() => {
        this.form_editar = {};
        this.m_editar_producto = false;
        this.get();
        this.$q.loading.hide();
        this.$q.notify({
          position: 'top',
          type: 'positive',
          message: `Datos actualizados.`
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
    agregarCantidad(producto) {
      this.m_cantidad_producto = true;
      this.form_cantidad = producto;
    },
    async actualizarCantidad(id) {
      this.$q.loading.show();
       this.form_cantidad.create_at = this.fechaCreacion;
       this.form_cantidad.cantidad = parseFloat((parseFloat(this.form_cantidad.cantidad) + parseFloat(this.cantidad_agregar)).toFixed(2));
       await productosDAO.getInstance().update(id, this.form_cantidad).then(() => {
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
      }).catch (function (e) {
        console.error(`Error: ${e.stack}`);
        this.$q.notify({
          position: 'top',
        type: 'negative',
        message: `Error: ${e.stack}`
      });
    });
    },
    deleteR(id) {
      if(id){
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
