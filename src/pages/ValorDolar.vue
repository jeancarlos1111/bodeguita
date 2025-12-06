<template>
  <q-page class="bg-grey-3 q-pa-md" padding>
    <div class="row q-mb-md">
      <q-btn class="col" color="primary" icon="create" label="Nuevo valor dolar" @click="dialogoNuevoValor" />
    </div>
    <q-table title="Valores Dolar" :data="data" :columns="columns" :filter="filter"
      no-data-label="No encontré nada para ti" no-results-label="El filtro no reveló ningún resultado."
      row-key="valor_dolar" selection="single" :selected.sync="selected" :grid="$q.screen.lt.md"
      card-class="bg-white rounded-card shadow-1">
      <template v-slot:top>
        <div class="row full-width items-center">
          <div class="col-6">
            <q-btn flat round color="negative" icon="delete" @click="deleteR" class="q-mr-sm"
              v-if="selected.length > 0">
              <q-tooltip transition-show="rotate" transition-hide="rotate">
                Eliminar registro seleccionado
              </q-tooltip>
            </q-btn>
          </div>
          <div class="col-6">
            <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar" class="full-width">
              <q-icon slot="append" name="search" />
            </q-input>
          </div>
        </div>
      </template>



      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card class="rounded-card shadow-1" :class="props.selected ? 'bg-indigo-1' : ''">
            <q-card-section class="row items-center justify-between">
              <div class="text-h6 text-primary text-weight-bold">Bs {{ new
                Intl.NumberFormat("es-VE").format(props.row.valor_dolar) }}</div>
              <q-checkbox v-model="props.selected" dense />
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="text-caption text-grey">Fecha de registro</div>
              <div>{{ hoyFecha(props.row.create_at) }}</div>
            </q-card-section>
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
    <!-- Dialogo para registrar el valor del dolar -->
    <q-dialog v-model="m_nuevo_valor" persistent transition-show="scale" transition-hide="scale">
      <q-card>
        <q-toolbar>
          <q-avatar square>
            <img :src="`${$router.options.base || ''}icons/favicon-128x128.png`">
          </q-avatar>

          <q-toolbar-title><span class="text-weight-bold">Nuevo Valor Dolar</span></q-toolbar-title>

          <q-btn flat round dense icon="close" @click="cerrar" />
        </q-toolbar>

        <q-card-section>
          <div class="q-gutter-md">
            <q-input v-model.number="form.valor_dolar" type="number" mask="#.##" fill-mask="0" reverse-fill-mask
              input-class="text-right" label="Nuevo Valor Dolar" />
            <input type="hidden" v-model="form.create_at">
          </div>
        </q-card-section>
        <q-separator />

        <q-card-actions align="right">
          <q-btn color="primary" label="Guardar" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { date } from 'quasar';
import { valor_dolarDAO } from '../db/valor_dolarDAO';
import { ValorDolar } from '../models/ValorDolar';
//const scrapeIt = require("scrape-it");
export default {
  name: 'ValorDolar',
  data() {
    return {
      form: new ValorDolar(),
      m_nuevo_valor: false,
      selected: [],
      data: [],
      filter: '',

      columns: [
        {
          name: 'valor_dolar',
          required: true,
          label: 'Valor Dolar',
          align: 'center',
          field: row => row.valor_dolar,
          format: val => `${new Intl.NumberFormat("es-VE").format(val)}`,
          sortable: true
        },
        { name: 'create_at', align: 'center', label: 'Fecha', field: 'create_at', sortable: true, format: val => `${this.hoyFecha(val)}` }
      ]
    }
  },
  mounted() {
    this.get();
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
    dialogoNuevoValor() {
      this.m_nuevo_valor = true;
    },
    cerrar() {
      this.form = new ValorDolar();
      this.m_nuevo_valor = false;
    },
    get() {
      valor_dolarDAO.getInstance().get().then(result => { this.data = result });
    },
    save() {
      this.$q.loading.show();
      this.form.create_at = this.fechaCreacion;
      this.form.valor_dolar = parseFloat(this.form.valor_dolar);
      valor_dolarDAO.getInstance().save(this.form).then(() => {
        this.m_nuevo_valor = false;
        this.form = new ValorDolar();
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
    deleteR() {
      console.log(this.selected);
      if (this.selected.length === 1) {
        this.$q.dialog({
          title: '¿Desea borrar este registro?',
          message: '<strong class="text-red">¡Los cambios no podrán deshacerse!</strong>',
          html: true,
          cancel: true,
          persistent: true
        }).onOk(() => {
          this.$q.loading.show();
          valor_dolarDAO.getInstance().delete(this.selected[0].id).then(() => {
            this.selected = [];
            this.get();
            this.$q.loading.hide();
            this.$q.notify({
              position: 'top',
              type: 'positive',
              message: `¡Datos eliminados!`
            });
          });
        }).onCancel(() => {
          this.selected = [];
        })
      } else {
        console.log(this.selected)
        this.$q.notify({
          position: 'top',
          type: 'warning',
          message: `¡Selecione un registro!`
        });
      }
    },
    async raspadorMonitorDolar() {
      const scrapeResult = await scrapeIt('https://monitordolarvzla.com/category/promedio-del-dolar/', {
        articles: {
          listItem: "article.post.type-post",
          data: {
            title: "h2.entry-title",
            content: "div.entry-content p"
          }
        }
      });
      //console.log(scrapeResult.data.articles[0]);
      /*console.log(scrapeResult.data.articles[0].content.search('Bs'));
      console.log(scrapeResult.data.articles[0].content.search('por 1 dólar'));*/
      let inicio = scrapeResult.data.articles[0].content.search('Bs') + 3;
      let fin = scrapeResult.data.articles[0].content.search('por 1 dólar') - 45;
      let valor_sin_procesar = scrapeResult.data.articles[0].content.substr(inicio, fin);
      let valor_procesado = valor_sin_procesar.replace(/./g, "");
      console.log(valor_procesado);

    }
  }
}
</script>
