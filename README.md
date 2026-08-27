# UPVenta

**Inventario y ventas para emprendedores de la UPB.**

Aplicación híbrida para estudiantes que venden productos entre clases (comida, ropa,
accesorios) y necesitan controlar su inventario, sus ventas y su recaudo diario desde
el celular, sin conexión a internet.

## Características

- **Registro rápido de ventas** con descuento de stock automático y precio ajustable
  por venta (para aplicar descuentos).
- **Inventario** con categorías, precio, unidad y stock mínimo; entrada de mercancía
  en un toque.
- **Alertas de stock bajo** con reabastecimiento rápido y contador de alertas sin ver.
- **Resumen del día**: recaudo, número de ventas, ticket promedio, productos más
  vendidos y meta del día.
- **Estadísticas de los últimos 10 días** con ventas.
- **Historial** de ventas por día, con el detalle de cada transacción.
- **Cuentas de usuario** (registro e inicio de sesión simulados); cada cuenta gestiona
  su propio negocio.
- **100 % offline**: los datos viven en el dispositivo (`localStorage`); no hay backend
  ni llamadas a servicios externos.

## Tecnologías

| Área          | Herramienta                                                  |
|---------------|-------------------------------------------------------------|
| Enfoque       | SPA en JavaScript nativo (ES Modules), sin frameworks       |
| Empaquetado   | [Vite](https://vite.dev/)                                    |
| Estilos       | [Sass](https://sass-lang.com/) con parciales por capas      |
| Tipografía    | [Outfit](https://fontsource.org/fonts/outfit), auto-alojada  |
| Persistencia  | Web Storage API (`localStorage`)                             |
| Íconos y logo | SVG propios, incrustados                                     |

## Requisitos

- [Node.js](https://nodejs.org/) 20.19 o superior

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Entorno de desarrollo (recarga en caliente)
npm run dev

# Compilar el bundle de producción -> dist/
npm run build

# Previsualizar el bundle compilado
npm run preview
```

La aplicación abre en `http://localhost:5173`.

### Cuenta de demostración

| Correo             | Clave     |
|--------------------|-----------|
| `demo@upventa.app` | `demo123` |

## Estructura del proyecto

```
src/
├── main.js              # Punto de entrada
├── router.js            # Enrutador SPA basado en hash
├── navigate.js          # Utilidad de navegación
├── icons.js             # Íconos y logotipo (SVG en línea)
├── utils.js             # Formato de moneda y fechas, saneado de HTML
├── components/          # Cabecera, navegación, modal y notificaciones
├── views/               # Una vista por pantalla (login, inicio, vender, …)
├── store/
│   ├── db.js            # Capa de datos sobre localStorage
│   └── seed.js          # Catálogo y cuenta de ejemplo
└── scss/
    ├── main.scss        # Orquestador de parciales
    ├── abstracts/       # Variables y mixins
    ├── base/            # Reset y tipografía
    ├── layout/          # Estructura, cabecera y navegación
    ├── components/      # Botones, tarjetas, formularios, feedback
    └── pages/           # Estilos por vista
```

## Arquitectura

- **Navegación:** enrutador propio sobre el evento `hashchange`; cada vista es un
  módulo con `render()` y `afterRender()`.
- **Datos:** `store/db.js` expone una API (productos, ventas, alertas, metas) sobre
  `localStorage`; los registros se asocian al usuario de la sesión activa.
- **Entidades:** `users`, `session`, `products`, `sales`, `alerts_seen`, `day_goals`.
- **Sin red:** el bundle de producción (`dist/`) es autocontenido —HTML, CSS, JS,
  fuentes e imágenes— y está listo para empaquetarse con Capacitor (`npx cap sync`).

## Prototipo

Diseño en Figma — 10 pantallas y flujo interactivo:
<https://www.figma.com/design/LXumDKgTOavzvOy12hWqmF/UPVenta-%E2%80%94-Prototipo>

## Autores

- **Sebastián Muñoz Castañeda** — Diseño de interfaz y experiencia de usuario
- **Nicolás Agudelo Mesa** — Desarrollo y arquitectura de la aplicación

---

Proyecto académico · Aplicaciones móviles, Universidad Pontificia Bolivariana ·
Entrega 2: Aplicación híbrida.
