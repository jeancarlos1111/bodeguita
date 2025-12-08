<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <q-header class="bg-white text-primary shadow-1">
      <q-toolbar class="q-py-sm">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="leftDrawerOpen = !leftDrawerOpen" class="gt-sm" />

        <q-avatar square size="36px" class="q-mr-sm">
          <img :src="getPublicPath('icons/icon-128x128.png')">
        </q-avatar>

        <q-toolbar-title class="text-weight-bold text-dark">
          Bodeguita
          <!-- <q-badge align="middle" color="primary" text-color="white" class="q-ml-sm rounded-borders">
            v2.0.2
          </q-badge> -->
        </q-toolbar-title>

        <q-btn flat round color="primary" icon="info_outline" @click="m_acerca = true" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered content-class="bg-white" :width="260" class="gt-sm">
      <q-scroll-area class="fit">
        <div class="q-pa-md text-center">
          <q-avatar size="80px" class="shadow-2">
            <img :src="getPublicPath('icons/icon-128x128.png')">
          </q-avatar>
          <div class="text-h6 q-mt-md text-primary">Bodeguita</div>
          <div class="text-caption text-grey">Administración</div>
        </div>

        <q-list padding class="text-grey-8">
          <q-item to="/" exact clickable v-ripple active-class="text-primary bg-indigo-1">
            <q-item-section avatar>
              <q-icon name="shopping_cart" />
            </q-item-section>
            <q-item-section>Venta</q-item-section>
          </q-item>

          <q-item to="/ventas" exact clickable v-ripple active-class="text-primary bg-indigo-1">
            <q-item-section avatar>
              <q-icon name="receipt_long" />
            </q-item-section>
            <q-item-section>Ventas</q-item-section>
          </q-item>

          <q-item to="/ventas-por-producto" exact clickable v-ripple active-class="text-primary bg-indigo-1">
            <q-item-section avatar>
              <q-icon name="bar_chart" />
            </q-item-section>
            <q-item-section>Ventas por Producto</q-item-section>
          </q-item>

          <q-item to="/productos" exact clickable v-ripple active-class="text-primary bg-indigo-1">
            <q-item-section avatar>
              <q-icon name="inventory_2" />
            </q-item-section>
            <q-item-section>Productos</q-item-section>
          </q-item>

          <q-item to="/kardex" exact clickable v-ripple active-class="text-primary bg-indigo-1">
            <q-item-section avatar>
              <q-icon name="psychology" />
            </q-item-section>
            <q-item-section>Kardex</q-item-section>
          </q-item>

          <q-item to="/valor_dolar" exact clickable v-ripple active-class="text-primary bg-indigo-1">
            <q-item-section avatar>
              <q-icon name="attach_money" />
            </q-item-section>
            <q-item-section>Valor Dolar</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer bordered class="bg-white text-primary lt-md">
      <q-tabs v-model="tab" active-color="primary" indicator-color="transparent" class="text-grey-6" align="justify"
        dense>
        <q-route-tab name="venta" icon="shopping_cart" label="Venta" to="/" exact />
        <q-route-tab name="ventas" icon="receipt_long" label="Ventas" to="/ventas" exact />
        <q-route-tab name="ventas-por-producto" icon="receipt_long" label="Ven. Prod." to="/ventas-por-producto"
          exact />
        <q-route-tab name="productos" icon="inventory_2" label="Prod." to="/productos" exact />
        <q-route-tab name="kardex" icon="psychology" label="Kardex" to="/kardex" exact />
        <q-route-tab name="dolar" icon="attach_money" label="Dolar" to="/valor_dolar" exact />
      </q-tabs>
    </q-footer>

    <q-dialog v-model="m_acerca">
      <q-card class="rounded-card" style="min-width: 300px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-primary">Acerca <q-badge align="middle" text-color="white"
              class="q-ml-sm rounded-borders bg-version">
              v2.1.5
            </q-badge></div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="row justify-center q-mb-md">
            <q-avatar square size="64px">
              <img :src="getPublicPath('icons/favicon-128x128.png')">
            </q-avatar>
          </div>
          <p>
            Aplicación para la administración de una bodega. Permite registrar el valor del dolar para calcular
            automáticamente los precios.
          </p>
          <div class="text-caption text-grey-7 q-mt-md">
            Desarrollado por <strong>Jean Zamora</strong> y <strong>Joyner Olivares</strong>.<br>
            Contacto: <strong>jeancarloscuatro1@gmail.com</strong>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script>
export default {
  name: 'MainLayout',
  data() {
    return {
      leftDrawerOpen: false,
      m_acerca: false,
      tab: 'venta'
    }
  },
  methods: {
    getPublicPath(url) {
      if (process.env.MODE === 'electron' || process.env.MODE === 'cordova') {
        return url;
      }
      return (this.$router.options.base || '/') + url;
    }
  }
}
</script>

<!-- Notice lang="scss" -->
<style lang="scss">
.bg-version {
  /* El color #1976D2 es el azul Quasar ($primary). 
     Usamos sus valores RGB: 25, 118, 210. */

  /* 1. Color de fondo translúcido (60% opaco) */
  background-color: rgba(25, 118, 210, 0.6);

  /* 2. Filtro de desenfoque aplicado a lo que está detrás del elemento
     Esto es lo que crea el efecto de "vidrio" real. */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  /* Prefijo para mayor compatibilidad */

  /* 3. Un borde sutil que ayuda a definir el "borde del vidrio" */
  border: 1px solid rgba(255, 255, 255, 0.3);

  /* 4. Aseguramos que el contenido de texto sea blanco para que resalte */
  color: white;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  /* Sombra para darle profundidad */
  border-radius: 10px;
  /* gris con 70% de opacidad */

}
</style>
