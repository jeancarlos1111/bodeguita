# Guía para Agentes de IA — Bodeguita

> **Propósito**: Este archivo describe las reglas, convenciones y restricciones que todo agente de IA debe seguir al trabajar en este proyecto. Léelo por completo antes de modificar cualquier archivo.

---

## 🚨 Reglas Críticas (NO ROMPER)

### Base de Datos (IndexedDB / Dexie)

1. **NUNCA elimines ni renombres una versión existente** de `src/db/db.js`. Las versiones de Dexie son acumulativas e irreversibles en el navegador del usuario. Eliminar una versión borra los datos reales.
2. **Para agregar campos o tablas** siempre crea una **nueva versión** (siguiente número entero) al final del archivo `db.js`. Nunca modifiques las definiciones de versiones anteriores.
3. **El nombre de la base de datos es `'BODEGUITA'`** (en mayúsculas). No lo cambies.
4. **La versión actual es la 12**. La próxima versión a crear sería la 13.
5. **Campos únicos** marcados con `&` (ej: `&nombre` en productos, `&cedula` en clientes) generarán error si insertas duplicados. Siempre validar en la UI antes de guardar.

### Cálculos Monetarios

6. **Usa `decimal.js` para TODOS los cálculos monetarios** (precios, totales, conversiones USD↔Bs). Nunca uses aritmética nativa de JavaScript (`+`, `*`, `-`) directamente para valores de dinero.

   ```javascript
   // ✅ Correcto
   import Decimal from 'decimal.js';
   const total = new Decimal(precio).times(cantidad).toNumber();

   // ❌ Incorrecto
   const total = precio * cantidad;
   ```

7. **La conversión USD → Bs** siempre usa el `valor_dolar` más reciente de la tabla `valores_dolar`. No pongas tasas hardcodeadas.

### Routing

8. **No elimines ni cambies las rutas existentes** en `src/router/routes.js`. Las rutas actuales son:

   | Path | Página |
   |---|---|
   | `/` | `Index.vue` (Punto de venta principal) |
   | `/productos` | `Productos.vue` |
   | `/ventas` | `Ventas.vue` |
   | `/ventas-por-producto` | `VentasPorProducto.vue` |
   | `/cierre-caja` | `CierreCaja.vue` |
   | `/configuracion` | `Configuracion.vue` |
   | `/kardex` | `Kardex.vue` |
   | `/valor_dolar` | `ValorDolar.vue` |
   | `/cuentas-por-cobrar` | `CuentasPorCobrar.vue` |
   | `/libro-ventas` | `LibroVentas.vue` |

   Para agregar una nueva página, añade la ruta al array `children` al final de las existentes.

### Inventario (Kardex)

9. **Nunca modifiques el `cantidad` de un producto directamente** sin registrar el movimiento correspondiente en la tabla `movimientos` mediante `KardexService.js`. El Kardex es la fuente de verdad del inventario.

   ```javascript
   // ✅ Correcto (siempre pasar por el servicio)
   import { KardexService } from 'src/services/KardexService';
   await KardexService.registrarMovimiento(productoId, tipo, cantidad, referencia);

   // ❌ Incorrecto (modificar directo sin trazar)
   await db.productos.update(id, { cantidad: nueva_cantidad });
   ```

10. Los tipos válidos de movimiento son: `'ENTRADA'`, `'SALIDA'`, `'AJUSTE'`, `'VENTA'`.

---

## 📷 Escáner de Código de Barras / QR

11. El campo `codigo_barras` es **opcional** en los productos. Se persiste en IndexedDB (v12) e indexado para búsquedas rápidas.
12. El componente reutilizable está en `src/components/BarcodeScanner.vue`. Úsalo así:

```vue
<barcode-scanner @scanned="miMetodo" mode="single" />
```

 - `@scanned(codigo)`: se emite con el string del código leído
 - `mode="single"`: cierra automáticamente al primer escaneo
 - `mode="confirm"`: espera que el usuario confirme antes de emitir

13. Para buscar un producto por código en el POS usa `productosDAO.getByBarcode(codigo)`. Si retorna `null`, el producto no tiene ese código asignado.
14. **No modifiques** la lógica de cierre de cámara en `BarcodeScanner.vue` sin verificar `beforeDestroy` — si la cámara no se libera, el navegador bloquea nuevas solicitudes de acceso.

---

## 🏗️ Arquitectura del Proyecto

### Stack

- **Framework**: Quasar v1 + **Vue.js 2.x** (NO Vue 3)
- **Base de datos**: Dexie.js v3 (IndexedDB — 100% local, sin backend)
- **Internacionalización**: Vue-i18n v8, configurado en **español**
- **Precisión monetaria**: decimal.js v10
- **Rendimiento**: Módulo Rust compilado a **WebAssembly** para recomendaciones

### Estructura de Archivos Clave

```
src/
├── pages/          # Vistas principales (una por módulo)
├── db/
│   ├── db.js           # ⚠️ Esquema de BD — leer reglas antes de tocar
│   ├── productosDAO.js
│   ├── ventasDAO.js
│   ├── clientesDAO.js
│   ├── movimientosDAO.js
│   ├── valor_dolarDAO.js
│   └── configuracionDAO.js
├── models/         # Clases de dominio (Productos, Ventas, etc.)
├── services/
│   ├── KardexService.js        # ⚠️ Usar SIEMPRE para mover inventario
│   └── RecommendationService.js # Motor WASM de recomendaciones
├── workers/
│   └── recommendation.worker.js # Web Worker (no bloquea UI)
├── router/routes.js  # ⚠️ Rutas de la SPA
└── layouts/MainLayout.vue  # Menú de navegación global
src-wasm/
└── src/lib.rs      # Código Rust — compilar con `npm run build:wasm`
```

