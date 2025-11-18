<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-avatar square>
        <img :src="`${$router.options.base || ''}icons/icon-128x128.png`">
      </q-avatar>
        <q-toolbar-title>
          Bodeguita <q-badge outline align="middle" color="white">
        v1.7.0
      </q-badge>
        </q-toolbar-title>

        <div><q-btn flat color="white" label="Acerca" @click="m_acerca = true" /></div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="250"
      :breakpoint="600"
      content-class="bg-grey-1"
    >
      <q-scroll-area style="height: calc(100% - 0px); margin-top: 0px; border-right: 1px solid #ddd">
          <q-list padding>
            <q-item to="/" exact clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="shopping_cart" />
              </q-item-section>

              <q-item-section>
                Venta
              </q-item-section>
            </q-item>

            <q-item to="/ventas" exact clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="money" />
              </q-item-section>

              <q-item-section>
                Ventas
              </q-item-section>
            </q-item>

            <q-item to="/productos" exact clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="paid" />
              </q-item-section>

              <q-item-section>
                Productos
              </q-item-section>
            </q-item>

            <q-item to="/valor_dolar" exact clickable v-ripple>
              <q-item-section avatar>
                <q-icon name="paid" />
              </q-item-section>

              <q-item-section>
                Valor Dolar
              </q-item-section>
            </q-item>


          </q-list>
        </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-dialog v-model="m_acerca">
      <q-card>
        <q-toolbar>
          <q-avatar square>
            <img :src="`${$router.options.base || ''}icons/favicon-128x128.png`">
          </q-avatar>

          <q-toolbar-title><span class="text-weight-bold">Acerca </span> <q-badge outline align="middle" color="teal">
        v1.7.0
      </q-badge></q-toolbar-title>

          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section>
          Aplicación para la administración de una bodega, permite registrar el valor del dolar para calcular de forma automatica el valor en Bs de los productos que vende, posee una sección de <strong>Venta</strong> donde se registran la venta que realice, otra sección de <strong>Ventas</strong> donde puede visualizar las ventas por rango de fechas.
        </q-card-section>
        <q-card-section>
          Desarrollado por <strong>Jean Zamora</strong> y <strong>Joyner Olivares</strong> para sugeriencias e información: <strong>jeancarloscuatro1@gmail.com</strong>
        </q-card-section>
      </q-card>
    </q-dialog>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>

export default {
  name: 'MainLayout',
  data () {
    return {
      leftDrawerOpen: false,
      m_acerca: false
    }
  }
}
</script>
