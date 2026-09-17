<template>
  <q-layout view="lHh Lpr lFf" :class="$q.dark.isActive ? 'bg-dark' : ''">
    <q-header class="bg-primary shadow-2">
      <q-toolbar class="q-py-sm">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="leftDrawerOpen = !leftDrawerOpen" />

        <q-avatar square size="36px" class="q-mr-sm">
          <img :src="getPublicPath('icons/icon-128x128.png')">
        </q-avatar>

        <q-toolbar-title class="text-weight-bold text-white" style="font-size: 1.1rem; letter-spacing: 0.3px;">
          Bodeguita
          <!-- <q-badge align="middle" color="primary" text-color="white" class="q-ml-sm rounded-borders">
            v2.0.2
          </q-badge> -->
        </q-toolbar-title>

        <q-btn flat round dense :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" @click="toggleDarkMode"
          class="q-mr-sm">
          <q-tooltip>{{ $q.dark.isActive ? 'Modo Claro' : 'Modo Oscuro' }}</q-tooltip>
        </q-btn>

        <!-- Botón instalar PWA -->
        <q-btn v-if="deferredPrompt" flat round color="white" icon="install_mobile" @click="installPWA" class="q-mr-xs">
          <q-tooltip>Instalar App</q-tooltip>
        </q-btn>

        <q-btn flat round color="white" icon="info_outline" @click="m_acerca = true" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :content-class="$q.dark.isActive ? 'bg-dark' : ''"
      :width="260">
      <q-scroll-area class="fit">
        <div class="q-pa-md text-center">
          <q-avatar size="80px" class="shadow-2">
            <img :src="getPublicPath('icons/icon-128x128.png')">
          </q-avatar>
          <div class="text-h6 q-mt-md" :class="$q.dark.isActive ? 'text-white' : 'text-primary'">Bodeguita</div>
          <div class="text-caption text-grey">Administración</div>
        </div>

        <q-list padding class="text-grey-8">
          <q-item to="/" exact clickable v-ripple active-class="text-primary text-weight-bold bg-green-1" style="border-radius: 10px; margin: 2px 8px;">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-item to="/venta" exact clickable v-ripple active-class="text-primary text-weight-bold bg-green-1" style="border-radius: 10px; margin: 2px 8px;">
            <q-item-section avatar>
              <q-icon name="point_of_sale" />
            </q-item-section>
            <q-item-section>Punto de Venta</q-item-section>
          </q-item>

          <q-item to="/ventas" exact clickable v-ripple active-class="text-primary text-weight-bold bg-green-1" style="border-radius: 10px; margin: 2px 8px;">
            <q-item-section avatar>
              <q-icon name="receipt_long" />
            </q-item-section>
            <q-item-section>Ventas</q-item-section>
          </q-item>

          <q-item to="/ventas-por-producto" exact clickable v-ripple active-class="text-primary text-weight-bold bg-green-1" style="border-radius: 10px; margin: 2px 8px;">
            <q-item-section avatar>
              <q-icon name="bar_chart" />
            </q-item-section>
            <q-item-section>Ventas por Producto</q-item-section>
          </q-item>

          <q-item to="/productos" exact clickable v-ripple active-class="text-primary text-weight-bold bg-green-1" style="border-radius: 10px; margin: 2px 8px;">
            <q-item-section avatar>
              <q-icon name="inventory_2" />
            </q-item-section>
            <q-item-section>Productos</q-item-section>
          </q-item>

          <q-item to="/cierre-caja" exact clickable v-ripple active-class="text-primary text-weight-bold bg-green-1" style="border-radius: 10px; margin: 2px 8px;">
            <q-item-section avatar>
              <q-icon name="calculate" />
            </q-item-section>
            <q-item-section>Cierre de Caja</q-item-section>
          </q-item>

          <q-item to="/kardex" exact clickable v-ripple active-class="text-primary text-weight-bold bg-green-1" style="border-radius: 10px; margin: 2px 8px;">
            <q-item-section avatar>
              <q-icon name="psychology" />
            </q-item-section>
            <q-item-section>Kardex</q-item-section>
          </q-item>

          <q-item to="/configuracion" exact clickable v-ripple active-class="text-primary text-weight-bold bg-green-1" style="border-radius: 10px; margin: 2px 8px;">
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>Configuración</q-item-section>
          </q-item>

          <q-item to="/valor_dolar" exact clickable v-ripple active-class="text-primary text-weight-bold bg-green-1" style="border-radius: 10px; margin: 2px 8px;">
            <q-item-section avatar>
              <q-icon name="attach_money" />
            </q-item-section>
            <q-item-section>Valor Dólar</q-item-section>
          </q-item>

          <q-item to="/cuentas-por-cobrar" exact clickable v-ripple active-class="text-primary text-weight-bold bg-green-1" style="border-radius: 10px; margin: 2px 8px;">
            <q-item-section avatar>
              <q-icon name="account_balance_wallet" />
            </q-item-section>
            <q-item-section>Cuentas por Cobrar</q-item-section>
          </q-item>

          <q-item to="/libro-ventas" exact clickable v-ripple active-class="text-primary text-weight-bold bg-green-1" style="border-radius: 10px; margin: 2px 8px;">
            <q-item-section avatar>
              <q-icon name="menu_book" />
            </q-item-section>
            <q-item-section>Libro de Ventas</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <!-- Banner de instalación PWA (móvil) -->
      <transition name="slide-down">
        <div v-if="deferredPrompt" class="pwa-install-banner lt-md row items-center q-px-md q-py-sm">
          <q-icon name="install_mobile" color="white" size="22px" class="q-mr-sm" />
          <div class="col text-white" style="font-size: 13px; line-height: 1.3;">
            <strong>Instalar Bodeguita</strong><br>
            <span style="opacity: 0.85;">Accede más rápido desde tu pantalla de inicio</span>
          </div>
          <q-btn unelevated dense color="white" text-color="primary" label="Instalar" size="sm" class="q-ml-sm"
            style="border-radius: 8px;" @click="installPWA" />
          <q-btn flat dense round color="white" icon="close" size="sm" class="q-ml-xs" @click="deferredPrompt = null" />
        </div>
      </transition>
      <router-view />
    </q-page-container>

    <q-footer class="lt-md mobile-footer" :class="$q.dark.isActive ? 'mobile-footer--dark' : 'mobile-footer--light'">
      <q-tabs v-model="tab" indicator-color="transparent" class="mobile-tabs" align="justify" dense>
        <q-route-tab name="dashboard" icon="dashboard" label="Inicio" to="/" exact />
        <q-route-tab name="venta" icon="shopping_cart" label="Venta" to="/venta" exact />
        <q-route-tab name="ventas" icon="receipt_long" label="Ventas" to="/ventas" exact />
        <q-route-tab name="productos" icon="inventory_2" label="Productos" to="/productos" exact />
        <q-route-tab name="configuracion" icon="settings" label="Más" to="/configuracion" exact />
      </q-tabs>
    </q-footer>

    <q-dialog v-model="m_acerca">
      <q-card class="rounded-card" style="min-width: 300px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-primary">Acerca <q-badge align="middle" text-color="white"
              class="q-ml-sm rounded-borders bg-version">
              v3.1.1
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
import { configuracionDAO } from '../db/configuracionDAO';