### Patrón DAO

Cada entidad tiene su DAO en `src/db/`. Todos los accesos a datos deben hacerse a través de estos DAOs. No importes `db` directamente en las páginas.

```javascript
// ✅ Correcto
import { productosDAO } from 'src/db/productosDAO';
const productos = await productosDAO.getAll();

// ❌ Incorrecto (acceso directo desde la página)
import { db } from 'src/db/db';
const productos = await db.productos.toArray();
```

---

## 📋 Convenciones de Código

### Vue 2 (Options API)

Este proyecto usa **Vue 2 con Options API**. No uses Composition API (`setup()`, `ref()`, `reactive()`).

```javascript
// ✅ Correcto — Options API
export default {
  data() {
    return { productos: [] }
  },
  methods: {
    async cargar() { ... }
  }
}

// ❌ Incorrecto — Composition API (Vue 3, no compatible)
import { ref } from 'vue'
export default {
  setup() {
    const productos = ref([])
  }
}
```

### Componentes Quasar

Usa siempre componentes de **Quasar v1** (`q-table`, `q-btn`, `q-dialog`, `q-input`, etc.). No instales librerías de UI adicionales sin necesidad.

### Fechas

Las fechas se almacenan como `String` en formato ISO (`new Date().toISOString()`). Consistencia en los campos `create_at` y `update_at`.

### Idioma

- **Toda la UI debe estar en español**
- Los textos en pantalla van directamente en el template (no se usa i18n en páginas existentes salvo `en-us/`)
- Labels, mensajes de error y notificaciones: **español**

---

## ✅ Checklist Antes de Modificar

Antes de hacer cualquier cambio, verifica:

- [ ] ¿Estoy usando `decimal.js` para operaciones monetarias?
- [ ] ¿Si toco inventario, paso por `KardexService`?
- [ ] ¿Si agrego un campo a la BD, creé una nueva versión de Dexie?
- [ ] ¿Uso Options API (Vue 2), no Composition API?
- [ ] ¿Accedo a datos a través de un DAO, no directamente desde `db`?
- [ ] ¿La UI está en español?
- [ ] ¿Las rutas existentes siguen intactas?

---

## 🔧 Entorno de Desarrollo

### Requisitos

- **Node.js**: >= 10.18.1 — **se recomienda Node 16 LTS** (versiones 17+ causan error OpenSSL con Webpack)
- **npm**: >= 6.13.4
- **yarn**: >= 1.21.1
- El proyecto usa **ambos gestores** según el contexto: `yarn install` para dependencias, `npm run` para los scripts definidos en `package.json`

### Setup inicial

```bash
# 1. Usar Node 16 con nvm (obligatorio si tienes Node 17+)
nvm install 16
nvm use 16

# 2. Instalar dependencias
yarn install

# 3. Instalar Quasar CLI si no la tienes
yarn global add @quasar/cli
```

### Comandos principales

```bash
# Servidor de desarrollo (http://localhost:8080)
quasar dev

# Si tienes Node 17+ y no puedes usar nvm:
NODE_OPTIONS=--openssl-legacy-provider quasar dev

# Construir para producción (PWA)
quasar build -m pwa

# Compilar módulo WebAssembly (Rust)
npm run build:wasm

# Desplegar a GitHub Pages
npm run deploy:gh
```

### Modos de construcción

```bash
quasar dev -m pwa        # PWA
quasar dev -m electron   # Electron (escritorio)
quasar dev -m cordova    # Cordova (móvil)

quasar build -m pwa
quasar build -m electron
quasar build -m cordova -T android
```

> ⚠️ **Siempre usar `yarn`** para instalar dependencias. El proyecto tiene `yarn.lock`, mezclar con `npm install` puede romper resolución de versiones.

---

## 🗺️ Mapa de Módulos

| Módulo | Archivo | Descripción |
|---|---|---|
| Punto de Venta | `Index.vue` | Registro de ventas, carrito, facturación |
| Productos | `Productos.vue` | CRUD de inventario, precios, IVA |
| Ventas | `Ventas.vue` | Historial y reporte de ventas |
| Ventas x Producto | `VentasPorProducto.vue` | Análisis de ventas agrupadas |
| Kardex | `Kardex.vue` | Trazabilidad de movimientos de inventario |
| Cierre de Caja | `CierreCaja.vue` | Cierre diario y resumen financiero |
| Cuentas por Cobrar | `CuentasPorCobrar.vue` | Gestión de ventas a crédito |
| Libro de Ventas | `LibroVentas.vue` | Reporte fiscal de ventas con IVA |
| Valor Dólar | `ValorDolar.vue` | Registro de tasa de cambio USD/Bs |
| Configuración | `Configuracion.vue` | Parámetros del sistema |

---

## ⚠️ Qué NO Hacer

- ❌ **No migres a Vue 3 / Quasar v2** sin aprobación explícita del usuario
- ❌ **No instales nuevas dependencias** sin justificación y sin verificar compatibilidad con Quasar v1 / Vue 2
- ❌ **No borres datos de IndexedDB** en código de producción (ni `db.delete()`, ni `db.drop()`)
- ❌ **No uses `localStorage`** para datos persistentes; todo va en IndexedDB vía Dexie
- ❌ **No hagas llamadas HTTP a APIs externas** para datos de negocio; la app es 100% offline
- ❌ **No cambies `publicPath` en `quasar.conf.js` manualmente**; el script `deploy:gh` lo gestiona automáticamente
- ❌ **No modifiques `src-wasm/pkg/`**; ese directorio es generado automáticamente por `wasm-pack`

---

*Versión de este documento: 1.0 — Última actualización: Marzo 2026*
