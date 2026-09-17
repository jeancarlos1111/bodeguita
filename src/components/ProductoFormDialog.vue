<template>
  <q-dialog :value="value" @input="$emit('input', $event)" persistent transition-show="scale" transition-hide="scale">
    <q-card style="width: 500px; max-width: 90vw; border-radius: 12px;">
      <q-toolbar class="bg-primary text-white">
        <q-avatar square>
          <img :src="getPublicPath('icons/favicon-128x128.png')">
        </q-avatar>
        <q-toolbar-title class="text-weight-bold">
          {{ isEdit ? 'Editar' : 'Nuevo' }} Producto
        </q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-card-section class="q-gutter-y-md q-pt-lg">
        <!-- Nombre -->
        <q-input filled v-model="form.nombre" label="Nombre del Producto" 
          :rules="[val => !!val || 'El nombre es obligatorio']"
          @input="form.nombre = form.nombre.toUpperCase()" />

        <!-- Código de Barras y Escaneo -->
        <div class="row items-start q-col-gutter-sm">
          <div class="col">
            <q-input filled v-model="form.codigo_barras" label="Código de Barras"
              hint="Opcional. Escanea con un lector externo o con la cámara.">
              <template v-slot:append>
                <q-icon name="qr_code_scanner" />
              </template>
            </q-input>
          </div>
          <div class="col-auto">
            <barcode-scanner @scanned="form.codigo_barras = $event" mode="single" class="q-mt-xs" />
          </div>
        </div>

        <!-- Categoría -->
        <q-select filled v-model="form.categoria_id" :options="categorias" label="Categoría"
          emit-value map-options option-label="nombre" option-value="id" clearable>
          <template v-slot:append>
            <q-btn round dense flat icon="settings" @click.stop="$emit('manage-categories')" />
          </template>
        </q-select>

        <!-- Moneda y Costo -->
        <div class="bg-grey-2 q-pa-sm rounded-borders">
          <q-toggle v-model="ingresarEnBs" 
            :label="`Ingresar costo en Bs (Tasa: ${$formatMoney(valorDolar)})`"
            color="primary" :disable="!valorDolar" />
            
          <q-input v-if="!ingresarEnBs" filled v-model.number="form.costo" type="number" 
            label="Costo (USD)" input-class="text-right" step="0.01" />
          <q-input v-else filled v-model.number="form.costo_bs" type="number" 
            label="Costo (Bs)" input-class="text-right" step="0.01">
            <template v-slot:append v-if="form.costo_bs && valorDolar">
              <div class="text-caption text-grey">≈ ${{ (form.costo_bs / valorDolar).toFixed(2) }}</div>
            </template>
          </q-input>
        </div>

        <!-- Márgenes e Impuestos -->
        <div class="row q-col-gutter-sm">
          <q-input class="col-6" filled v-model.number="form.porcentaje_ganancia" type="number" 
            label="% Ganancia" input-class="text-right" />
          <q-input class="col-6" filled v-model.number="form.porcentaje_iva" type="number" 
            label="% IVA" input-class="text-right" />
        </div>

        <!-- Cantidad Inicial (Solo en creación) -->
        <q-input v-if="!isEdit" filled v-model.number="form.cantidad" type="number" 
          label="Cantidad Inicial" input-class="text-right" />

        <!-- Vista previa precio de venta -->
        <div class="q-pa-md bg-green-1 rounded-borders text-center">
          <div class="text-caption text-primary">Precio de Venta Sugerido</div>
          <div class="text-h5 text-weight-bold text-primary">
            Bs {{ $formatMoney(precioVentaBs) }}
          </div>
          <div class="text-subtitle1 text-grey-7">
            $ {{ $formatMoneyUSD(precioVentaUsd) }}
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
        <q-btn unelevated label="Guardar Producto" color="primary" @click="save" :loading="loading" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import Decimal from 'decimal.js';
import BarcodeScanner from './BarcodeScanner.vue';

export default {
  name: 'ProductoFormDialog',
  components: { BarcodeScanner },
  props: {
    value: Boolean,
    isEdit: Boolean,
    initialData: Object,
    categorias: Array,
    valorDolar: Number
  },
  data() {
    return {
      loading: false,
      ingresarEnBs: false,
      form: {
        nombre: '',
        codigo_barras: '',
        categoria_id: null,
        costo: 0,
        costo_bs: 0,
        porcentaje_ganancia: 30,
        porcentaje_iva: 0,
        cantidad: 0
      }
    };
  },
  watch: {
    value(newVal) {
      if (newVal) {
        this.resetForm();
      }
    }
  },
  computed: {
    precioVentaUsd() {
      const costo = this.ingresarEnBs && this.valorDolar 
        ? new Decimal(this.form.costo_bs || 0).div(this.valorDolar)
        : new Decimal(this.form.costo || 0);
        
      const ganancia = new Decimal(this.form.porcentaje_ganancia || 0).div(100);
      const iva = new Decimal(this.form.porcentaje_iva || 0).div(100);
      
      const precioBase = costo.mul(new Decimal(1).plus(ganancia));
      return precioBase.mul(new Decimal(1).plus(iva)).toNumber();
    },
    precioVentaBs() {
      return this.precioVentaUsd * (this.valorDolar || 0);
    }
  },
  methods: {
    resetForm() {
      if (this.isEdit && this.initialData) {
        this.form = JSON.parse(JSON.stringify(this.initialData));
        this.ingresarEnBs = !!(this.form.costo_bs && this.form.costo_bs > 0);
      } else {
        this.form = {
          nombre: '',
          codigo_barras: '',
          categoria_id: null,
          costo: 0,
          costo_bs: 0,
          porcentaje_ganancia: 30,
          porcentaje_iva: 0,
          cantidad: 0
        };
        this.ingresarEnBs = false;
      }
    },
    async save() {
      if (!this.form.nombre.trim()) {
        this.$q.notify({ type: 'negative', message: 'El nombre es obligatorio' });
        return;
      }

      this.loading = true;
      
      // Asegurar conversiones finales
      if (this.ingresarEnBs && this.valorDolar) {
        this.form.costo = new Decimal(this.form.costo_bs || 0).div(this.valorDolar).toDecimalPlaces(6).toNumber();
      } else {
        this.form.costo_bs = 0;
      }

      this.$emit('save', JSON.parse(JSON.stringify(this.form)));
      this.loading = false;
    },
    getPublicPath(url) {
      return (this.$router.options.base || '') + url;
    }
  }
}
</script>
