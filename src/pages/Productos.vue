<template>
  <q-page :class="$q.dark.isActive ? 'bg-dark' : ''" class="q-pa-md" padding>
    <!-- Header Buttons -->
    <div class="q-mb-md">
      <q-btn class="full-width q-mb-sm" color="primary" icon="add" label="Nuevo producto" unelevated
        @click="nuevoProducto" style="border-radius: 12px; font-weight: 600;" />
      <div class="row q-gutter-sm">
        <q-btn class="col" color="positive" icon="file_download" label="Exportar CSV" unelevated
          @click="exportarProductosCSV" :disable="data.length === 0" style="border-radius: 10px;" dense />
        <q-btn class="col" color="secondary" icon="file_upload" label="Importar CSV" unelevated
          @click="triggerImportCSV" style="border-radius: 10px;" dense />
      </div>
    </div>

    <!-- Hidden Input for CSV -->
    <input ref="fileInput" type="file" accept=".csv,text/csv" style="display: none" @change="importarProductosCSV" />

    <!-- Table -->
    <q-table :data="data" :columns="columns" row-key="id" :filter="filter" :pagination.sync="pagination"
      class="rounded-card shadow-1" :grid="$q.screen.lt.md">
      
      <template v-slot:top>
        <div class="col-12 row q-col-gutter-sm items-center">
          <div class="text-h6 text-primary col-12 col-sm-auto text-weight-bold">Inventario</div>
          <q-space class="gt-xs" />
          
          <q-select dense filled v-model="filtro_categoria" :options="categoriasOptions" label="Categoría"
            class="col-12 col-sm-3" emit-value map-options option-label="nombre" option-value="id" clearable
            @input="aplicarFiltros" />

          <q-select dense filled v-model="filtro_stock" :options="stockOptions" label="Stock"
            class="col-12 col-sm-2" emit-value map-options clearable @input="aplicarFiltros" />

          <q-input dense filled debounce="300" v-model="filter" placeholder="Buscar..." class="col-12 col-sm-3">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </template>

      <!-- Desktop View -->
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="nombre" :props="props">
            <div class="text-weight-medium">{{ props.row.nombre }}</div>
            <div class="text-caption text-grey" v-if="getNombreCategoria(props.row.categoria_id)">
              {{ getNombreCategoria(props.row.categoria_id) }}
            </div>
          </q-td>
          <q-td key="costo" :props="props" class="text-right">
            {{ $formatMoney(props.row.costo) }}
          </q-td>
          <q-td key="cantidad" :props="props" class="text-center">
            <q-chip :color="(props.row.cantidad || 0) < 5 ? 'negative' : 'positive'" text-color="white" dense>
              {{ props.row.cantidad }}
            </q-chip>
          </q-td>
          <q-td key="precio_venta" :props="props" class="text-right text-weight-bold text-primary">
            {{ $formatMoney(calcularPrecioVenta(props.row.costo, props.row.porcentaje_ganancia, props.row.porcentaje_iva)) }}
          </q-td>
          <q-td key="acciones" :props="props" class="text-center">
            <q-btn flat round color="primary" icon="edit" @click="editarProducto(props.row)" />
            <q-btn flat round color="secondary" icon="add_box" @click="agregarCantidad(props.row)" />
            <q-btn flat round color="negative" icon="delete" @click="deleteR(props.row.id)" />
          </q-td>
        </q-tr>
      </template>

      <!-- Mobile Grid View -->
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card class="rounded-card shadow-1">
            <q-card-section class="q-pb-none">
              <div class="row items-center justify-between">
                <div class="text-subtitle1 text-weight-bold text-primary">{{ props.row.nombre }}</div>
                <q-chip dense :color="(props.row.cantidad || 0) < 5 ? 'negative' : 'positive'" text-color="white">
                  Stock: {{ props.row.cantidad }}
                </q-chip>
              </div>
              <div class="text-caption text-grey">{{ getNombreCategoria(props.row.categoria_id) || 'Sin categoría' }}</div>
            </q-card-section>
            
            <q-separator inset class="q-my-sm" />
            
            <q-card-section class="q-pt-none">
              <div class="row justify-between">
                <div>
                  <div class="text-caption text-grey">Precio de Venta</div>
                  <div class="text-h6 text-primary">{{ $formatMoney(calcularPrecioVenta(props.row.costo, props.row.porcentaje_ganancia, props.row.porcentaje_iva)) }}</div>
                </div>
                <div class="text-right">
                  <q-btn flat round color="primary" icon="edit" @click="editarProducto(props.row)" />
                  <q-btn flat round color="secondary" icon="add_box" @click="agregarCantidad(props.row)" />
                  <q-btn flat round color="negative" icon="delete" @click="deleteR(props.row.id)" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>

    <!-- Components / Dialogs -->
    <producto-form-dialog 
      v-model="m_form_dialog" 
      :is-edit="is_editing" 
      :initial-data="selected_producto" 
      :categorias="categoriasOptions"
      :valor-dolar="$valor_dolar"
      @save="onSaveProducto"
      @manage-categories="m_gestionar_categorias = true"
    />

    <categorias-dialog 
      v-model="m_gestionar_categorias" 
      @updated="onCategoriasUpdated" 
    />

    <!-- Dialogo para agregar stock -->
    <q-dialog v-model="m_cantidad_producto" persistent>
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Reponer Stock</div>
          <div class="text-subtitle2 text-primary">{{ form_cantidad.nombre }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input v-model.number="cantidad_agregar" type="number" label="Cantidad a sumar" 
            autofocus @keyup.enter="actualizarCantidad(form_cantidad.id)" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn color="primary" label="Actualizar" @click="actualizarCantidad(form_cantidad.id)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import Decimal from 'decimal.js';
import { date } from 'quasar';
import { productosDAO } from '../db/productosDAO';
import { categoriasDAO } from '../db/categoriasDAO';
import { movimientosDAO } from '../db/movimientosDAO';
import { Movimientos } from '../models/Movimientos';

import ProductoFormDialog from '../components/ProductoFormDialog.vue';
import CategoriasDialog from '../components/CategoriasDialog.vue';

export default {
  name: 'Productos',
  components: { ProductoFormDialog, CategoriasDialog },
  data() {
    return {
      m_form_dialog: false,
      is_editing: false,
      selected_producto: null,
      m_gestionar_categorias: false,
      m_cantidad_producto: false,
      form_cantidad: {},
      cantidad_agregar: null,
      
      data: [],
      data_original: [],
      categoriasOptions: [],
      filter: '',
      filtro_categoria: null,
      filtro_stock: null,
      stockOptions: [
        { label: 'Agotados', value: 'agotado' },
        { label: 'Stock Bajo (< 5)', value: 'bajo' },
        { label: 'Con Stock', value: 'con_stock' }
      ],
      pagination: { rowsPerPage: 10 },
      columns: [
        { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
        { name: 'costo', label: 'Costo ($)', field: 'costo', align: 'right', sortable: true },
        { name: 'cantidad', label: 'Stock', field: 'cantidad', align: 'center', sortable: true },
        { name: 'precio_venta', label: 'P. Venta (Bs)', align: 'right' },
        { name: 'acciones', label: 'Acciones', align: 'center' }
      ]
    };
  },
  async mounted() {
    await this.loadCategorias();
    await this.get();
    this.$getDolar();
  },
  methods: {
    async loadCategorias() {
      this.categoriasOptions = await categoriasDAO.get();
    },
    onCategoriasUpdated(newCats) {
      this.categoriasOptions = newCats;
    },
    getNombreCategoria(id) {
      const cat = this.categoriasOptions.find(c => c.id === id);
      return cat ? cat.nombre : '';
    },
    async get() {
      this.$q.loading.show();
      try {
        this.data_original = await productosDAO.get();
        this.aplicarFiltros();
      } catch (e) {
        console.error(e);
      } finally {
        this.$q.loading.hide();
      }
    },
    aplicarFiltros() {
      let filtered = [...this.data_original];
      if (this.filtro_categoria) {
        filtered = filtered.filter(p => p.categoria_id === this.filtro_categoria);
      }
      if (this.filtro_stock === 'agotado') {
        filtered = filtered.filter(p => (p.cantidad || 0) <= 0);
      } else if (this.filtro_stock === 'bajo') {
        filtered = filtered.filter(p => (p.cantidad || 0) > 0 && (p.cantidad || 0) < 5);
      } else if (this.filtro_stock === 'con_stock') {
        filtered = filtered.filter(p => (p.cantidad || 0) >= 5);
      }
      this.data = filtered;
    },
    nuevoProducto() {
      this.is_editing = false;
      this.selected_producto = null;
      this.m_form_dialog = true;
    },
    editarProducto(producto) {
      this.is_editing = true;
      this.selected_producto = producto;
      this.m_form_dialog = true;
    },
    async onSaveProducto(formData) {
      this.$q.loading.show();
      try {
        if (this.is_editing) {
          await productosDAO.update(formData.id, formData);
          // Registrar movimiento de ajuste si cambió cantidad
          const old = this.data_original.find(p => p.id === formData.id);
          if (old && old.cantidad !== formData.cantidad) {
            await this.registrarMovimiento(formData.id, 'AJUSTE', formData.cantidad - old.cantidad, 'Edición de producto');
          }
        } else {
          formData.create_at = this.$getFechaCreacion();
          const id = await productosDAO.save(formData);
          await this.registrarMovimiento(id, 'ENTRADA', formData.cantidad, 'Inventario Inicial');
        }
        this.m_form_dialog = false;
        await this.get();
        this.$q.notify({ type: 'positive', message: 'Producto guardado exitosamente' });
      } catch (e) {
        console.error(e);
        this.$q.notify({ type: 'negative', message: 'Error al guardar producto' });
      } finally {
        this.$q.loading.hide();
      }
    },
    async registrarMovimiento(productoId, tipo, cantidad, referencia) {
      if (cantidad === 0) return;
      const m = new Movimientos();
      m.producto_id = productoId;
      m.tipo = tipo;
      m.cantidad = cantidad;
      m.fecha = Date.now();
      m.referencia = referencia;
      m.create_at = this.$getFechaCreacion();
      await movimientosDAO.save(m);
    },
    agregarCantidad(producto) {
      this.form_cantidad = { ...producto };
      this.cantidad_agregar = null;
      this.m_cantidad_producto = true;
    },
    async actualizarCantidad(id) {
      if (!this.cantidad_agregar || this.cantidad_agregar <= 0) return;
      this.$q.loading.show();
      try {
        const nuevaCantidad = parseFloat((this.form_cantidad.cantidad + this.cantidad_agregar).toFixed(2));
        await productosDAO.update(id, { cantidad: nuevaCantidad });
        await this.registrarMovimiento(id, 'ENTRADA', this.cantidad_agregar, 'Agregado manualmente');
        this.m_cantidad_producto = false;
        await this.get();
        this.$q.notify({ type: 'positive', message: 'Stock actualizado' });
      } catch (e) {
        console.error(e);
      } finally {
        this.$q.loading.hide();
      }
    },
    deleteR(id) {
      this.$q.dialog({
        title: '¿Borrar producto?',
        message: 'Esta acción no se puede deshacer.',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        await productosDAO.delete(id);
        await this.get();
        this.$q.notify({ type: 'positive', message: 'Producto eliminado' });
      });
    },
    calcularPrecioVenta(costo, ganancia, iva) {
      const c = new Decimal(costo || 0);
      const g = new Decimal(ganancia || 0).div(100);
      const i = new Decimal(iva || 0).div(100);
      const precioBase = c.mul(new Decimal(1).plus(g));
      return precioBase.mul(new Decimal(1).plus(i)).mul(this.$valor_dolar || 0).toNumber();
    },
    triggerImportCSV() { this.$refs.fileInput.click(); },
    importarProductosCSV(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split(/\r?\n/);
        this.$q.loading.show({ message: 'Importando productos...' });
        try {
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim();
            if (!row) continue;
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
            if (cols.length >= 5) {
              const nombre = cols[0];
              const costo = parseFloat(cols[1]) || 0;
              const cantidad = parseFloat(cols[2]) || 0;
              const porcentaje_ganancia = parseFloat(cols[3]) || 0;
              const porcentaje_iva = parseFloat(cols[4]) || 0;
              const codigo_barras = cols[5] || '';
              if (nombre) {
                const form = {
                   nombre, costo, cantidad, porcentaje_ganancia, porcentaje_iva, codigo_barras,
                   categoria_id: null, create_at: this.$getFechaCreacion()
                };
                const existe = await productosDAO.getNombre(nombre);
                if (existe) {
                  await productosDAO.update(existe.id, { costo, cantidad: existe.cantidad + cantidad });
                } else {
                  await productosDAO.save(form);
                }
              }
            }
          }
          await this.get();
          this.$q.notify({ type: 'positive', message: 'Productos importados' });
        } catch(err) {
          console.error(err);
          this.$q.notify({ type: 'negative', message: 'Error al importar CSV' });
        }
        this.$q.loading.hide();
        this.$refs.fileInput.value = '';
      };
      reader.readAsText(file);
    },
    exportarProductosCSV() {
      const csvRows = [];
      const headers = ['Nombre', 'Costo', 'Cantidad', 'Ganancia (%)', 'IVA (%)', 'Código de Barras'];
      csvRows.push(headers.join(','));
      this.data_original.forEach(p => {
        const row = [
          `"${(p.nombre || '').replace(/"/g, '""')}"`,
          p.costo || 0,
          p.cantidad || 0,
          p.porcentaje_ganancia || 0,
          p.porcentaje_iva || 0,
          `"${p.codigo_barras || ''}"`
        ];
        csvRows.push(row.join(','));
      });
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `productos_bodeguita_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
</script>
