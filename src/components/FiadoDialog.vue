<template>
  <q-dialog :value="value" @input="$emit('input', $event)" persistent>
    <q-card style="min-width: 350px; border-radius: 16px;">
      <q-card-section class="row items-center">
        <div class="text-h6 text-primary">Cliente para Fiado</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-sm items-end">
          <div class="col">
            <q-input filled v-model="cedulaSearch" label="Cédula" @keyup.enter="buscarCliente" autofocus />
          </div>
          <div class="col-auto">
            <q-btn icon="search" color="primary" @click="buscarCliente" class="q-mb-sm" round unelevated :loading="loading" />
          </div>
        </div>
      </q-card-section>

      <q-card-section v-if="clienteFound === false">
        <div class="text-subtitle2 text-orange q-mb-sm">Cliente no encontrado. Registrar nuevo:</div>
        <q-input filled v-model="clienteForm.nombre" label="Nombre y Apellido" class="q-mb-sm" />
        <q-input filled v-model="clienteForm.telefono" label="Teléfono" class="q-mb-sm" />
      </q-card-section>

      <q-card-section v-if="clienteFound">
        <div class="text-subtitle1 text-primary">
          <strong>Cliente:</strong> {{ clienteFound.nombre }} <br>
          <small>{{ clienteFound.telefono }}</small>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" v-close-popup />

        <q-btn v-if="clienteFound === false" label="Registrar y Procesar" color="primary"
          @click="registrarYContinuar" :loading="loading" />
        <q-btn v-if="clienteFound" label="Confirmar Fiado" color="primary" @click="confirmarFiadoExistente" :loading="loading" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { clientesDAO } from '../db/clientesDAO';
import { Clientes } from '../models/Clientes';

export default {
  name: 'FiadoDialog',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      cedulaSearch: '',
      clienteFound: null,
      clienteForm: new Clientes(),
      loading: false
    }
  },
  watch: {
    value(val) {
      if (val) {
        this.cedulaSearch = '';
        this.clienteFound = null;
        this.clienteForm = new Clientes();
      }
    }
  },
  methods: {
    async buscarCliente() {
      if (!this.cedulaSearch) return;
      this.loading = true;
      try {
        const cliente = await clientesDAO.getByCedula(this.cedulaSearch);
        if (cliente) {
          this.clienteFound = cliente;
          this.clienteForm = { ...cliente };
        } else {
          this.clienteFound = false;
          this.clienteForm = new Clientes();
          this.clienteForm.cedula = this.cedulaSearch;
        }
      } catch (e) {
        console.error(e);
        this.$q.notify({ type: 'negative', message: 'Error buscando cliente' });
      } finally {
        this.loading = false;
      }
    },
    async registrarYContinuar() {
      if (!this.clienteForm.nombre) {
        this.$q.notify({ type: 'warning', message: 'Ingrese el nombre del cliente' });
        return;
      }
      this.loading = true;
      try {
        this.clienteForm.create_at = this.$getFechaCreacion();
        const clienteId = await clientesDAO.save(this.clienteForm);
        this.$emit('confirm', {
          cliente_id: clienteId,
          cliente_nombre: this.clienteForm.nombre
        });
        this.$emit('input', false);
      } catch (e) {
        console.error(e);
        this.$q.notify({ type: 'negative', message: 'Error registrando cliente' });
      } finally {
        this.loading = false;
      }
    },
    confirmarFiadoExistente() {
      if (!this.clienteFound) return;
      this.$emit('confirm', {
        cliente_id: this.clienteFound.id,
        cliente_nombre: this.clienteFound.nombre
      });
      this.$emit('input', false);
    }
  }
}
</script>
