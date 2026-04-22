# 🛒 Shopping Cart Frontend

Aplicación web SPA desarrollada con **Angular 21** para consumir la [Shopping Cart API](http://localhost:8080/swagger-ui/index.html) REST construida en Spring Boot.

> **Proyecto:** Carrito de Compras  
> **Autor:** Juan Carlos Tamayo Andrade  
> **Institución:** Universidad CorHuila  
> **Materia:** Sistemas Distribuidos

---

## 🧰 Tecnologías utilizadas

| Tecnología | Versión |
|---|---|
| Angular | 21.2.x |
| Angular SSR | 21.2.x |
| TypeScript | 5.9.x |
| RxJS | 7.8.x |
| Node.js | 20.x |
| Angular CLI | 21.2.8 |

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   ├── api-response.model.ts    ← Wrapper genérico ApiResponse<T>
│   │   │   ├── product.model.ts         ← Interface Product
│   │   │   ├── customer.model.ts        ← Interface Customer
│   │   │   ├── cart.model.ts            ← Interfaces Cart, CartItem, AddItemRequest
│   │   │   └── order.model.ts           ← Interfaces Order, OrderItem, OrderStatus
│   │   └── services/
│   │       ├── toast.service.ts         ← Notificaciones signal-based
│   │       ├── product.service.ts       ← HTTP CRUD productos
│   │       ├── customer.service.ts      ← HTTP CRUD clientes
│   │       ├── cart.service.ts          ← HTTP gestión carrito
│   │       └── order.service.ts         ← HTTP órdenes y checkout
│   │
│   ├── shared/
│   │   └── toast/
│   │       └── toast.component.ts       ← Componente de notificaciones
│   │
│   ├── features/
│   │   ├── dashboard/
│   │   │   └── dashboard.component.ts   ← Estadísticas y acciones rápidas
│   │   ├── products/
│   │   │   ├── products.component.ts    ← Lógica CRUD de productos
│   │   │   └── products.component.html  ← Vista tabla + modales
│   │   ├── customers/
│   │   │   ├── customers.component.ts   ← Lógica CRUD de clientes
│   │   │   └── customers.component.html ← Vista tabla + modales
│   │   ├── cart/
│   │   │   ├── cart.component.ts        ← Lógica carrito y checkout
│   │   │   └── cart.component.html      ← Vista carrito + resumen
│   │   └── orders/
│   │       ├── orders.component.ts      ← Lógica órdenes y estados
│   │       └── orders.component.html    ← Vista tabla + detalle modal
│   │
│   ├── app.ts                           ← Componente raíz (shell + sidebar)
│   ├── app.html                         ← Layout principal con navegación
│   ├── app.routes.ts                    ← Rutas con lazy loading
│   ├── app.routes.server.ts             ← Configuración SSR por ruta
│   └── app.config.ts                    ← Providers: Router, HttpClient, SSR
│
├── styles.css                           ← Design system global (variables CSS)
└── index.html                           ← HTML raíz
```

---

## ⚙️ Configuración y requisitos

### 1. Requisitos previos

- Node.js 20+
- npm 10+
- Angular CLI 21
- Backend Shopping Cart API corriendo en `http://localhost:8080`

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar CORS en el backend

El frontend corre en `http://localhost:4200`. El backend Spring Boot debe permitir este origen. Agrega esta clase al paquete `constant/` del backend:

```java
// CorsConfig.java
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:4200")
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }
}
```

### 4. Ejecutar en desarrollo

```bash
npm start
# o
ng serve
```

Abre el navegador en: **`http://localhost:4200`**

---

## 📖 Módulos de la aplicación

### 📊 Dashboard — `/dashboard`

Vista de bienvenida con estadísticas en tiempo real consultadas directamente al backend:

| Tarjeta | Dato |
|---|---|
| Productos | Total registrados |
| Clientes | Total registrados |
| Órdenes | Total generadas |
| Pendientes | Órdenes con estado `PENDING` |

También incluye accesos directos a cada módulo y la tabla de política de descuentos automáticos.

---

### 📦 Productos — `/products`

Gestión completa del catálogo de productos.

| Acción | Descripción |
|---|---|
| **Listar** | Tabla con id, nombre, descripción, precio, stock y estado |
| **Crear** | Modal con formulario reactivo validado |
| **Editar** | Modal pre-cargado con datos actuales |
| **Eliminar** | Modal de confirmación antes de borrar |

**Validaciones del formulario:**
- Nombre: requerido, mínimo 2 caracteres
- Descripción: requerida
- Precio: requerido, mínimo $1
- Stock: requerido, mínimo 0

---

### 👤 Clientes — `/customers`

Administración de clientes registrados.

| Acción | Descripción |
|---|---|
| **Listar** | Tabla con id, nombre, email, teléfono y dirección |
| **Crear** | Modal con formulario reactivo validado |
| **Editar** | Modal pre-cargado con datos actuales |
| **Eliminar** | Modal de confirmación antes de borrar |
| **Ir al carrito** | Botón que navega directamente a `/cart/:id` |

**Validaciones del formulario:**
- Nombre: requerido, mínimo 2 caracteres
- Email: requerido, formato válido
- Teléfono: requerido
- Dirección: requerida

---

### 🛒 Carrito — `/cart` · `/cart/:customerId`

Gestión completa del carrito de compras activo por cliente.

**Flujo de uso:**
1. Seleccionar cliente del dropdown (carga automáticamente su carrito activo o lo crea)
2. Agregar productos usando el panel lateral (selector de producto + cantidad)
3. Ajustar cantidades con los controles `+` / `−` por ítem
4. Eliminar ítems individuales o vaciar todo el carrito
5. Visualizar resumen con descuento aplicado automáticamente
6. Presionar **Realizar Checkout** para generar la orden

**Descuentos automáticos aplicados en checkout:**

| Total del carrito | Descuento |
|---|---|
| Menos de $100.000 | Sin descuento |
| $100.000 – $299.999 | 10% |
| $300.000 o más | 15% |

---

### 📋 Órdenes — `/orders`

Historial completo de órdenes generadas.

| Columna | Descripción |
|---|---|
| ID | Número de orden |
| Cliente | Nombre del cliente |
| Subtotal | Total antes de descuento |
| Descuento | Monto descontado (badge verde) |
| Total | Monto final pagado |
| Estado | Badge con color semántico |
| Cambiar estado | Select inline para actualizar |
| Fecha | Fecha y hora de creación |
| Detalle | Modal con ítems + resumen |

**Estados disponibles y colores:**

| Estado | Color | Descripción |
|---|---|---|
| `PENDING` | Amarillo | Pendiente de confirmación |
| `CONFIRMED` | Azul | Confirmada |
| `SHIPPED` | Morado | En camino |
| `DELIVERED` | Verde | Entregada (estado final) |
| `CANCELLED` | Rojo | Cancelada (estado final) |

---

## 🎨 Design System

El proyecto usa un design system completamente personalizado en CSS puro (sin librerías externas), definido en `src/styles.css` mediante variables CSS:

```css
:root {
  --primary:   #4f46e5;  /* Indigo */
  --success:   #10b981;  /* Esmeralda */
  --warning:   #f59e0b;  /* Ámbar */
  --danger:    #ef4444;  /* Rojo */
  --info:      #3b82f6;  /* Azul */
}
```

**Componentes del design system:**

| Clase | Uso |
|---|---|
| `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-danger` | Botones con variantes |
| `.badge-success/warning/danger/info/purple/gray` | Etiquetas de estado |
| `.card`, `.card-header`, `.card-body` | Tarjetas de contenido |
| `.modal`, `.overlay` | Diálogos modales con animación |
| `.toast-container`, `.toast` | Notificaciones emergentes |
| `.form-control`, `.form-label`, `.form-error` | Campos de formulario |
| `.spinner` | Indicador de carga animado |
| `.empty-state` | Estado vacío con ícono |
| `.stats-grid`, `.stat-card` | Tarjetas de estadísticas |

---

## 🏛️ Patrones y principios aplicados

### Angular Best Practices (v21)

| Práctica | Implementación |
|---|---|
| **Standalone Components** | Todos los componentes son standalone (sin NgModules) |
| **Signals** | Estado local con `signal()`, derivado con `computed()` |
| **OnPush** | `ChangeDetectionStrategy.OnPush` en todos los componentes |
| **inject()** | Inyección funcional en lugar de constructores |
| **Lazy Loading** | Cada feature se carga bajo demanda con `loadComponent()` |
| **Control flow nativo** | `@if`, `@for`, `@switch` en lugar de directivas estructurales |
| **Reactive Forms** | `FormBuilder` + `Validators` con validación visual |

### Patrones de diseño

| Patrón | Implementación |
|---|---|
| **Service Layer** | Servicios dedicados por entidad de dominio |
| **Single Responsibility** | Cada componente y servicio con una única responsabilidad |
| **DRY** | Design system reutilizable, servicios compartidos |

---

## 🌐 Comunicación con el Backend

Todos los servicios consumen la API REST en `http://localhost:8080/api/v1`.

Las respuestas del backend tienen la forma `ResponseGenerico<T>`:

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

Los servicios Angular desenvuelven automáticamente el campo `data` usando el operador `map` de RxJS:

```typescript
getAll(): Observable<Product[]> {
  return this.http.get<ApiResponse<Product[]>>(BASE)
    .pipe(map(r => r.data));
}
```

---

## 🚀 Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo en `http://localhost:4200` |
| `npm run build` | Build de producción en `dist/` |
| `npm run watch` | Build en modo watch (desarrollo) |
| `npm test` | Ejecutar pruebas unitarias con Vitest |
| `npm run serve:ssr:shopping-cart-front` | Servidor SSR de producción |

---

## 📬 Flujo completo de uso

```
1. Crear productos     →  /products  → Botón "Nuevo Producto"
2. Registrar cliente   →  /customers → Botón "Nuevo Cliente"
3. Abrir carrito       →  /customers → Botón "Carrito" del cliente
4. Agregar productos   →  /cart/:id  → Panel "Agregar producto"
5. Hacer checkout      →  /cart/:id  → Botón "Realizar Checkout"
6. Ver la orden        →  /orders    → Tabla de órdenes generadas
7. Actualizar estado   →  /orders    → Select inline o modal detalle
```

---

## 📄 Licencia

© 2026 CorHuila
