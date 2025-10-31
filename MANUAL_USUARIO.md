# Manual de Usuario - Bodeguita v1.6.0

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Primeros Pasos](#primeros-pasos)
3. [Configuración Inicial](#configuración-inicial)
4. [Gestión de Productos](#gestión-de-productos)
5. [Realizar Ventas](#realizar-ventas)
6. [Reporte de Ventas](#reporte-de-ventas)
7. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Introducción

**Bodeguita** es una aplicación web diseñada para la administración de una bodega. Permite registrar productos, gestionar el valor del dólar, realizar ventas y llevar un control de las ganancias por producto.

### Características Principales

- ✅ Gestión de productos con costo y porcentaje de ganancia
- ✅ Cálculo de IVA (Impuesto al Valor Agregado) configurable por producto
- ✅ Conversión automática entre dólares (USD) y bolívares (Bs)
- ✅ Registro de ventas con cálculo automático de precios
- ✅ Reportes de ventas con análisis de ganancias
- ✅ Control de inventario (cantidad de productos)
- ✅ Trabaja sin conexión a internet (PWA)

---

## Primeros Pasos

### Acceso a la Aplicación

1. Abre la aplicación en tu navegador web
2. La aplicación funciona completamente sin conexión a internet después de la primera carga

### Navegación

La aplicación cuenta con un menú lateral (hamburguesa) que incluye:

- 🛒 **Venta**: Realizar ventas
- 💰 **Ventas**: Ver reporte de ventas
- 📦 **Productos**: Gestionar productos
- 💵 **Valor Dolar**: Configurar el valor del dólar

---

## Configuración Inicial

### Paso 1: Configurar el Valor del Dólar

**IMPORTANTE**: Debes configurar el valor del dólar ANTES de agregar productos o realizar ventas.

1. Haz clic en **"Valor Dolar"** en el menú lateral
2. Haz clic en el botón **"nuevo valor dolar"**
3. Ingresa el valor del dólar en bolívares (Bs)
   - Ejemplo: Si el dólar está a 40 Bs, ingresa `40`
4. Haz clic en **"Guardar"**

> 💡 **Tip**: Actualiza el valor del dólar regularmente para mantener cálculos precisos.

#### Ejemplo:

```
Valor del dólar: 40.00 Bs
```

---

## Gestión de Productos

### Agregar un Nuevo Producto

1. Ve a la sección **"Productos"**
2. Haz clic en **"nuevo producto"**
3. Completa el formulario:

#### Campos del Formulario:

- **Nombre**: Nombre del producto (ej: "Arroz 1kg")
- **Valor Base (USD)**: Precio base del producto antes de aplicar ganancia
- **Costo (USD)**: Costo de adquisición del producto
- **Porcentaje de Ganancia (%)**: Porcentaje de ganancia que deseas obtener
- **IVA (%)**: Porcentaje de IVA que se sumará al precio de venta (opcional, por defecto 0%)
- **Cantidad**: Cantidad inicial en inventario

#### Ejemplo 1: Ingresar valores en USD

```
Nombre: Arroz 1kg
Valor Base (USD): 2.50
Costo (USD): 1.80
Porcentaje de Ganancia (%): 25.00
IVA (%): 16.00
Cantidad: 50
```

**Resultado:**
- Precio sin IVA: $3.13 (2.50 + 25%)
- IVA: $0.50 (3.13 × 16%)
- Precio de Venta Final: $3.63 (3.13 + 0.50)
- Ganancia/Unidad: $1.83 (3.63 - 1.80)

#### Ejemplo 2: Ingresar valores en Bolívares

1. Activa el switch **"Ingresar valores en Bolívares (Bs)"**
2. Ingresa los valores en bolívares:

```
Nombre: Aceite 1L
Valor Base (Bs): 100.00
Costo (Bs): 70.00
Porcentaje de Ganancia (%): 20.00
IVA (%): 16.00
Cantidad: 30
```

**Resultado:**
- El sistema convierte automáticamente a USD usando el valor del dólar actual
- Si el dólar está a 40 Bs:
  - Valor Base: $2.50 (100 / 40)
  - Costo: $1.75 (70 / 40)
  - Precio sin IVA: $3.00 (2.50 + 20%)
  - IVA: $0.48 (3.00 × 16%)
  - Precio de Venta Final: $3.48
  - Ganancia/Unidad: $1.73 (3.48 - 1.75)

> 💡 **Tip**: Al activar el switch, verás en tiempo real la conversión a dólares en chips azules al lado de cada campo.

### Editar un Producto

1. En la lista de productos, haz clic en el botón **editar** (✏️)
2. Modifica los valores que necesites
3. Haz clic en **"Guardar"**

### Agregar Cantidad a un Producto

1. En la lista de productos, haz clic en el botón **agregar** (+)
2. Ingresa la cantidad a agregar
3. Haz clic en **"Guardar"**

**Ejemplo:**
```
Cantidad Actual: 50
Cantidad a agregar: 25
Nueva Cantidad: 75
```

### Información en la Tabla de Productos

La tabla muestra:

- **Nombre**: Nombre del producto
- **Valor Base**: Precio base antes de aplicar ganancia
- **Ganancia %**: Porcentaje de ganancia configurado
- **IVA %**: Porcentaje de IVA configurado (si es 0% no se muestra desglose)
- **Precio de Venta**: Precio final con ganancia e IVA aplicados
  - Si tiene IVA, muestra un desglose: "Sin IVA: X.XX | IVA: X.XX"
- **Ganancia/Unidad**: Cuánto ganas por cada unidad vendida (Precio de Venta Final - Costo)
- **Cantidad**: Cantidad disponible en inventario
- **Fecha**: Fecha de registro

---

## Realizar Ventas

### Proceso de Venta

1. Ve a la sección **"Venta"**
2. Selecciona un producto del menú desplegable
   - Escribe al menos 2 letras para buscar
3. Ingresa la cantidad a vender
4. Haz clic en **"Agregar"** o presiona Enter

### Información Mostrada en el Listado

Para cada producto en la lista verás:

**Precio Total:**
- Total en Bolívares (Bs): Monto total a cobrar
- Total en Dólares ($): Equivalente en USD

**Precio Unitario:**
- Unitario en Bolívares (Bs): Precio por unidad
- Unitario en Dólares ($): Equivalente en USD

**Ejemplo:**
```
Producto: Arroz 1kg
Cantidad: 5 unidades

Total:
  Bs 625.00
  $ 15.63

Unitario:
  Bs 125.00
  $ 3.13
```

### Eliminar un Producto del Listado

- Haz clic en el botón **eliminar** (🗑️) junto al producto que deseas quitar

### Finalizar la Venta

1. Revisa el total en el banner rojo superior
2. Haz clic en **"Pagar"**
3. La venta se guardará automáticamente
4. El inventario se actualizará restando las cantidades vendidas

---

## Reporte de Ventas

### Ver Ventas por Rango de Fechas

1. Ve a la sección **"Ventas"**
2. Selecciona la fecha de inicio
3. Selecciona la fecha de fin
4. El sistema mostrará automáticamente todas las ventas en ese rango

### Información Mostrada

- **Banner Superior**: Total de todas las ventas en el rango seleccionado
- **Lista de Ventas**: Cada venta muestra:
  - ID de la venta
  - Total de la venta
  - Fecha y hora

### Ver Detalle de Productos de una Venta

1. Haz clic en el botón **"más opciones"** (⋮) junto a una venta
2. Se abrirá un modal con la tabla de productos que incluye:

#### Columnas del Detalle:

- **Producto**: Nombre del producto
- **Cantidad**: Cantidad vendida
- **Precio Venta Bs**: Total cobrado en bolívares
- **Costo Total Bs**: Costo total en bolívares
- **Ganancia Bs**: Ganancia obtenida (en verde y negrita)

#### Totales al Final:

- **TOTAL Precio Venta Bs**: Suma de todos los precios de venta
- **TOTAL Costo Total Bs**: Suma de todos los costos
- **TOTAL Ganancia Bs**: Ganancia total de la venta (en verde y negrita)

**Ejemplo de Detalle:**

| Producto | Cantidad | Precio Venta Bs | Costo Total Bs | Ganancia Bs |
|----------|----------|-----------------|----------------|-------------|
| Arroz 1kg | 5 | 625.00 | 360.00 | **265.00** |
| Aceite 1L | 3 | 360.00 | 210.00 | **150.00** |
| **TOTAL** | | **985.00** | **570.00** | **415.00** |

### Compartir Total por WhatsApp

- Haz clic en el ícono de WhatsApp en el banner superior
- Se abrirá WhatsApp con un mensaje pre-formateado con el total de ventas

### Eliminar una Venta

1. Haz clic en el botón **eliminar** (🗑️) junto a la venta
2. Confirma la eliminación
3. ⚠️ **Advertencia**: Esta acción no se puede deshacer y NO restaura el inventario

---

## Preguntas Frecuentes

### ¿Qué es el "Valor Base"?

El **Valor Base** es el precio del producto antes de aplicar el porcentaje de ganancia. Es el precio de referencia sobre el cual se calcula la ganancia.

**Ejemplo:**
- Valor Base: $10.00
- Porcentaje de Ganancia: 20%
- Precio de Venta: $12.00 (10 + 20%)

### ¿Cuál es la diferencia entre "Valor Base" y "Costo"?

- **Valor Base**: Precio al que quieres vender el producto (antes de ganancia)
- **Costo**: Precio al que compraste el producto (lo que te costó)

**Ejemplo:**
- Compraste un producto a $5.00 (Costo)
- Quieres venderlo a $10.00 (Valor Base)
- Con 20% de ganancia, el precio final es $12.00
- Tu ganancia real es $7.00 ($12.00 - $5.00)

### ¿Cómo se calcula el Precio de Venta?

El precio de venta se calcula en dos pasos:

**Paso 1: Calcular precio sin IVA**
```
Precio sin IVA = Valor Base + (Valor Base × Porcentaje de Ganancia / 100)
```

**Paso 2: Calcular IVA y precio final**
```
IVA = Precio sin IVA × (Porcentaje IVA / 100)
Precio de Venta Final = Precio sin IVA + IVA
```

**Ejemplo:**
- Valor Base: $10.00
- Porcentaje de Ganancia: 25%
- IVA: 16%

**Cálculo:**
1. Precio sin IVA: $10.00 + ($10.00 × 25 / 100) = $10.00 + $2.50 = **$12.50**
2. IVA: $12.50 × (16 / 100) = **$2.00**
3. Precio de Venta Final: $12.50 + $2.00 = **$14.50**

> 💡 **Nota**: Si el IVA es 0%, el precio final será igual al precio sin IVA.

### ¿Cómo se calcula la Ganancia/Unidad?

```
Ganancia/Unidad = Precio de Venta Final - Costo
```

El precio de venta final incluye ganancia e IVA.

**Ejemplo:**
- Valor Base: $10.00
- Porcentaje de Ganancia: 25%
- IVA: 16%
- Costo: $8.00

**Cálculo:**
1. Precio sin IVA: $12.50
2. IVA: $2.00
3. Precio de Venta Final: $14.50
4. Ganancia/Unidad: $14.50 - $8.00 = **$6.50**

### ¿Puedo ingresar valores en Bolívares?

Sí. Activa el switch **"Ingresar valores en Bolívares (Bs)"** en los formularios de productos. El sistema convertirá automáticamente a dólares usando el último valor del dólar registrado.

### ¿Qué pasa si elimino un producto del inventario?

Al eliminar un producto, se eliminará permanentemente de la base de datos. Esta acción no se puede deshacer.

### ¿Qué pasa si elimino una venta?

Al eliminar una venta:
- Se eliminará del registro de ventas
- ⚠️ **NO se restaurará** el inventario de los productos vendidos
- Esta acción no se puede deshacer

### ¿Cómo funciona la conversión de moneda?

La aplicación usa el **último valor del dólar registrado** para todas las conversiones:

- Al ingresar valores en Bs y guardar, se convierte a USD
- Al realizar ventas, se calcula todo en USD y luego se muestra en Bs
- En los reportes, todo se muestra en Bs

**Ejemplo con dólar a 40 Bs:**
- Ingresas producto con Valor Base de 100 Bs
- Se guarda como $2.50 USD (100 / 40)
- Al vender, se calcula el precio en USD y se muestra en Bs

### ¿Puedo usar la app sin internet?

Sí. Bodeguita es una PWA (Progressive Web App) que funciona completamente sin conexión a internet después de la primera carga. Todos los datos se guardan localmente en tu navegador.

### ¿Se pierden mis datos si cierro el navegador?

No. Todos los datos se guardan en la base de datos local de tu navegador. Solo se perderán si:
- Limpias los datos del navegador
- Usas el modo incógnito (los datos solo duran mientras la ventana esté abierta)
- Desinstalas la aplicación

### ¿Cómo actualizo el valor del dólar?

1. Ve a **"Valor Dolar"**
2. Haz clic en **"nuevo valor dolar"**
3. Ingresa el nuevo valor
4. Guarda

El sistema usará automáticamente el **último valor registrado** para todos los cálculos.

### ¿Por qué el switch de "Ingresar en Bolívares" está deshabilitado?

El switch se deshabilita si no hay un valor del dólar configurado. Debes:
1. Ir a **"Valor Dolar"**
2. Registrar al menos un valor del dólar
3. Luego podrás usar el switch

### ¿Puedo cambiar el porcentaje de ganancia después de crear un producto?

Sí. Puedes editar cualquier producto y modificar el porcentaje de ganancia. El precio de venta se recalculará automáticamente.

### ¿Qué significan los números en la tabla de productos?

- **Valor Base**: Precio base antes de ganancia
- **Ganancia %**: Porcentaje de ganancia aplicado sobre el valor base
- **IVA %**: Porcentaje de IVA aplicado sobre el precio sin IVA
- **Precio de Venta**: Precio final con ganancia e IVA incluidos
  - Si tiene IVA > 0%, muestra desglose: precio sin IVA y monto de IVA
- **Ganancia/Unidad**: Precio de Venta Final - Costo (cuánto ganas realmente)
- **Cantidad**: Productos disponibles en inventario

### ¿Qué es el IVA y cómo funciona?

El **IVA (Impuesto al Valor Agregado)** es un impuesto que se suma al precio de venta. En Bodeguita, el IVA se calcula sobre el precio sin IVA (que ya incluye la ganancia).

**Características:**
- ✅ Es configurable por producto (puede ser 0% si no aplica)
- ✅ Se suma al precio final de venta
- ✅ Se aplica después de calcular la ganancia
- ✅ Si un producto tiene 0% de IVA, el precio final será igual al precio sin IVA

**Ejemplo con IVA del 16%:**
- Valor Base: $100.00
- Ganancia: 20% → Precio sin IVA: $120.00
- IVA: 16% → IVA = $120.00 × 16% = $19.20
- **Precio Final: $139.20**

**Ejemplo sin IVA (0%):**
- Valor Base: $100.00
- Ganancia: 20% → Precio sin IVA: $120.00
- IVA: 0% → IVA = $0.00
- **Precio Final: $120.00**

---

## Consejos y Mejores Prácticas

### ✅ Recomendaciones

1. **Actualiza el valor del dólar regularmente** para mantener cálculos precisos
2. **Verifica la cantidad en inventario** antes de realizar ventas
3. **Revisa el reporte de ventas** para analizar tus ganancias
4. **Ingresa el costo real** de los productos para tener métricas precisas de ganancia
5. **Usa nombres descriptivos** para los productos para facilitar la búsqueda

### ⚠️ Precauciones

1. **No elimines ventas a menos que sea necesario**: No se restaura el inventario
2. **No elimines productos sin verificar**: Puede afectar reportes históricos
3. **Mantén respaldos**: Si limpias los datos del navegador, perderás toda la información

### 💡 Tips Útiles

- Usa la búsqueda en el campo de productos durante las ventas (escribe 2 letras)
- El total en el banner superior se actualiza automáticamente al agregar/quitar productos
- Puedes compartir el total de ventas directamente por WhatsApp
- Los valores se muestran siempre con 2 decimales para mayor precisión

---

## Ejemplos de Uso Completo

### Escenario 1: Configuración Inicial de una Bodega

1. **Configurar valor del dólar:**
   ```
   Valor Dolar → Nuevo valor dolar → 40.00 → Guardar
   ```

2. **Agregar productos:**
   ```
   Producto 1:
   - Nombre: Arroz 1kg
   - Valor Base (USD): 2.50
   - Costo (USD): 1.80
   - Ganancia (%): 25
   - IVA (%): 16
   - Cantidad: 100

   Producto 2:
   - Nombre: Aceite 1L
   - Valor Base (Bs): 100.00 (activar switch)
   - Costo (Bs): 70.00
   - Ganancia (%): 20
   - IVA (%): 16
   - Cantidad: 50
   ```

3. **Realizar primera venta:**
   ```
   - Seleccionar: Arroz 1kg
   - Cantidad: 5
   - Agregar
   - Revisar total: Bs 500.00 / $12.50
   - Pagar
   ```

### Escenario 2: Día de Ventas

1. **Actualizar valor del dólar** (si cambió)
2. **Realizar múltiples ventas** durante el día
3. **Al final del día**, ir a **"Ventas"**:
   - Seleccionar fecha de inicio: Hoy
   - Seleccionar fecha de fin: Hoy
   - Ver total de ventas del día
   - Ver ganancia total del día
   - Compartir total por WhatsApp si es necesario

### Escenario 3: Reabastecimiento

1. **Verificar inventario** en la tabla de productos
2. **Agregar cantidad** a productos que estén bajos:
   - Clic en botón + junto al producto
   - Ingresar cantidad a agregar
   - Guardar

---

## Soporte

Para sugerencias o información adicional:
- **Desarrollado por**: Jean Zamora y Joyner Olivares
- **Email**: jeancarloscuatro1@gmail.com

---

**Versión**: 1.6.0
**Última actualización**: 2025

---

## Changelog

### Versión 1.6.0
- ✨ Agregado cálculo de IVA configurable por producto
- ✨ El IVA se suma al precio final de venta
- ✨ Visualización del desglose de IVA en la tabla de productos
- ✨ Los productos sin IVA mantienen compatibilidad (0% por defecto)

