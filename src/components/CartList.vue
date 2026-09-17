<template>
  <div class="cart-list-root">
    <!-- Lista de Productos en Carrito (Screenshot 2) -->
    <div v-if="items.length > 0" class="cart-items-container">
      <div class="row items-center justify-between q-mb-sm q-px-xs">
        <div class="text-subtitle1 text-weight-bold text-grey-8">
          En orden ({{ items.length }})
        </div>
        <q-btn flat dense no-caps color="negative" label="Limpiar todo" @click="$emit('clear')" size="sm" />
      </div>

      <div class="column q-gutter-y-sm">
        <div v-for="(item, index) in items" :key="item.id || index">
          <q-card class="modern-card cart-item-card q-pa-sm" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'">
            <div class="row items-center no-wrap">
              <!-- Miniatura / Avatar del producto -->
              <div class="product-thumb-container q-mr-md flex flex-center">
                <q-icon name="inventory_2" size="26px" color="primary" />
              </div>

              <!-- Info central: Nombre y Precio Unitario c/u -->
              <div class="col ellipsis q-pr-sm">
                <div class="text-weight-bold text-subtitle2 ellipsis" :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">
                  {{ item.producto }}
                </div>
                <div class="text-caption text-grey-6 row items-center q-gutter-x-xs">
                  <span>Bs {{ $formatMoney(item.valor_unitario_bs || (item.valor_bs / item.cantidad)) }} c/u</span>
                  <span v-if="$valor_dolar" class="text-grey-5">
                    · ${{ $formatMoneyUSD((item.valor_unitario_bs || (item.valor_bs / item.cantidad)) / $valor_dolar) }}
                  </span>
                </div>
              </div>

              <!-- Stepper compacto (Screenshot 2: Basurero/Menos + Cantidad + Mas) -->
              <div class="cart-stepper-pill row items-center no-wrap" :class="$q.dark.isActive ? 'bg-grey-8' : 'bg-slate-100'">
                <!-- Si es 1, muestra basurero; si es > 1, muestra signo menos -->
                <q-btn
                  flat
                  round
                  dense
                  :icon="item.cantidad === 1 ? 'delete_outline' : 'remove'"
                  :color="item.cantidad === 1 ? 'negative' : 'grey-7'"
                  size="sm"
                  class="stepper-btn"
                  @click="$emit('change-qty', { index, delta: -1 })"
                />

                <div class="text-weight-bold text-body2 text-center stepper-qty" :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">
                  {{ item.cantidad }}
                </div>

                <q-btn
                  flat
                  round
                  dense
                  icon="add"
                  color="primary"
                  size="sm"
                  class="stepper-btn"
                  @click="$emit('change-qty', { index, delta: 1 })"
                />
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Estado Vacío (Screenshot 1: Círculo verde suave + "Aún no has agregado productos") -->
    <div v-else class="empty-cart-container text-center q-py-xl flex column flex-center">
      <div class="empty-icon-circle q-mb-md flex flex-center">
        <q-icon name="shopping_bag" size="38px" color="primary" />
      </div>
      <div class="text-h6 text-weight-bold text-grey-9 q-mb-xs">
        Aún no has agregado productos
      </div>
      <div class="text-caption text-grey-6" style="max-width: 260px;">
        Escanea o agrega productos para iniciar una venta
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CartList',
  props: {
    items: {
      type: Array,
      required: true
    }
  }
};
</script>

<style scoped>
.cart-list-root {
  width: 100%;
}

.cart-item-card {
  border-radius: 16px;
  padding: 10px 14px;
}

.product-thumb-container {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: var(--q-color-primary-light, #E8F5F1);
  flex-shrink: 0;
}

/* Stepper Pill idéntico a la referencia */
.bg-slate-100 {
  background-color: #F1F5F9;
}

.cart-stepper-pill {
  border-radius: 9999px;
  padding: 2px 6px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stepper-btn {
  width: 28px;
  height: 28px;
}

.stepper-qty {
  min-width: 26px;
}

/* Estado Vacío */
.empty-icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #E8F5F1;
}
</style>
