# Bodeguita - Documentación Técnica

> Aplicación PWA para la administración de una bodega desarrollada con Quasar Framework v1

[![Quasar](https://img.shields.io/badge/Quasar-1.22.1-blue.svg)](https://quasar.dev)
[![Vue.js](https://img.shields.io/badge/Vue.js-2.x-green.svg)](https://vuejs.org)
[![Dexie](https://img.shields.io/badge/Dexie-3.0.3-orange.svg)](https://dexie.org)

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos del Sistema](#requisitos-del-sistema)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Scripts Disponibles](#scripts-disponibles)
- [Arquitectura de Base de Datos](#arquitectura-de-base-de-datos)
- [Desarrollo](#desarrollo)
- [Despliegue](#despliegue)
- [Modos de Construcción](#modos-de-construcción)

---

## Descripción

**Bodeguita** es una Progressive Web App (PWA) desarrollada con Quasar Framework que permite la gestión completa de una bodega, incluyendo:

- Gestión de productos con control de inventario
- Registro y seguimiento de ventas
- Cálculo automático de precios y ganancias
- Conversión automática entre USD y Bolívares
- Análisis de ganancias por producto
- Funcionamiento completamente offline

### Características Técnicas

- ✅ **PWA**: Funciona como aplicación web y puede instalarse en dispositivos
- ✅ **Offline First**: Todos los datos se guardan localmente usando IndexedDB
- ✅ **Responsive**: Diseño adaptativo para móviles y escritorio
- ✅ **Multi-plataforma**: Web, Electron (escritorio), Cordova (móvil)

### Nuevas Funcionalidades (v2.1+)

#### 🧠 Sistema de Recomendaciones (WASM + Rust)

Implementación de lógica de alto rendimiento usando **Rust** compilado a **WebAssembly**.

- **Motor de Inferencia**: Detecta patrones de compra (matriz de co-ocurrencia) localmente en el dispositivo.
- **Detección de Productos Estancados**: Algoritmo inteligente que sugiere productos con inventario inmovilizado para rotación.
- **Web Workers**: Procesamiento en segundo plano para no bloquear la interfaz de usuario.

#### 📦 Kardex Inteligente

Nueva gestión avanzada de inventario:

- **Trazabilidad Total**: Registro detallado de `MOVIMIENTOS` (entradas, salidas, ajustes, ventas).
- **Control de Stock**: Auditoría precisa de cambios en el inventario en tiempo real.

#### 💰 Refactorización de Precios (Costo vs Valor)

- Migración completa del cálculo de ganancias basado en **Costo de Adquisición**.
- Mayor precisión en reportes de margen de ganancia y rentabilidad.

---

## Stack Tecnológico

### Frontend Framework

- **Quasar Framework v1.22.1**: Framework Vue.js para desarrollo multiplataforma
- **Vue.js 2.x**: Framework JavaScript progresivo
- **Vue Router**: Enrutamiento (modo history)

### Base de Datos

- **Dexie.js v3.0.3**: Wrapper para IndexedDB (base de datos del navegador)

### UI/UX

- **Quasar Components**: Componentes Material Design
- **Material Icons**: Iconografía
- **Roboto Font**: Tipografía

### Utilidades

- **Axios v0.21.1**: Cliente HTTP
- **Vue-i18n v8.0.0**: Internacionalización (configurado en español)
- **v-money v0.8.1**: Formateo de moneda

### Desarrollo

- **@quasar/app v2.4.3**: CLI de Quasar
- **Webpack**: Bundler de módulos
- **Babel**: Transpilador JavaScript
- **Workbox**: Service Worker para PWA

### Plataformas Adicionales

- **Electron v13.0.0**: Aplicación de escritorio
- **Cordova**: Aplicación móvil nativa

---

## Requisitos del Sistema

### Desarrollo

- **Node.js**: >= 10.18.1 (recomendado: Node 16 LTS para evitar problemas con Webpack)
- **npm**: >= 6.13.4
- **yarn**: >= 1.21.1

### Navegadores Soportados

- Chrome >= 94
- Firefox >= 93
- Edge >= 100
- Safari >= 14
- Chrome Android >= 103
- iOS >= 13.0

### Compatibilidad

La aplicación está optimizada para al menos **88.14% de cobertura global de navegadores**.

---

## Estructura del Proyecto

```
bodeguita/
├── src/                      # Código fuente principal
│   ├── assets/              # Assets estáticos (imágenes, etc.)
│   ├── boot/                # Archivos de inicialización
│   │   ├── axios.js        # Configuración de Axios
│   │   └── i18n.js         # Configuración de i18n
│   ├── components/          # Componentes reutilizables
│   │   └── EssentialLink.vue
│   ├── css/                # Estilos globales
│   │   ├── app.scss
│   │   └── quasar.variables.scss
│   ├── db/                 # Capa de acceso a datos
│   │   ├── db.js          # Configuración de Dexie/IndexedDB
│   │   ├── productosDAO.js # DAO de productos
│   │   ├── valor_dolarDAO.js # DAO de valor del dólar
│   │   └── ventasDAO.js    # DAO de ventas
│   ├── i18n/              # Traducciones
│   │   ├── index.js
│   │   └── en-us/
│   ├── layouts/           # Layouts de la aplicación
│   │   └── MainLayout.vue
│   ├── models/            # Modelos de datos
│   │   ├── Productos.js
│   │   ├── ValorDolar.js
│   │   └── Ventas.js
│   ├── pages/             # Páginas/Vistas
│   │   ├── Index.vue      # Página principal (Ventas)
│   │   ├── Productos.vue  # Gestión de productos
│   │   ├── ValorDolar.vue # Gestión del valor del dólar
│   │   ├── Ventas.vue     # Reporte de ventas
│   │   └── Error404.vue
│   ├── router/            # Configuración de rutas
│   │   ├── index.js
│   │   └── routes.js
│   ├── store/             # Vuex store (opcional)
│   ├── App.vue            # Componente raíz
│   └── index.template.html # Template HTML
│
├── src-electron/          # Código específico de Electron
│   └── main-process/
│       ├── electron-main.js
│       └── electron-main.dev.js
│
├── src-cordova/           # Código específico de Cordova
│   ├── config.xml
│   └── platforms/
│
├── src-pwa/              # Configuración PWA
│   ├── custom-service-worker.js
│   └── register-service-worker.js
│
├── src-wasm/             # Código fuente Rust (WebAssembly)
│   ├── src/
│   │   └── lib.rs       # Lógica principal en Rust
│   ├── Cargo.toml       # Manifest de Rust
│   └── pkg/             # Build generado (WASM + JS glue)
│
├── scripts/              # Scripts de automatización
│   └── deploy-gh-pages.sh # Script de despliegue a GitHub Pages
│
├── public/               # Archivos públicos estáticos
│   ├── favicon.ico
│   └── icons/            # Iconos de la aplicación
│
├── dist/                 # Build de producción (generado)
│   ├── pwa/             # Build PWA
│   ├── electron/        # Build Electron
│   └── cordova/         # Build Cordova
│
├── quasar.conf.js        # Configuración de Quasar
├── babel.config.js       # Configuración de Babel
├── jsconfig.json         # Configuración de JavaScript
├── package.json          # Dependencias y scripts
└── README.md             # Este archivo
```

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/jeancarlos1111/bodeguita.git
cd bodeguita
```

### 2. Instalar dependencias

```bash
yarn install
# o
npm install
```

### 3. Configurar Node.js (Recomendado)

Si usas Node.js 17 o superior, se recomienda usar Node 16 LTS para evitar problemas con Webpack:

```bash
# Si tienes nvm instalado
nvm install 16
nvm use 16

# O usar directamente con npx
NODE_OPTIONS=--openssl-legacy-provider quasar dev
```

---

## Configuración

### Archivos de Configuración Principales

#### `quasar.conf.js`

Configuración principal de Quasar Framework:

- **vueRouterMode**: `'history'` (modo SPA)
- **publicPath**: `'/bodeguita/'` (ajustado para GitHub Pages)
- **gzip**: `true` (compresión de assets)
- **PWA**: Service Worker habilitado

#### `src/db/db.js`

Configuración de la base de datos IndexedDB:

```javascript
export const db = new Dexie('BODEGUITA');
db.version(4).stores({
    valores_dolar: `++id, valor_dolar, create_at, update_at`,
    productos: `++id, &nombre, valor, create_at, update_at, cantidad, porcentaje_ganancia, costo`,
    ventas: `++id, total, *productos, create_at, update_at`
});
```

#### Variables de Entorno

No se utilizan archivos `.env` en este proyecto. La configuración está en `quasar.conf.js`.

---

## Scripts Disponibles

### Desarrollo

```bash
# Iniciar servidor de desarrollo
yarn quasar dev
# o
npm run quasar dev

# Iniciar con modo específico
quasar dev -m pwa      # Solo PWA
quasar dev -m electron # Solo Electron
quasar dev -m cordova  # Solo Cordova
```

### Construcción

```bash
# Construir para producción
yarn quasar build

# Construir modo específico
quasar build -m pwa      # Build PWA
quasar build -m electron # Build Electron
quasar build -m cordova  # Build Cordova Android
```

### Despliegue

```bash
# Desplegar a GitHub Pages
npm run deploy:gh
```

Este script:

1. Detecta automáticamente el nombre del repositorio
2. Ajusta el `publicPath` en `quasar.conf.js`
3. Construye la aplicación en modo PWA
4. Crea un archivo `404.html` para GitHub Pages
5. Despliega a la rama `gh-pages`

**Requisitos para despliegue:**

- Token de GitHub en `.github-token` o variable de entorno `GITHUB_TOKEN`
- Repositorio remoto configurado (`git remote add origin <url>`)

### Testing

```bash
yarn test
```

---

## Arquitectura de Base de Datos

### Esquema de Base de Datos (IndexedDB)

La aplicación utiliza **Dexie.js** como wrapper sobre IndexedDB. Base de datos: `BODEGUITA`

#### Versión 4 (Actual)

```javascript
{
  valores_dolar: {
    id: ++ (auto-increment),
    valor_dolar: Number,
    create_at: String,
    update_at: String
  },

  productos: {
    id: ++ (auto-increment),
    nombre: String (unique, indexed),
    valor: Number,              // Valor base (USD)
    costo: Number,              // Costo de adquisición (USD)
    cantidad: Number,
    porcentaje_ganancia: Number, // Porcentaje de ganancia
    create_at: String,
    update_at: String
  },

  ventas: {
    id: ++ (auto-increment),
    total: Number,
    productos: Array,           // Array de objetos producto
    create_at: String,
    update_at: String
  }
}
```

### Modelos de Datos

#### Productos

```javascript
{
  nombre: String,
  valor: Number,              // Valor base en USD
  costo: Number,              // Costo en USD
  cantidad: Number,
  porcentaje_ganancia: Number,
  create_at: Date
}
```

**Cálculos:**

- Precio de Venta = `valor + (valor * porcentaje_ganancia / 100)`
- Ganancia/Unidad = `Precio de Venta - costo`

#### Ventas

```javascript
{
  total: Number,
  productos: [
    {
      id: Number,
      producto: String,
      valor_bs: Number,         // Precio de venta total en Bs
      valor_unitario_bs: Number, // Precio unitario en Bs
      costo_total_bs: Number,    // Costo total en Bs
      costo_unitario_bs: Number, // Costo unitario en Bs
      cantidad: Number,
      valor_dolar: Number,       // Valor del dólar usado
      existencia: Number         // Existencia al momento de la venta
    }
  ],
  create_at: Date
}
```

### Data Access Objects (DAO)

La aplicación utiliza el patrón DAO para abstraer el acceso a la base de datos:

- **productosDAO.js**: CRUD de productos
- **valor_dolarDAO.js**: CRUD del valor del dólar
- **ventasDAO.js**: CRUD de ventas

---

## Desarrollo

### Modo de Desarrollo

```bash
quasar dev
```

Esto iniciará:

- Servidor de desarrollo en `http://localhost:8080`
- Hot-reload automático
- Source maps para debugging
- Abre el navegador automáticamente

### Estructura de Componentes

Los componentes Vue siguen la estructura estándar:

```vue
<template>
  <!-- HTML -->
</template>

<script>
  // Lógica JavaScript
</script>

<style>
  /* Estilos (opcionales, usando Quasar) */
</style>
```

### Routing

Las rutas están definidas en `src/router/routes.js`:

```javascript
{
  path: '/',
  component: () => import('layouts/MainLayout.vue'),
  children: [
    { path: '', component: () => import('pages/Index.vue') },
    { path: '/productos', component: () => import('pages/Productos.vue') },
    { path: '/ventas', component: () => import('pages/Ventas.vue') },
    { path: '/valor_dolar', component: () => import('pages/ValorDolar.vue') }
  ]
}
```

### Estilos

- Se utiliza **SCSS** para estilos personalizados
- Variables de Quasar en `src/css/quasar.variables.scss`
- Estilos globales en `src/css/app.scss`

---

## Desarrollo con WebAssembly (Rust)

El proyecto incorpora un módulo de **Rust** compilado a WebAssembly para tareas intensivas de cómputo, específicamente para el motor de recomendaciones.

### Estructura del Módulo (`src-wasm/`)

- **`lib.rs`**: Contiene la lógica del negocio de alto rendimiento.
  - `train_model_wasm`: Función que procesa miles de ventas para generar la matriz de co-ocurrencia.
  - Implementa un algoritmo optimizado `O(N^2)` sobre arrays planos para máxima velocidad.

### Ciclo de Trabajo con Rust

1. **Instalar Rust y wasm-pack**:

   ```bash
   curl https://sh.rustup.rs -sSf | sh
   cargo install wasm-pack
   ```

2. **Compilar el Módulo**:
   El proyecto incluye un script en `package.json` para facilitar esto:

   ```bash
   npm run build:wasm
   ```

   *Este comando compila el código Rust en `src-wasm` y coloca los binarios resultantes en `src-wasm/pkg`, listos para ser importados por el Web Worker.*

3. **Integración**:
   El archivo `.wasm` se carga dinámicamente mediante `RecommendationService.js` para asegurar compatibilidad con todos los entornos (incluyendo Cordova restrictivo).

---

## Despliegue

### GitHub Pages (PWA)

El proyecto incluye un script automatizado para desplegar a GitHub Pages:

```bash
npm run deploy:gh
```

**El script automáticamente:**

1. Detecta el nombre del repositorio
2. Ajusta el `publicPath` según el repositorio
3. Construye la aplicación
4. Crea `404.html` para soportar Vue Router en modo history
5. Despliega a la rama `gh-pages`

**Configuración manual de GitHub Pages:**

1. Ir a Settings → Pages
2. Source: Branch `gh-pages` → `/ (root)`
3. Save

**URLs esperadas:**

- Repo normal: `https://usuario.github.io/bodeguita/`
- Repo usuario: `https://usuario.github.io/` (si el repo es `usuario.github.io`)

### Despliegue Manual

```bash
# Construir PWA
quasar build -m pwa

# Los archivos estarán en dist/pwa/
# Subir el contenido de dist/pwa/ a tu servidor
```

### Electron (Aplicación Desktop)

```bash
# Construir para Electron
quasar build -m electron

# Los ejecutables estarán en dist/electron/
```

### Cordova (Aplicación Móvil)

```bash
# Construir para Android
quasar build -m cordova -T android

# APK estará en dist/cordova/android/apk/
```

---

## Modos de Construcción

### PWA (Progressive Web App)

- Service Worker habilitado
- Manifest.json configurado
- Funciona offline
- Puede instalarse en dispositivos

**Build:**

```bash
quasar build -m pwa
```

**Output:** `dist/pwa/`

### Electron (Desktop)

- Aplicación de escritorio multiplataforma
- Node.js integration habilitado
- Builders: packager, builder

**Build:**

```bash
quasar build -m electron
```

**Output:** `dist/electron/`

### Cordova (Mobile)

- Aplicación móvil nativa
- Soporta Android e iOS
- Plugins de Cordova disponibles

**Build:**

```bash
quasar build -m cordova -T android --debug
```

**Output:** `dist/cordova/`

---

## Configuración Técnica Detallada

### Vue Router

- **Modo**: `history` (requiere configuración del servidor para SPA)
- **Base**: Configurado dinámicamente según `publicPath`

### PWA

- **Workbox Mode**: `GenerateSW`
- **Skip Waiting**: `true`
- **Clients Claim**: `true`

### Build

- **Gzip**: Habilitado
- **Source Maps**: Solo en desarrollo
- **Minificación**: Habilitada en producción

### Service Worker

El Service Worker se genera automáticamente en el build de producción usando Workbox.

---

## Migraciones de Base de Datos

La aplicación usa versionado de esquema con Dexie:

### Versión 1 → 2

- Agregado campo `cantidad` a productos

### Versión 2 → 3

- Agregado campo `porcentaje_ganancia` a productos

### Versión 3 → 4

- Agregado campo `costo` a productos

**Nota:** Las migraciones son automáticas cuando se actualiza la versión del esquema.

---

## Troubleshooting

### Error: `digital envelope routines::unsupported`

**Problema**: Node.js 17+ cambió el algoritmo de hash de OpenSSL.

**Solución 1**: Usar Node 16 LTS

```bash
nvm install 16
nvm use 16
```

**Solución 2**: Usar flag legacy

```bash
NODE_OPTIONS=--openssl-legacy-provider quasar build
```

### Error en GitHub Pages: Rutas no funcionan

**Problema**: Vue Router en modo history requiere configuración especial.

**Solución**: El script `deploy:gh` crea automáticamente un `404.html` que redirige todas las rutas a `index.html`.

### Problemas con imágenes en producción

**Problema**: Las rutas de imágenes usan rutas relativas.

**Solución**: Se utiliza `$router.options.base` para generar rutas absolutas con el `publicPath` correcto.

---

## Desarrollo Futuro

### Mejoras Técnicas Sugeridas

- [ ] Migrar a Quasar v2
- [ ] Migrar a Vue 3
- [ ] Agregar tests unitarios (Jest/Vitest)
- [ ] Agregar tests E2E (Cypress)
- [ ] Implementar sincronización con backend
- [ ] Agregar sistema de respaldos/exportación de datos
- [ ] Implementar autenticación de usuarios
- [ ] Agregar modo oscuro

---

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## Licencia

Este proyecto es privado.

---

## Autores

- **Jean Zamora** - <jeancarloscuatro1@gmail.com>
- **Joyner Olivares**

---

## Enlaces Útiles

- [Quasar Framework v1 Docs](https://v1.quasar.dev/)
- [Vue.js Docs](https://vuejs.org/)
- [Dexie.js Docs](https://dexie.org/)
- [Manual de Usuario](./MANUAL_USUARIO.md)

---

**Versión**: 2.1.5
**Última actualización**: 2025
