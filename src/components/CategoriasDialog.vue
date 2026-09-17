<template>
  <q-dialog :value="value" @input="$emit('input', $event)">
    <q-card style="min-width: 350px; border-radius: 12px;">
      <q-card-section class="row items-center">
        <div class="text-h6 text-primary">Categorías</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input dense filled v-model="nueva_categoria" label="Nueva Categoría" @keyup.enter="guardarCategoria">
          <template v-slot:append>
            <q-btn round dense flat icon="add" color="primary" @click="guardarCategoria" />
          </template>
        </q-input>
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-list separator>
          <q-item v-for="cat in categorias" :key="cat.id" class="q-py-sm">
            <q-item-section avatar>
              <q-icon name="category" color="grey-7" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ cat.nombre }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn size="sm" flat round color="negative" icon="delete_outline" @click="confirmarEliminar(cat.id)" />
            </q-item-section>
          </q-item>
        </q-list>
        
        <div v-if="categorias.length === 0" class="text-center q-pa-md text-grey">
          No hay categorías creadas.
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { categoriasDAO } from '../db/categoriasDAO';

export default {
  name: 'CategoriasDialog',
  props: {
    value: Boolean
  },
  data() {
    return {
      nueva_categoria: '',
      categorias: []
    };
  },
  watch: {
    value(newVal) {
      if (newVal) {
        this.loadCategorias();
      }
    }
  },
  methods: {
    async loadCategorias() {
      this.categorias = await categoriasDAO.get();
      this.$emit('updated', this.categorias);
    },
    async guardarCategoria() {
      if (!this.nueva_categoria.trim()) return;
      try {
        await categoriasDAO.save({ nombre: this.nueva_categoria.toUpperCase() });
        this.nueva_categoria = '';
        await this.loadCategorias();
        this.$q.notify({ type: 'positive', message: 'Categoría guardada' });
      } catch (e) {
        this.$q.notify({ type: 'negative', message: 'Error al guardar categoría' });
      }
    },
    confirmarEliminar(id) {
      this.$q.dialog({
        title: 'Eliminar Categoría',
        message: '¿Estás seguro? Los productos asociados dejarán de tener categoría.',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        await categoriasDAO.delete(id);
        await this.loadCategorias();
      });
    }
  }
}
</script>