export default {
  name: 'MainLayout',
  data() {
    return {
      leftDrawerOpen: false,
      m_acerca: false,
      tab: 'venta',
      deferredPrompt: null
    }
  },
  async mounted() {
    await this.loadTheme();
    this.initPWAPrompt();
  },
  beforeDestroy() {
    window.removeEventListener('beforeinstallprompt', this._pwaHandler);
    window.removeEventListener('appinstalled', this._appInstalledHandler);
  },
  methods: {
    initPWAPrompt() {
      this._pwaHandler = (e) => {
        // Prevenir que Chrome muestre el mini-infobar automáticamente
        e.preventDefault();
        // Guardar el evento para usarlo después
        this.deferredPrompt = e;
      };
      this._appInstalledHandler = () => {
        this.deferredPrompt = null;
        this.$q.notify({
          type: 'positive',
          message: '¡App instalada correctamente!',
          icon: 'check_circle',
          position: 'top'
        });
      };
      window.addEventListener('beforeinstallprompt', this._pwaHandler);
      window.addEventListener('appinstalled', this._appInstalledHandler);
    },
    async installPWA() {
      if (!this.deferredPrompt) return;
      // Mostrar el diálogo de instalación nativo del navegador
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        this.deferredPrompt = null;
      }
    },
    async loadTheme() {
      const isDark = await configuracionDAO.get('dark_mode');
      if (isDark !== null) {
        this.$q.dark.set(isDark);
      }
    },
    async toggleDarkMode() {
      const newState = !this.$q.dark.isActive;
      this.$q.dark.set(newState);
      await configuracionDAO.save('dark_mode', newState);
    },
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
  background-color: rgba(13, 104, 79, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  box-shadow: 0 4px 16px 0 rgba(13, 104, 79, 0.25);
  border-radius: 10px;
}

.mobile-footer {
  border-top: none;
  padding: 4px 6px env(safe-area-inset-bottom, 0);
  transition: background-color 0.3s, box-shadow 0.3s;

  &.mobile-footer--light {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
  }

  &.mobile-footer--dark {
    background: rgba(30, 30, 30, 0.8);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.35);
  }
}

.mobile-tabs {
  .q-tab {
    min-width: 0;
    padding: 6px 4px;
    border-radius: 12px;
    margin: 2px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    .q-tab__icon {
      font-size: 22px;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .q-tab__label {
      font-size: 10px;
      font-weight: 500;
      margin-top: 2px;
      letter-spacing: 0.2px;
    }
  }

  // Light mode tabs
  .mobile-footer--light & {
    .q-tab {
      color: var(--app-text-sub);

      &.q-tab--active {
        color: var(--q-color-primary);
        background: rgba(13, 104, 79, 0.12);

        .q-tab__icon {
          transform: scale(1.1);
        }

        .q-tab__label {
          font-weight: 600;
        }
      }
    }
  }

  // Dark mode tabs
  .mobile-footer--dark & {
    .q-tab {
      color: rgba(255, 255, 255, 0.45);

      &.q-tab--active {
        color: #fff;
        background: rgba(16, 185, 129, 0.25);

        .q-tab__icon {
          transform: scale(1.1);
        }

        .q-tab__label {
          font-weight: 600;
        }
      }
    }
  }
}

.pwa-install-banner {
  background: linear-gradient(135deg, #0D684F, #10B981);
  box-shadow: 0 2px 8px rgba(13, 104, 79, 0.35);
  position: relative;
  z-index: 100;
}

// Animación slide-down para el banner
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
