# Smart Parking UTEQ - Sistema de Gestión de Parqueadero Inteligente

Sistema web completo desarrollado con **React**, **Vite**, **CoreUI** y **Supabase** para la administración de espacios de estacionamiento, el monitoreo de puestos, el registro del historial de accesos y la gestión de vehículos y propietarios.

## Funcionalidades

- Inicio de sesion, registro y recuperacion de contrasena.
- Panel principal con informacion del parqueadero.
- Gestion de vehiculos y propietarios.
- Gestion de puestos de estacionamiento.
- Registro e historial de accesos.
- Operaciones de consulta, creacion, actualizacion y eliminacion conectadas a Supabase.
- Interfaz responsive basada en CoreUI y Bootstrap.

## Vistas del sistema

- **Gestión de vehículos y propietarios:** permite crear, modificar y eliminar registros vehiculares, incluyendo información del propietario, cédula, estado de autorización y fotografía cuando corresponda.
- **Monitoreo de puestos:** muestra tarjetas con el estado de cada espacio, diferenciando puestos ocupados y disponibles según la información registrada por los sensores.
- **Historial de parqueo:** presenta la bitácora de accesos y salidas con marcas temporales, códigos de registro y placas detectadas.

## Capturas de la aplicación

Las capturas de los módulos pueden incorporarse en `src/assets/images/` cuando estén disponibles:

1. Módulo de vehículos y propietarios.
2. Monitoreo y gestión de puestos.
3. Historial de registros.

## Tecnologias

- React 19
- Vite
- React Router
- CoreUI React y Bootstrap 5
- Supabase para autenticacion y base de datos
- Sass/SCSS
- Chart.js

## Requisitos

- Node.js 18 o superior recomendado.
- npm incluido con Node.js.
- Un proyecto de Supabase con las tablas y permisos necesarios.

## Instalacion

1. Clona el repositorio y entra en su carpeta:

   ```bash
   git clone https://github.com/tu-usuario/smart-parking-uteq.git
   cd smart-parking-uteq
   ```

2. Instala las dependencias:

   ```bash
   npm.cmd install
   ```

3. Crea un archivo `.env.local` en la raiz del proyecto:

   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=tu-clave-publicable
   ```

   No subas este archivo al repositorio. La aplicacion detiene su inicializacion si falta alguna de estas variables.

4. Inicia el servidor de desarrollo:

   ```bash
   npm.cmd start
   ```

   La aplicación estará disponible en la URL que muestre Vite, normalmente `http://localhost:5173`.

## Base de datos

La capa de acceso a datos utiliza Supabase. Las vistas actuales consultan estas tablas:

| Tabla | Uso |
| --- | --- |
| `puestos` | Puestos de estacionamiento y su estado |
| `registros_estacionamiento` | Historial de accesos y salidas |

La gestion de vehiculos y autenticacion requiere que el esquema de Supabase correspondiente este creado y que las politicas de Row Level Security permitan las operaciones que necesita cada usuario.

## Comandos disponibles

| Comando | Descripcion |
| --- | --- |
| `npm start` | Inicia Vite en modo desarrollo con recarga en caliente |
| `npm run build` | Genera la compilacion de produccion en `dist/` |
| `npm run serve` | Sirve localmente la compilacion generada |
| `npm run lint` | Ejecuta ESLint sobre el proyecto |

## Estructura del proyecto

```text
public/                 Archivos estaticos y manifest de la aplicacion
src/
  assets/               Logos, iconos e imagenes
  components/           Header, sidebar, contenido y componentes reutilizables
  hooks/                Hooks de acceso a datos del parqueadero
  layout/               Layout principal de la aplicacion
  lib/supabase.js       Cliente de Supabase
  scss/                 Estilos globales y personalizaciones
  views/
    authentication/     Flujos de autenticacion
    dashboard/          Panel principal
    parqueadero/        Vehiculos, puestos e historial
  App.jsx               Componente raiz
  _nav.jsx              Configuracion de navegacion lateral
  index.jsx             Punto de entrada de React
  routes.js             Rutas de la aplicacion
  store.js              Estado global de interfaz
ARCHITECTURE.md         Descripcion de la arquitectura
DEVELOPMENT.md          Guia de desarrollo
vite.config.mjs         Configuracion de Vite
```

## Rutas principales

- `/dashboard`: panel principal.
- `/vehiculos`: gestion de vehiculos.
- `/propietarios`: vista asociada a propietarios.
- `/puestos`: gestion de puestos.
- `/historial`: historial de registros de estacionamiento.

## Características técnicas

- **Integración con Supabase:** operaciones CRUD asíncronas sobre la base de datos y autenticación mediante el cliente oficial.
- **Búsqueda dinámica:** filtrado instantáneo de vehículos, puestos e historial desde las vistas correspondientes.
- **Diseño responsivo:** interfaz construida con componentes CoreUI y Bootstrap.
- **Validaciones y estados de carga:** confirmación antes de eliminar registros, indicadores de carga y manejo de errores.
- **Carga diferida:** las vistas se importan con `React.lazy` para reducir la carga inicial de la aplicación.

## Desarrollo

Los cambios de la aplicacion deben realizarse dentro de `src/`. Antes de integrar cambios, ejecuta:

```bash
npm.cmd run lint
npm.cmd run build
```

Consulta [ARCHITECTURE.md](ARCHITECTURE.md) para conocer la organizacion tecnica y [DEVELOPMENT.md](DEVELOPMENT.md) para las convenciones de desarrollo.

## Despliegue

1. Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en el entorno de despliegue.
2. Ejecuta `npm.cmd run build`.
3. Publica el contenido de `dist/` en un servicio compatible con aplicaciones SPA.
4. Configura el fallback del servidor hacia `index.html` para conservar la navegacion de React Router.

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta [LICENSE](LICENSE) para mas informacion.
