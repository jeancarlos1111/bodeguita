<template>
  <q-page class=" q-pa-md" padding>
    <div class="row q-mb-md">
      <q-btn class="col" color="primary" icon="create" label="Nuevo valor dolar" @click="dialogoNuevoValor" />
    </div>
    <q-table title="Valores Dolar" :data="data" :columns="columns" :filter="filter"
      no-data-label="No encontré nada para ti" no-results-label="El filtro no reveló ningún resultado."
      row-key="valor_dolar" selection="single" :selected.sync="selected" :grid="$q.screen.lt.md"
      card-class=" rounded-card shadow-1">
      <template v-slot:top>
        <div class="row full-width items-center q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <div class="text-h6 text-primary text-weight-bold">Historial de Tasa</div>
          </div>
          <q-space class="gt-xs" />
          <div class="col-12 col-sm-4">
            <q-input filled dense debounce="300" v-model="filter" placeholder="Buscar fecha o valor...">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>
      </template>



      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card class="rounded-card shadow-1 transition-card" :class="props.selected ? 'bg-indigo-1' : ''">
            <q-card-section class="row items-center justify-between">
              <div>
                <div class="text-caption text-grey">Valor del Dólar</div>
                <div class="text-h5 text-primary text-weight-bold">
                  Bs {{ m_formatMoney(props.row.valor_dolar) }}
                </div>
              </div>
              <q-checkbox v-model="props.selected" dense color="primary" />
            </q-card-section>
            <q-separator inset />
            <q-card-section class="row items-center">
              <q-icon name="event" color="grey-7" size="sm" class="q-mr-sm" />
              <div class="text-subtitle2 text-grey-8">
                {{ m_formatDateTime(props.row.create_at) }}
              </div>
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
          format: val => this.m_formatMoney(val),
          sortable: true
        },
        { name: 'create_at', align: 'center', label: 'Fecha', field: 'create_at', sortable: true, format: val => this.m_formatDateTime(val) }
      ]
    }
  },
  mounted() {
    this.get();
  },
  computed: {
  },

  methods: {
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
      this.form.create_at = this.m_fechaCreacion;
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
      }).catch((e) => {
        console.error(`Error: ${e.stack}`);
        this.$q.notify({
          position: 'top',
          type: 'negative',
          message: `Error: ${e.stack}`
        });
      });
    },
    deleteR() {
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
