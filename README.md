# :globe_with_meridians: Work3Spaces (Abako / PolkaTalent)

**Marketplace descentralizado para freelancers, construido sobre Polkadot/Virto Network.**

> Un cliente propone un proyecto, una DAO (organizacion autonoma descentralizada) asigna un consultor, el consultor define el alcance con hitos, el cliente aprueba, se forma el equipo, se desarrolla, se revisa y se paga a traves de un sistema de custodia (escrow) en blockchain.

[![Estado: En Migracion](https://img.shields.io/badge/Estado-En%20Migraci%C3%B3n-orange)]()
[![Branch](https://img.shields.io/badge/Branch-feature%2Fweb--refactor-blue)]()
[![Node](https://img.shields.io/badge/Node.js-%3E%3D18-green)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61dafb)]()

---

## Tabla de Contenidos

1. [Sobre el Proyecto](#-sobre-el-proyecto)
2. [Stack Tecnologico](#-stack-tecnologico)
3. [Arquitectura General](#-arquitectura-general)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Prerrequisitos](#-prerrequisitos)
6. [Comenzar a Trabajar](#-comenzar-a-trabajar)
7. [Scripts Disponibles](#-scripts-disponibles)
8. [Estado de la Migracion](#-estado-de-la-migracion)
9. [TODOs para Desarrolladores Junior](#-todos-para-desarrolladores-junior)
10. [Contribuir al Proyecto](#-contribuir-al-proyecto)
11. [Enlaces Utiles](#-enlaces-utiles)

---

## Sobre el Proyecto

### Que problema resuelve

Imagina que eres una empresa (un **cliente**) y necesitas desarrollar un software. Normalmente tendrias que buscar freelancers por tu cuenta, negociar precios, confiar en que entreguen a tiempo y gestionar pagos manualmente. Work3Spaces resuelve todo esto usando **blockchain** (un registro digital descentralizado, transparente e inmutable).

### Como funciona

```
1. El CLIENTE propone un proyecto (descripcion, presupuesto, plazo)
2. Una DAO (comunidad) vota y asigna un CONSULTOR al proyecto
3. El CONSULTOR define el ALCANCE: divide el proyecto en HITOS (milestones)
4. El CLIENTE aprueba (o rechaza) el alcance propuesto
5. Se asigna un EQUIPO DE DESARROLLADORES a los hitos
6. Los desarrolladores trabajan y envian entregas para revision
7. El cliente revisa y aprueba cada hito
8. El pago se libera automaticamente desde el sistema de custodia (escrow)
```

### Conceptos clave para juniors

| Concepto | Que es | Por que importa |
|----------|--------|-----------------|
| **Blockchain** | Una base de datos distribuida donde nadie puede alterar los registros. | Garantiza que los pagos y acuerdos sean transparentes e inmutables. |
| **Polkadot** | Una red de blockchains interconectadas. | Es la infraestructura donde vive nuestro proyecto. |
| **Virto Network** | Una blockchain dentro de Polkadot, especializada en comercio y pagos. | Proporciona las herramientas de autenticacion (WebAuthn) y pagos. |
| **DAO** | Organizacion Autonoma Descentralizada: un grupo que toma decisiones por votacion. | Asigna consultores y equipos de forma justa y transparente. |
| **Escrow** | Sistema de custodia: el dinero se retiene hasta que se cumplan condiciones. | El cliente deposita fondos, pero solo se liberan cuando aprueba el trabajo. |
| **Hito (Milestone)** | Una entrega parcial del proyecto con alcance definido. | Permite dividir el trabajo en partes manejables con pagos incrementales. |
| **WebAuthn** | Autenticacion sin contrasena, usando biometricos o llaves de seguridad. | Los usuarios se registran con su dispositivo, no con email/password. |
| **SPA** | Single Page Application: una aplicacion web que carga una sola vez y navega sin recargar la pagina. | El frontend React es una SPA que se comunica directamente con las APIs externas. |

---

## :wrench: Stack Tecnologico

### Frontend (la aplicacion completa)

| Tecnologia | Version | Para que se usa |
|------------|---------|-----------------|
| **React** | 18.3 | Biblioteca para construir la interfaz de usuario con componentes |
| **TypeScript** | 5.7 | JavaScript con tipos estaticos (detecta errores antes de ejecutar) |
| **Vite** | 6.0 | Herramienta de desarrollo ultrarapida (compila, recarga al instante) |
| **TailwindCSS** | 3.4 | Framework de estilos basado en clases utilitarias |
| **Zustand** | 5.0 | Gestor de estado global (alternativa ligera a Redux) |
| **TanStack React Query** | 5.62 | Manejo inteligente de datos del servidor (cache, reintentos, etc.) |
| **React Router** | 6.28 | Navegacion entre paginas sin recargar |
| **React Hook Form** | 7.54 | Manejo eficiente de formularios |
| **Zod** | 3.24 | Validacion de datos con esquemas tipados |
| **Axios** | 1.7 | Cliente HTTP para comunicarse directamente con las 3 APIs externas |

### APIs Externas (no necesitas instalar nada)

El frontend se comunica **directamente** con 3 APIs que viven en `dev.abako.xyz`. No necesitas levantar ningun servidor, ya estan desplegadas y accesibles via CORS.

| API | Base URL | Para que se usa |
|-----|----------|-----------------|
| **Adapter API** | `dev.abako.xyz/adapter/v1` | CRUD de clientes, developers, proyectos, hitos y calendario |
| **Virto API** | `dev.abako.xyz/api` | Autenticacion WebAuthn, pagos, membresias |
| **Contracts API** | `dev.abako.xyz` | Despliegue e interaccion con contratos inteligentes en blockchain |

> **Nota para juniors**: Antes, existia un backend Express.js que actuaba como intermediario entre el navegador y las APIs externas. Ese backend ya no es necesario. El frontend React habla directamente con las APIs usando CORS (Cross-Origin Resource Sharing, un mecanismo de seguridad del navegador que permite peticiones entre dominios diferentes).

---

## :building_construction: Arquitectura General

### Como funciona la aplicacion

```
         NAVEGADOR DEL USUARIO
                 |
           React SPA (Vite)
           http://localhost:5173
                 |
         +-------+-------+
         |       |       |
         v       v       v
    Adapter   Virto   Contracts
      API      API      API
         \       |       /
          \      |      /
       dev.abako.xyz (CORS)
```

**Importante**: No hay backend intermedio. El navegador envia peticiones HTTP directamente a `dev.abako.xyz`. Esto simplifica enormemente la arquitectura: un solo proyecto (el frontend) que se comunica con APIs ya desplegadas.

### Las 3 capas del frontend

La aplicacion esta organizada en 3 capas bien definidas. Cada capa tiene una responsabilidad unica:

```
+------------------------------------------------------------------+
|  CAPA DE PRESENTACION (componentes React, paginas, layouts)      |
|  Responsabilidad: mostrar datos y capturar interacciones         |
+------------------------------------------------------------------+
                            |
                    usa hooks y stores
                            |
+------------------------------------------------------------------+
|  CAPA DE SERVICIOS (services/)  -  58 funciones de negocio       |
|  Responsabilidad: componer datos, orquestar llamadas API,        |
|  aplicar logica de negocio (ej: agregar proyecto con sus hitos)  |
+------------------------------------------------------------------+
                            |
                  llama funciones de API
                            |
+------------------------------------------------------------------+
|  CAPA DE API (api/adapter, api/virto, api/contracts)             |
|  Responsabilidad: comunicarse con las APIs externas via HTTP     |
|  52 funciones (adapter) + 17 funciones (virto) + 10 (contracts)  |
+------------------------------------------------------------------+
                            |
                  Axios HTTP requests
                            |
+------------------------------------------------------------------+
|  dev.abako.xyz  -  3 APIs externas (ya desplegadas)              |
+------------------------------------------------------------------+
```

### La capa de Servicios (`frontend/src/services/`)

Los servicios son el **corazon de la logica de negocio**. Antes, esta logica vivia en el backend dentro de la "capa SEDA" (`backend/models/seda/`). Ahora esta portada a TypeScript y vive directamente en el frontend.

**Sin servicios** (malo):
```typescript
// El componente llama directamente a la API y compone datos manualmente
const project = await getProjectInfo(projectId);
const clients = await getClients();
const developers = await getDevelopers();
const milestones = await getAllTasks(projectId);
// ... composicion manual de datos en el componente
```

**Con servicios** (bueno):
```typescript
// El componente usa el servicio, que se encarga internamente
import { getProject } from '@/services';
const project = await getProject(projectId);
// El servicio agrega proyecto + cliente + consultor + hitos automaticamente
```

La capa de servicios tiene 7 modulos con 58 funciones en total:

| Modulo | Funciones | Responsabilidad |
|--------|-----------|----------------|
| `projectService.ts` | 15 | Agregacion de proyectos, listas optimizadas con `Promise.allSettled`, acciones de flujo |
| `proposalService.ts` | 2 | Crear y actualizar propuestas de proyecto |
| `clientService.ts` | 8 | CRUD de clientes, busqueda por email, conexion |
| `developerService.ts` | 9 | CRUD de developers, resolucion de equipos, busqueda por email |
| `milestoneService.ts` | 10 | CRUD de hitos, reordenamiento, envio/aceptacion/rechazo |
| `scopeService.ts` | 3 | Enviar, aceptar y rechazar alcances |
| `calendarService.ts` | 11 | Registro de workers, disponibilidad, contratos de calendario |

### La capa de API (`frontend/src/api/`)

Las funciones de API son **wrappers delgados** sobre Axios que se encargan de: construir la URL correcta, enviar headers de autenticacion, manejar errores y tipar respuestas.

| Modulo | Funciones | API externa |
|--------|-----------|-------------|
| `api/adapter/` | 52 | Adapter API (`/adapter/v1`) - auth, clients, developers, projects, milestones, calendar |
| `api/virto/` | 17 | Virto API (`/api`) - WebAuthn, payments, memberships |
| `api/contracts/` | 10 | Contracts API - deploy, query, call |
| `api/config.ts` | -- | Configuracion centralizada de URLs y endpoints para las 3 APIs |

### Estado global con Zustand

Usamos **Zustand** para manejar el estado global (datos que necesitan compartirse entre varios componentes). El estado de autenticacion se persiste en `localStorage` para que el usuario no pierda su sesion al recargar la pagina.

- **`authStore.ts`**: Almacena la informacion del usuario autenticado, su token y su rol (cliente o developer). Usa `zustand/middleware/persist` para guardar el estado en `localStorage` bajo la clave `abako-auth-storage`.

Zustand es mucho mas simple que Redux. Ejemplo:

```typescript
// Asi se usa Zustand en un componente
import { useAuthStore } from '@/stores/authStore';

function MiComponente() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) return <p>No estas logueado</p>;
  return <p>Hola, {user?.name}</p>;
}
```

### Permisos con funciones puras (`frontend/src/lib/permissions.ts`)

Los permisos se calculan con **funciones puras** (sin efectos secundarios, sin estado). Antes vivian en el backend como middleware de Express. Ahora son funciones TypeScript que reciben el usuario y devuelven `true` o `false`.

```typescript
import { isClient, isProjectConsultant, checkPermission } from '@/lib/permissions';
import { useAuthStore } from '@/stores/authStore';

function AccionesProyecto({ project }) {
  const user = useAuthStore((s) => s.user);

  // Verificacion simple
  if (isClient(user)) { /* mostrar boton de aprobar */ }

  // Verificacion compuesta (permite cliente O consultor)
  const allowed = checkPermission(user, {
    projectClient: project.clientId,
    projectConsultant: project.consultantId,
  });
  if (allowed) { /* mostrar acciones */ }
}
```

### Datos del servidor con React Query

Para los datos que vienen de las APIs externas (proyectos, hitos, pagos), usamos **TanStack React Query**. Los hooks llaman directamente a los servicios (no a un backend propio). Esto nos da:

- **Cache automatico**: Si ya cargaste la lista de proyectos, no la vuelve a pedir a la API.
- **Reintentos**: Si falla una peticion, lo intenta de nuevo automaticamente.
- **Actualizacion en segundo plano**: Los datos se refrescan sin que el usuario lo note.

```typescript
// Ejemplo: hook que obtiene proyectos directamente de las APIs externas
import { useProjects } from '@/hooks/useProjects';

function ListaProyectos() {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) return <Spinner />;
  if (error) return <p>Error al cargar proyectos</p>;
  return projects.map(p => <ProjectCard key={p.id} project={p} />);
}
```

### Constantes y Enums

Los datos de referencia (presupuestos, tipos de proyecto, skills, idiomas, etc.) ya **no se obtienen del backend**. Estan definidos como constantes estaticas en TypeScript:

| Archivo | Contenido |
|---------|-----------|
| `types/enums.ts` | Presupuestos, tiempos de entrega, tipos de proyecto, skills, roles, disponibilidad, proficiency |
| `constants/languages.ts` | Mapa de 154 codigos ISO 639-3 a nombres de idiomas |

Esto elimina una llamada HTTP (antes `GET /api/enums`) y garantiza que los formularios nunca muestren un spinner esperando las opciones.

---

## :file_folder: Estructura del Proyecto

<details>
<summary><strong>Haz clic para expandir el arbol completo del proyecto</strong></summary>

```
website/
|
|-- frontend/                              # Aplicacion React SPA (todo lo necesario)
|   |-- src/
|   |   |-- main.tsx                       # Punto de entrada: React + QueryClient + Router
|   |   |-- App.tsx                        # Componente raiz con React Router
|   |   |-- index.css                      # Estilos globales con Tailwind
|   |   |
|   |   |-- api/                           # Capa de comunicacion con APIs externas
|   |   |   |-- config.ts                  # URLs y endpoints de las 3 APIs (Adapter, Virto, Contracts)
|   |   |   |-- adapter/                   # 52 funciones - Adapter API (NestJS)
|   |   |   |   |-- index.ts              # Barrel export
|   |   |   |   |-- auth.ts               # checkRegistered, customRegister, customConnect, sign
|   |   |   |   |-- clients.ts            # getClients, getClient, createClient, updateClient, ...
|   |   |   |   |-- developers.ts         # getDevelopers, getDeveloper, createDeveloper, ...
|   |   |   |   |-- projects.ts           # deployProject, assignTeam, proposeScope, getAllTasks, ...
|   |   |   |   |-- milestones.ts         # getMilestones, createMilestone, updateMilestone, delete
|   |   |   |   `-- calendar.ts           # registerWorker, setAvailability, getAvailableWorkers, ...
|   |   |   |-- virto/                     # 17 funciones - Virto API (WebAuthn + pagos)
|   |   |   |   |-- index.ts              # Barrel export + namespace exports
|   |   |   |   |-- client.ts             # Axios client configurado para Virto
|   |   |   |   |-- types.ts              # Tipos de request/response de Virto
|   |   |   |   |-- auth.ts               # checkUserRegistered, getAttestationOptions, customConnect, ...
|   |   |   |   |-- payments.ts           # createPayment, releasePayment, acceptAndPay, getPayment
|   |   |   |   `-- memberships.ts        # getMembers, checkMembership, addCommunityMember, ...
|   |   |   `-- contracts/                 # 10 funciones - Smart Contracts API
|   |   |       `-- index.ts              # healthCheck, deployProjectV5/V6, queryMethod, callMethod, ...
|   |   |
|   |   |-- services/                      # Capa de logica de negocio (port de SEDA)
|   |   |   |-- index.ts                  # Barrel export (58 funciones)
|   |   |   |-- projectService.ts         # Agregacion de proyectos + optimizacion N+1
|   |   |   |-- proposalService.ts        # Crear y actualizar propuestas
|   |   |   |-- clientService.ts          # CRUD de clientes + connect + busqueda
|   |   |   |-- developerService.ts       # CRUD de developers + resolucion de equipos
|   |   |   |-- milestoneService.ts       # CRUD de hitos + envio/aceptacion/rechazo
|   |   |   |-- scopeService.ts           # Enviar, aceptar, rechazar alcance
|   |   |   `-- calendarService.ts        # Registro de workers + disponibilidad
|   |   |
|   |   |-- components/
|   |   |   |-- ui/                        # Componentes base reutilizables
|   |   |   |   |-- Button.tsx             # Boton con variantes
|   |   |   |   |-- Card.tsx               # Tarjeta contenedora
|   |   |   |   |-- Input.tsx              # Campo de entrada
|   |   |   |   |-- Label.tsx              # Etiqueta de formulario
|   |   |   |   |-- Spinner.tsx            # Indicador de carga
|   |   |   |   `-- index.ts              # Barrel export (re-exporta todo)
|   |   |   |-- shared/                    # Componentes compartidos entre paginas
|   |   |   |   |-- ProtectedRoute.tsx     # Ruta que requiere autenticacion
|   |   |   |   |-- ErrorBoundary.tsx      # Captura errores de React
|   |   |   |   |-- LoadingScreen.tsx      # Pantalla de carga completa
|   |   |   |   |-- EmptyState.tsx         # Estado vacio (sin datos)
|   |   |   |   `-- ProjectStateBadge.tsx  # Badge del estado del proyecto
|   |   |   |-- features/                  # Componentes especificos por funcionalidad
|   |   |   |   |-- projects/
|   |   |   |   |   |-- ProjectActions.tsx         # Botones de accion del proyecto
|   |   |   |   |   |-- ScopeBuilder.tsx           # Constructor de alcance
|   |   |   |   |   `-- MilestoneStatusBadge.tsx   # Badge de estado de hito
|   |   |   |   `-- milestones/
|   |   |   |       |-- MilestoneCard.tsx          # Tarjeta de hito
|   |   |   |       |-- MilestoneList.tsx          # Lista de hitos
|   |   |   |       `-- MilestoneActions.tsx       # Acciones de hito
|   |   |   `-- layouts/                   # Estructuras de pagina
|   |   |       |-- AppLayout.tsx          # Layout principal (sidebar + header + contenido)
|   |   |       |-- AuthLayout.tsx         # Layout de autenticacion
|   |   |       |-- Header.tsx             # Barra superior
|   |   |       `-- Sidebar.tsx            # Menu lateral
|   |   |
|   |   |-- pages/                         # Paginas completas (una por ruta)
|   |   |   |-- auth/
|   |   |   |   |-- LoginPage.tsx                  # Pagina de login
|   |   |   |   |-- RegisterPage.tsx               # Seleccion de rol
|   |   |   |   |-- ClientLoginPage.tsx            # Login de cliente
|   |   |   |   |-- DeveloperLoginPage.tsx         # Login de developer
|   |   |   |   |-- ClientRegisterPage.tsx         # Registro de cliente
|   |   |   |   `-- DeveloperRegisterPage.tsx      # Registro de developer
|   |   |   |-- dashboard/
|   |   |   |   `-- DashboardPage.tsx              # Panel principal
|   |   |   |-- projects/
|   |   |   |   |-- ProjectsPage.tsx               # Lista de proyectos
|   |   |   |   |-- ProjectDetailPage.tsx          # Detalle de un proyecto
|   |   |   |   `-- CreateProjectPage.tsx          # Crear propuesta
|   |   |   |-- payments/
|   |   |   |   |-- PaymentsPage.tsx               # Lista de pagos
|   |   |   |   `-- PaymentDetailPage.tsx          # Detalle de un pago
|   |   |   `-- profiles/
|   |   |       |-- ProfilePage.tsx                # Perfil general
|   |   |       |-- ClientProfilePage.tsx          # Perfil de cliente
|   |   |       `-- DeveloperProfilePage.tsx       # Perfil de developer
|   |   |
|   |   |-- hooks/                         # Custom hooks (logica reutilizable)
|   |   |   |-- useAuth.ts                # Hook de autenticacion (llama a servicios)
|   |   |   |-- useProjects.ts            # Hook de proyectos (React Query + servicios)
|   |   |   |-- useMilestones.ts          # Hook de hitos
|   |   |   |-- usePayments.ts            # Hook de pagos
|   |   |   |-- useVotes.ts               # Hook de votaciones
|   |   |   |-- useProfile.ts            # Hook de perfil
|   |   |   |-- useScope.ts               # Hook de alcance
|   |   |   `-- useEnums.ts               # Hook de enums (constantes estaticas)
|   |   |
|   |   |-- stores/
|   |   |   `-- authStore.ts              # Estado global de autenticacion (Zustand + localStorage)
|   |   |
|   |   |-- lib/                           # Utilidades y logica pura
|   |   |   |-- permissions.ts            # Funciones puras de permisos (port de permission.js)
|   |   |   |-- flowStates.ts             # Maquina de estados (TypeScript)
|   |   |   |-- cn.ts                     # Utilidad para combinar clases CSS (clsx + tailwind-merge)
|   |   |   |-- paymentUtils.ts           # Utilidades de pagos
|   |   |   `-- virto-sdk.ts              # Integracion con Virto Network SDK
|   |   |
|   |   |-- types/                         # Definiciones de tipos TypeScript
|   |   |   |-- index.ts                  # Barrel export de todos los tipos
|   |   |   |-- user.ts                   # Tipos de usuario y autenticacion
|   |   |   |-- project.ts               # Tipos de proyecto y hito
|   |   |   |-- client.ts                # Tipos de cliente
|   |   |   |-- developer.ts             # Tipos de developer
|   |   |   |-- payment.ts               # Tipos de pago y votacion
|   |   |   |-- enums.ts                 # Constantes estaticas (presupuestos, skills, roles, etc.)
|   |   |   `-- api.ts                   # Tipos de respuesta/error de API
|   |   |
|   |   `-- constants/
|   |       `-- languages.ts              # 154 codigos ISO 639-3 de idiomas
|   |
|   |-- vite.config.ts                    # Configuracion de Vite (aliases, build, server)
|   |-- tsconfig.json                     # Configuracion de TypeScript
|   |-- tailwind.config.js                # Configuracion de Tailwind CSS
|   `-- package.json                      # Dependencias del frontend
|
|-- backend/                               # :warning: LEGACY - Solo como referencia
|   |                                      # NO es necesario para ejecutar la aplicacion.
|   |                                      # Se conserva como referencia durante la migracion.
|   |-- app.js                            # Configuracion de Express (legacy)
|   |-- models/
|   |   |-- adapter.js                    # Cliente HTTP original (~1243 lineas, portado a api/)
|   |   |-- flowStates.js                # Maquina de estados original (portada a lib/)
|   |   `-- seda/                         # Logica de negocio original (portada a services/)
|   |-- controllers/                      # Controladores Express (logica portada a hooks/services)
|   |-- routes/                           # Rutas Express (ya no se usan)
|   `-- views/                            # 90+ plantillas EJS (sistema antiguo)
|
|-- .context/                              # Documentacion tecnica del proyecto
|   |-- PROJECT_ANALYSIS.md               # Analisis completo del proyecto
|   |-- CODE_REVIEW_RESULTS.md            # Resultados de revision de codigo
|   |-- FRONTEND_ARCHITECTURE.md          # Arquitectura del frontend React
|   |-- MIGRATION_PLAN.md                 # Plan de migracion detallado
|   `-- IMPLEMENTATION_BLUEPRINT.md       # Blueprint de implementacion con codigo
|
|-- .gitignore                             # Archivos excluidos de git
`-- README.md                              # Este archivo
```

</details>

---

## :gear: Prerrequisitos

Antes de empezar, asegurate de tener instalado lo siguiente en tu computadora:

| Herramienta | Version minima | Como verificar | Como instalar |
|-------------|---------------|----------------|---------------|
| **Node.js** | >= 18.0 | `node --version` | [nodejs.org](https://nodejs.org/) |
| **npm** | >= 9.0 | `npm --version` | Viene con Node.js |
| **Git** | >= 2.0 | `git --version` | [git-scm.com](https://git-scm.com/) |

> **Nota para juniors**: Node.js es el entorno que ejecuta JavaScript fuera del navegador. npm es su gestor de paquetes (como una tienda de librerias que puedes instalar con un comando). No necesitas instalar nada mas: no hay base de datos, no hay servidor backend. Solo necesitas Node.js para ejecutar Vite (la herramienta de desarrollo del frontend).

---

## :rocket: Comenzar a Trabajar

### 1. Clonar el repositorio

```bash
# Clona el proyecto en tu computadora
git clone <URL_DEL_REPOSITORIO>

# Entra en la carpeta del proyecto
cd website/website

# Cambia a la rama de trabajo activa
git checkout feature/web-refactor
```

### 2. Instalar dependencias del frontend

```bash
# Entra en la carpeta del frontend
cd frontend

# Instala todas las librerias necesarias
npm install
```

### 3. Iniciar la aplicacion

```bash
# Dentro de frontend/
npm run dev
```

Deberia mostrar algo como:
```
  VITE v6.0.3  ready in 300 ms

  > Local:   http://localhost:5173/
```

### 4. Abrir la aplicacion

Abre tu navegador y ve a **http://localhost:5173**. La aplicacion React se comunicara directamente con las APIs externas en `dev.abako.xyz` gracias a CORS. No necesitas ningun servidor backend.

> **Eso es todo.** Un solo comando (`npm run dev`) y ya tienes la aplicacion corriendo. No hay que configurar variables de entorno, no hay que levantar un backend, no hay que instalar bases de datos.

### Resumen rapido

```bash
git clone <URL_DEL_REPOSITORIO>
cd website/website/frontend
npm install
npm run dev
# Abrir http://localhost:5173
```

### Configuracion avanzada (opcional)

Si necesitas apuntar a un servidor diferente (por ejemplo, un entorno de staging o produccion), puedes crear un archivo `.env` en la carpeta `frontend/`:

```bash
# frontend/.env (opcional - por defecto usa dev.abako.xyz)
VITE_API_BASE_URL=https://staging.abako.xyz
```

La configuracion de la URL base esta en `frontend/src/api/config.ts`. Si no creas el archivo `.env`, la app usara `https://dev.abako.xyz` automaticamente.

---

## :scroll: Scripts Disponibles

### Frontend (`frontend/package.json`)

| Script | Comando | Que hace |
|--------|---------|----------|
| `dev` | `npm run dev` | Inicia el servidor de desarrollo Vite con recarga en caliente (HMR) en `http://localhost:5173` |
| `build` | `npm run build` | Compila TypeScript y genera la version de produccion en `dist/` |
| `preview` | `npm run preview` | Sirve la version de produccion localmente para verificar antes de desplegar |
| `lint` | `npm run lint` | Ejecuta ESLint con cero warnings permitidos |
| `type-check` | `npm run type-check` | Verifica tipos TypeScript sin generar archivos (solo comprueba errores) |

> **Nota para juniors**: El comando mas importante es `npm run dev`. Es el que usaras el 99% del tiempo. Los otros son para verificar calidad (`lint`, `type-check`) o preparar el despliegue (`build`, `preview`).

---

## :chart_with_upwards_trend: Estado de la Migracion

El proyecto esta migrando de **EJS** (plantillas HTML renderizadas en el servidor con un backend Express) a **React SPA** (aplicacion moderna que habla directamente con APIs externas). La migracion se divide en fases:

```
Fase 0: Correcciones previas              [##########] 100%  COMPLETADA
  - Bugs en flowStates.js corregidos
  - Bugs en adapter.js corregidos
  - CORS configurado en las APIs externas
  - Session secret movido a variable de entorno
  - Ruta /backdoor/wild eliminada
  - QA pasado: 71/71 tests

Fase 1: Infraestructura + API + Servicios [##########] 100%  COMPLETADA
  - [x] Scaffold React + Vite + TypeScript
  - [x] Tailwind CSS configurado
  - [x] Capa de API completa (52 adapter + 17 virto + 10 contracts)
  - [x] Configuracion centralizada en api/config.ts
  - [x] React Router configurado
  - [x] Zustand auth store con persistencia localStorage
  - [x] Capa de servicios completa (58 funciones, port de SEDA)
  - [x] Optimizacion N+1 con Promise.allSettled en projectService.ts
  - [x] Hooks de React Query conectados a servicios

Fase 2: Logica compartida                 [##########] 100%  COMPLETADA
  - [x] Tipos TypeScript completos (7 archivos en types/)
  - [x] Maquina de estados en TypeScript (lib/flowStates.ts)
  - [x] Constantes estaticas en types/enums.ts (sin llamada a backend)
  - [x] Mapa de idiomas en constants/languages.ts (154 codigos)

Fase 3: Auth + App Shell                  [########--]  80%  CASI COMPLETA
  - [x] Layout principal (AppLayout, Sidebar, Header)
  - [x] Layout de autenticacion (AuthLayout)
  - [x] 6 paginas de auth (login/registro para cliente y developer)
  - [x] Rutas protegidas con ProtectedRoute
  - [x] Error boundaries
  - [x] Permisos portados a funciones puras (lib/permissions.ts)
  - [ ] Pulir flujo de WebAuthn completo (integracion con Virto SDK)
  - [ ] Tests de autenticacion

Fase 4: Paginas Core + Alcance            [----------]   0%  PENDIENTE
  ** FASE ATOMICA - no se puede dividir **
  - Dashboard, proyectos, hitos y alcance
  - Deben completarse todos juntos

Fase 5: Pagos + Perfiles + Corte final   [----------]   0%  PENDIENTE
  - Paginas de perfiles completamente funcionales
  - Paginas de pagos con integracion escrow
  - Eliminacion del sistema EJS
  - Despliegue en produccion
```

> **Que significa "ATOMICA"**: La Fase 4 no se puede hacer parcialmente. El flujo de trabajo de alcance (crear hitos, editar, enviar para aprobacion) requiere que todas las paginas y componentes esten conectados. Si completamos la mitad, la aplicacion queda en un estado inconsistente donde el usuario no puede terminar un flujo que empezo.

---

## :clipboard: TODOs para Desarrolladores Junior

Esta seccion contiene tareas concretas ordenadas por dificultad. Cada tarea incluye:
- **Que hay que hacer** y **por que importa**
- **Archivos a consultar** para entender el contexto
- **Criterios de aceptacion** (como saber que terminaste bien)

---

### :hatching_chick: Nivel Becario (primeras contribuciones)

Estas tareas estan pensadas para tu primera semana en el proyecto. Son muy concretas, no requieren entender la arquitectura completa, y te ayudaran a familiarizarte con el codigo mientras haces contribuciones reales. Si algo no queda claro, pregunta sin miedo.

---

#### TODO B1: Completar el archivo `.env.example` del frontend

- [ ] Completado

**Que hacer**: El archivo `frontend/.env.example` ya existe pero solo documenta `VITE_API_BASE_URL`. Sin embargo, en `frontend/.env.local` se usa tambien `VITE_BACKEND_URL`. Tu tarea es revisar todo el codigo fuente del frontend, encontrar **todas** las variables de entorno que se usen (busca `import.meta.env.VITE_`), y documentarlas todas en `.env.example` con comentarios claros en espanol.

**Por que importa**: Cuando un nuevo desarrollador clona el proyecto, lo primero que necesita es saber que variables de entorno configurar. Si `.env.example` esta incompleto, el desarrollador pierde tiempo averiguando por que algo no funciona. Un buen `.env.example` ahorra horas de frustracion.

**Archivos a consultar**:
- `frontend/.env.example` (archivo actual, incompleto)
- `frontend/.env.local` (tiene variables adicionales)
- `frontend/src/api/config.ts` (aqui se lee `VITE_API_BASE_URL`)
- Busca en todo `frontend/src/` con: `grep -r "import.meta.env" frontend/src/`

**Criterios de aceptacion**:
1. `frontend/.env.example` contiene TODAS las variables `VITE_*` usadas en el proyecto
2. Cada variable tiene un comentario explicativo en espanol
3. Los valores por defecto apuntan al entorno de desarrollo (`dev.abako.xyz`)
4. Hay instrucciones claras al inicio del archivo sobre como usarlo

**Ejemplo de como debe quedar**:

```bash
# ============================================================
# Variables de entorno para el frontend de Work3Spaces
# ============================================================
# Copia este archivo como .env y ajusta los valores:
#   cp .env.example .env
#
# Para desarrollo local normalmente no necesitas cambiar nada.
# ============================================================

# URL base para todas las APIs externas (Adapter, Virto, Contracts).
# Las 3 APIs viven bajo este dominio.
# En desarrollo: https://dev.abako.xyz
# En produccion: https://abako.xyz (cuando exista)
VITE_API_BASE_URL=https://dev.abako.xyz

# URL del backend Express (solo necesario si usas el backend como proxy).
# Dejalo vacio si el frontend se conecta directamente a las APIs.
VITE_BACKEND_URL=https://dev.abako.xyz
```

---

#### TODO B2: Traducir los mensajes de error del hook de autenticacion al espanol

- [ ] Completado

**Que hacer**: El hook `frontend/src/hooks/useAuth.ts` tiene mensajes de error en ingles como `'No user in store'`, `'Client not found'`, `'Developer not found'` y `'User has no role'`. Tambien hay mensajes en ingles en `frontend/src/hooks/useProjects.ts` (`'User not authenticated'`, `'Authentication token not found'`, etc.) y en `frontend/src/hooks/usePayments.ts`. Tu tarea es traducirlos todos al espanol.

**Por que importa**: La aplicacion esta pensada para usuarios hispanohablantes. Cuando un error llega al usuario (por ejemplo en un toast o mensaje de error), debe estar en espanol para que lo entienda. Ademas, mantener coherencia de idioma en el codigo fuente ayuda a todos los desarrolladores del equipo.

**Archivos a consultar**:
- `frontend/src/hooks/useAuth.ts` (4 mensajes en ingles)
- `frontend/src/hooks/useProjects.ts` (5+ mensajes en ingles)
- `frontend/src/hooks/usePayments.ts` (1 mensaje en ingles)
- `frontend/src/hooks/useVotes.ts` (1 mensaje en ingles)
- `frontend/src/hooks/useProfile.ts` (2 mensajes en ingles)
- `frontend/src/lib/virto-sdk.ts` (multiples mensajes en ingles)

**Criterios de aceptacion**:
1. Ejecutar `grep -rn "throw new Error(" frontend/src/hooks/` no muestra ningun mensaje en ingles
2. Todos los mensajes de error estan en espanol claro y descriptivo
3. Los mensajes de `console.error` (logs internos) pueden quedarse en ingles, solo se traducen los `throw new Error()`
4. La aplicacion sigue funcionando igual (no se rompe ningun test ni flujo)

**Ejemplo del cambio**:

```typescript
// ANTES (ingles):
if (!user?.email) throw new Error('No user in store');
if (!client) throw new Error('Client not found');
throw new Error('User has no role');

// DESPUES (espanol):
if (!user?.email) throw new Error('No hay usuario en el almacenamiento local');
if (!client) throw new Error('No se encontro el cliente');
throw new Error('El usuario no tiene un rol asignado');
```

> **Nota**: Los servicios (`frontend/src/services/clientService.ts` y `developerService.ts`) ya tienen sus mensajes en espanol. Usa ese mismo estilo como referencia.

---

#### TODO B3: Agregar tooltips informativos a los badges de estado del proyecto

- [ ] Completado

**Que hacer**: El componente `ProjectStateBadge` muestra una etiqueta de color para cada estado del proyecto (por ejemplo "Proposal Pending" en amarillo). Actualmente no explica que significa cada estado. Tu tarea es agregar un atributo `title` al `<span>` del badge para que cuando el usuario pase el raton por encima, vea una descripcion en espanol de lo que significa ese estado.

**Por que importa**: Los usuarios nuevos no saben que significa "Scope Validation Needed" o "Awaiting Team Assignment". Un tooltip con una explicacion breve les ahorra tener que leer la documentacion. Es un cambio pequeno que mejora mucho la experiencia de usuario.

**Archivos a consultar**:
- `frontend/src/components/shared/ProjectStateBadge.tsx` (el componente a modificar)
- `frontend/src/lib/flowStates.ts` (definiciones de cada estado con comentarios en ingles que explican su significado)

**Criterios de aceptacion**:
1. Cada estado del proyecto tiene un `title` con descripcion en espanol
2. El `title` se muestra como tooltip nativo del navegador al pasar el raton
3. Las descripciones son breves (1 linea) y claras para un usuario no tecnico
4. El componente sigue renderizando exactamente igual visualmente (solo se anade el tooltip)

**Ejemplo del cambio**:

```typescript
// 1. Crear un nuevo Record con las descripciones:
const STATE_TOOLTIPS: Record<ProjectStateValue, string> = {
  [ProjectState.CreationError]: 'Ocurrio un error al crear la propuesta del cliente',
  [ProjectState.ProposalPending]: 'La propuesta fue enviada y esta esperando que la DAO asigne un consultor',
  [ProjectState.WaitingForProposalApproval]: 'Un consultor fue asignado y debe aceptar o rechazar la propuesta',
  [ProjectState.ProposalRejected]: 'El consultor rechazo la propuesta del cliente',
  [ProjectState.ScopingInProgress]: 'El consultor esta definiendo el alcance y los hitos del proyecto',
  [ProjectState.ScopeValidationNeeded]: 'El alcance fue enviado y espera la validacion del cliente',
  [ProjectState.ScopeRejected]: 'El cliente rechazo el alcance propuesto',
  [ProjectState.WaitingForTeamAssigment]: 'El alcance fue aprobado, falta asignar al equipo de desarrollo',
  [ProjectState.ProjectInProgress]: 'El equipo esta trabajando en los hitos del proyecto',
  [ProjectState.PaymentReleased]: 'El pago fue liberado al equipo',
  [ProjectState.Completed]: 'El proyecto fue completado, evaluado y pagado',
  [ProjectState.Invalid]: 'Estado no reconocido',
};

// 2. Usar el tooltip en el JSX:
<span
  className={cn('inline-flex items-center ...', colors, className)}
  title={STATE_TOOLTIPS[state]}  // <-- Esta linea es nueva
>
  {label}
</span>
```

---

#### TODO B4: Crear constantes para los mensajes de exito en los hooks de mutacion

- [ ] Completado

**Que hacer**: Actualmente, los hooks de React Query tienen mensajes de exito escritos directamente en el codigo (hardcoded) y en ingles, como `'Scope accepted successfully'` o `'Milestone submitted successfully'`. Tu tarea es:
1. Crear un nuevo archivo `frontend/src/constants/messages.ts`
2. Definir ahi todas las constantes de mensajes (en espanol)
3. Importar y usar esas constantes en los hooks que las necesitan

**Por que importa**: Los strings hardcoded son dificiles de mantener. Si manana queremos cambiar un mensaje, tendriamos que buscar en 10 archivos diferentes. Con un archivo centralizado, cambiamos una sola linea y se actualiza en todos lados. Ademas, esto prepara el terreno para una futura internacionalizacion (i18n).

**Archivos a consultar**:
- `frontend/src/hooks/useScope.ts` (3 mensajes: submitted, accepted, rejected)
- `frontend/src/hooks/useMilestones.ts` (3 mensajes: submitted, accepted, rejected)
- `frontend/src/hooks/useVotes.ts` (1 mensaje: submitted)
- `frontend/src/hooks/usePayments.ts` (1 mensaje: released)
- `frontend/src/hooks/useProjects.ts` (1 mensaje: proposal rejected)
- `frontend/src/hooks/useProfile.ts` (1 mensaje: image uploaded)
- `frontend/src/constants/languages.ts` (ya existe un archivo de constantes, usalo como referencia de estilo)

**Criterios de aceptacion**:
1. Existe `frontend/src/constants/messages.ts` con todas las constantes
2. Los mensajes estan en espanol
3. Los hooks importan las constantes en vez de usar strings hardcoded
4. `grep -rn "successfully" frontend/src/hooks/` no devuelve resultados
5. La aplicacion funciona exactamente igual

**Ejemplo del archivo a crear**:

```typescript
// frontend/src/constants/messages.ts

/**
 * Mensajes de exito y error centralizados.
 * Todos los mensajes visibles al usuario deben estar en espanol.
 */

// --- Alcance (Scope) ---
export const SCOPE_SUBMITTED = 'Alcance enviado para validacion';
export const SCOPE_ACCEPTED = 'Alcance aceptado correctamente';
export const SCOPE_REJECTED = 'Alcance rechazado';

// --- Hitos (Milestones) ---
export const MILESTONE_SUBMITTED = 'Hito enviado para revision';
export const MILESTONE_ACCEPTED = 'Hito aceptado correctamente';
export const MILESTONE_REJECTED = 'Hito rechazado';

// --- Votaciones ---
export const VOTES_SUBMITTED = 'Votaciones enviadas correctamente';

// --- Pagos ---
export const PAYMENT_RELEASED = 'Pago liberado correctamente';

// --- Propuestas ---
export const PROPOSAL_REJECTED = 'Propuesta rechazada';

// --- Perfil ---
export const PROFILE_IMAGE_UPLOADED = 'Imagen de perfil subida correctamente';
```

**Ejemplo de como se usa en un hook**:

```typescript
// frontend/src/hooks/useScope.ts (ANTES)
return { projectId, message: 'Scope submitted successfully' };

// frontend/src/hooks/useScope.ts (DESPUES)
import { SCOPE_SUBMITTED } from '@/constants/messages';
// ...
return { projectId, message: SCOPE_SUBMITTED };
```

---

#### TODO B5: Agregar meta tags descriptivos al archivo index.html del frontend

- [ ] Completado

**Que hacer**: El archivo `frontend/index.html` tiene lo minimo: un `<title>`, un favicon y el viewport. Tu tarea es agregar meta tags para SEO y redes sociales (Open Graph), cambiar el `lang` de `"en"` a `"es"`, y mejorar el titulo.

**Por que importa**: Cuando alguien comparte un enlace de Work3Spaces en Slack, Twitter o WhatsApp, se muestra una preview con el titulo y la descripcion. Sin meta tags, la preview sale vacia o fea. Ademas, el atributo `lang="en"` esta incorrecto porque la app es en espanol, y los lectores de pantalla (accesibilidad) usan este atributo.

**Archivos a consultar**:
- `frontend/index.html` (el archivo a modificar)
- `frontend/src/main.tsx` (para verificar que no haya configuracion de titulo ahi)

**Criterios de aceptacion**:
1. `<html lang="es">` en vez de `<html lang="en">`
2. `<title>` dice "Work3Spaces - Marketplace Descentralizado para Freelancers"
3. Hay meta tag `description` con una descripcion breve del proyecto
4. Hay meta tags Open Graph (`og:title`, `og:description`, `og:type`)
5. El favicon sigue funcionando

**Ejemplo del cambio**:

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- SEO -->
    <title>Work3Spaces - Marketplace Descentralizado para Freelancers</title>
    <meta name="description" content="Plataforma descentralizada para conectar freelancers con clientes, construida sobre Polkadot y Virto Network. Gestiona proyectos, hitos y pagos con transparencia blockchain." />

    <!-- Open Graph (previews en redes sociales) -->
    <meta property="og:title" content="Work3Spaces - Marketplace Descentralizado" />
    <meta property="og:description" content="Conecta con freelancers y gestiona proyectos de forma transparente con tecnologia blockchain." />
    <meta property="og:type" content="website" />

    <!-- Iconos y fuentes -->
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

#### TODO B6: Documentar las funciones exportadas en services/index.ts con JSDoc

- [ ] Completado

**Que hacer**: El archivo `frontend/src/services/index.ts` re-exporta todas las funciones del servicio, pero no tiene documentacion sobre que hace cada funcion. Tu tarea es agregar comentarios JSDoc breves agrupados por categoria, de modo que cualquier desarrollador pueda entender que hace cada funcion sin tener que abrir el archivo fuente.

**Por que importa**: Este archivo es el "indice" de todo lo que el frontend puede hacer con las APIs. Un nuevo desarrollador llega y ve 40+ funciones exportadas sin explicacion. Con comentarios claros agrupados por seccion, puede encontrar rapidamente lo que necesita. Ademas, los editores de codigo (como VS Code) muestran los comentarios JSDoc al hacer hover, lo que acelera el desarrollo.

**Archivos a consultar**:
- `frontend/src/services/index.ts` (el archivo a modificar)
- `frontend/src/services/projectService.ts` (para entender que hace cada funcion de proyecto)
- `frontend/src/services/clientService.ts` (funciones de cliente)
- `frontend/src/services/developerService.ts` (funciones de developer)
- `frontend/src/services/milestoneService.ts` (funciones de hitos)
- `frontend/src/services/scopeService.ts` (funciones de alcance)
- `frontend/src/services/calendarService.ts` (funciones de calendario)

**Criterios de aceptacion**:
1. Cada grupo de exports tiene un comentario de seccion descriptivo en espanol
2. Cada funcion exportada tiene un comentario JSDoc de una linea que explica que hace
3. Los comentarios son concisos (maximo 1-2 lineas por funcion)
4. El archivo sigue compilando sin errores (`npm run build` pasa)

**Ejemplo del cambio**:

```typescript
// frontend/src/services/index.ts

/**
 * Barrel Export de Servicios
 *
 * Punto de entrada unico para todas las funciones del servicio.
 * Los servicios encapsulan la logica de negocio sobre las llamadas API crudas.
 *
 * Uso:
 *   import { getProject, createProposal, clientConnect } from '@/services';
 */

// ===================================================================
// Proyecto - Consultas, actualizaciones y acciones sobre proyectos
// ===================================================================

export {
  /** Obtiene los datos completos de un proyecto por su ID. */
  getProject,
  /** Obtiene la lista de proyectos (filtrable por cliente o developer). */
  getProjectsIndex,
  /** Obtiene el ID del cliente asociado a un proyecto. */
  getProjectClientId,
  /** Obtiene el ID del consultor asignado a un proyecto. */
  getProjectConsultantId,
  // ... etc
} from './projectService';
```

> **Consejo**: Abre cada archivo de servicio, lee la funcion, y escribe una linea que resuma lo que hace. No necesitas entender todos los detalles, solo el proposito general.

---

### :green_circle: Nivel Facil (buenas primeras tareas)

Estas tareas son ideales para familiarizarte con el proyecto. No requieren conocimiento profundo de la arquitectura.

---

#### TODO 1: Agregar spinners de carga a todas las paginas del frontend

**Que hacer**: Revisar las paginas del frontend (`frontend/src/pages/`) y asegurarse de que todas muestren un spinner (indicador de carga) mientras esperan datos de las APIs externas, y un mensaje de error cuando falla la peticion.

**Por que importa**: Sin un indicador de carga, el usuario ve una pagina en blanco y piensa que la aplicacion esta rota. Un spinner le indica "estoy cargando, espera un momento". Del mismo modo, un mensaje de error claro le dice que algo salio mal y puede reintentar.

**Archivos a consultar**:
- `frontend/src/components/ui/Spinner.tsx` (componente Spinner ya existente)
- `frontend/src/components/shared/LoadingScreen.tsx` (pantalla de carga completa)
- `frontend/src/pages/dashboard/DashboardPage.tsx` (pagina para revisar)
- `frontend/src/pages/projects/ProjectsPage.tsx` (pagina para revisar)
- `frontend/src/pages/payments/PaymentsPage.tsx` (pagina para revisar)

**Criterios de aceptacion**:
- [ ] Cada pagina que usa `useQuery` muestra un `<Spinner />` o `<LoadingScreen />` durante `isLoading`
- [ ] El spinner esta centrado vertical y horizontalmente en la pantalla
- [ ] Se usa el componente `Spinner` existente (no crear uno nuevo)
- [ ] Existe un mensaje de error visible cuando `isError` es true
- [ ] `npm run type-check` pasa sin errores

**Patron a seguir**:
```tsx
import { Spinner } from '@/components/ui';
import { useProjects } from '@/hooks/useProjects';

function MiPagina() {
  const { data, isLoading, isError, error } = useProjects();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  return <div>{/* contenido normal */}</div>;
}
```

---

#### TODO 2: Escribir tests unitarios para la maquina de estados `flowStates`

**Que hacer**: Crear un archivo de tests para `frontend/src/lib/flowStates.ts` que verifique que cada transicion de estado funciona correctamente.

**Que es un test unitario**: Es un fragmento de codigo que verifica automaticamente que una funcion se comporta como se espera. Por ejemplo: "si el proyecto esta en estado ProposalPending y se aprueba, debe pasar a ScopingInProgress".

**Por que importa**: La maquina de estados es el corazon de la logica de negocio. Si un estado se calcula mal, el usuario ve botones incorrectos o no puede avanzar en el flujo. Los tests previenen regresiones (que algo que funcionaba deje de funcionar).

**Archivos a consultar**:
- `frontend/src/lib/flowStates.ts` (la maquina de estados a testear)
- `backend/models/flowStates.js` (version original en JavaScript, para comparar)
- `.context/PROJECT_ANALYSIS.md` (seccion 5: State Machines, describe todos los flujos)

**Criterios de aceptacion**:
- [ ] Existe un archivo `frontend/src/lib/__tests__/flowStates.test.ts` (o similar)
- [ ] Se prueban todas las transiciones de ProjectState (al menos 8 transiciones)
- [ ] Se prueban todas las transiciones de MilestoneState (al menos 5 transiciones)
- [ ] Se prueban casos limite: estado invalido, transicion no permitida
- [ ] Todos los tests pasan con `npm test` (puede necesitar configurar Vitest primero)

> **Nota**: Si Vitest no esta configurado aun, este TODO incluye instalarlo y configurarlo. Puedes seguir la guia de [Vitest](https://vitest.dev/guide/).

---

#### TODO 3: Agregar tests unitarios para las funciones de permisos

**Que hacer**: Crear tests para `frontend/src/lib/permissions.ts` que verifiquen que cada funcion de permisos retorna el valor correcto segun el usuario y el contexto.

**Que es `permissions.ts`**: Son funciones puras que determinan si un usuario puede realizar una accion. Por ejemplo: "solo el cliente que propuso el proyecto puede aprobar el alcance" o "solo el consultor asignado puede crear hitos".

**Por que importa**: Los permisos definen la seguridad de la aplicacion. Si `isProjectClient` devuelve `true` para un usuario que no es el cliente, ese usuario podria aprobar un alcance que no le corresponde. Los tests garantizan que esto no pase.

**Archivos a consultar**:
- `frontend/src/lib/permissions.ts` (7 funciones + 1 funcion compuesta)
- `frontend/src/types/user.ts` (tipo `User` que reciben las funciones)
- `backend/controllers/permission.js` (version original para comparar)

**Criterios de aceptacion**:
- [ ] Existe un archivo `frontend/src/lib/__tests__/permissions.test.ts`
- [ ] Se prueban las 7 funciones: `isClient`, `isDeveloper`, `isClientSelf`, `isDeveloperSelf`, `isProjectClient`, `isProjectConsultant`, `isMilestoneDeveloper`
- [ ] Se prueba la funcion compuesta `checkPermission` con multiples combinaciones
- [ ] Se prueban casos con `user = null` (no autenticado)
- [ ] Todos los tests pasan

**Ejemplo de test**:
```typescript
import { describe, it, expect } from 'vitest';
import { isClient, isDeveloper, checkPermission } from '../permissions';
import type { User } from '@/types';

const clientUser: User = { clientId: 'client-1', name: 'Ana' } as User;
const devUser: User = { developerId: 'dev-1', name: 'Carlos' } as User;

describe('isClient', () => {
  it('devuelve true para un usuario con clientId', () => {
    expect(isClient(clientUser)).toBe(true);
  });
  it('devuelve false para un developer', () => {
    expect(isClient(devUser)).toBe(false);
  });
  it('devuelve false para null', () => {
    expect(isClient(null)).toBe(false);
  });
});
```

---

#### TODO 4: Mejorar el componente ErrorBoundary

**Que hacer**: Mejorar el `ErrorBoundary.tsx` existente para que muestre un mensaje amigable, un boton de "Reintentar" y registre el error en la consola. Asegurarse de que envuelve correctamente las secciones clave de la aplicacion.

**Que es un Error Boundary**: Es un componente de React que "atrapa" errores en sus hijos. Sin el, un error en un componente rompe TODA la pagina. Con el, solo la seccion afectada muestra un mensaje de error y el resto de la app sigue funcionando.

**Por que importa**: En produccion, un error no capturado muestra una pantalla en blanco. Un Error Boundary muestra un mensaje amigable y puede ofrecer un boton de "reintentar".

**Archivos a consultar**:
- `frontend/src/components/shared/ErrorBoundary.tsx` (implementacion existente)
- `frontend/src/App.tsx` (donde se deben colocar los boundaries)
- `frontend/src/components/layouts/AppLayout.tsx` (otro punto clave)

**Criterios de aceptacion**:
- [ ] El `ErrorBoundary` muestra un mensaje de error amigable (no tecnico)
- [ ] Incluye un boton "Reintentar" que limpia el error y re-renderiza
- [ ] Se envuelven al menos: el contenido principal del layout, cada pagina individualmente
- [ ] El error se registra con `console.error` para depuracion
- [ ] Funciona con errores asincronos (combinado con React Query `ErrorBoundary`)

---

### :yellow_circle: Nivel Intermedio

Estas tareas requieren comprender mas sobre la arquitectura del proyecto y escribir codigo mas complejo.

---

#### TODO 5: Agregar validacion de formularios con esquemas Zod

**Que hacer**: Crear esquemas de validacion Zod para los formularios del frontend y conectarlos con React Hook Form usando `@hookform/resolvers`.

**Que es Zod**: Una libreria de validacion que te permite definir "la forma" que deben tener tus datos. Por ejemplo: "el nombre es una cadena de al menos 2 caracteres y el email debe tener formato de correo".

**Por que importa**: Sin validacion, un usuario puede enviar un formulario vacio o con datos incorrectos, causando errores en las APIs externas. La validacion en el frontend da feedback inmediato antes de enviar.

**Archivos a consultar**:
- `frontend/package.json` (Zod y `@hookform/resolvers` ya estan instalados)
- `frontend/src/pages/projects/CreateProjectPage.tsx` (formulario de crear proyecto)
- `frontend/src/pages/auth/ClientRegisterPage.tsx` (formulario de registro)
- `frontend/src/types/project.ts` (tipos existentes para basarse)
- `frontend/src/types/enums.ts` (constantes de opciones: BUDGETS, PROJECT_TYPES, etc.)

**Criterios de aceptacion**:
- [ ] Al menos 2 formularios tienen validacion Zod completa
- [ ] Los mensajes de error son en espanol y amigables
- [ ] Se validan campos obligatorios, formatos y longitudes minimas/maximas
- [ ] Los errores se muestran debajo de cada campo (no como alerta generica)
- [ ] Los esquemas Zod estan en archivos separados (ej: `frontend/src/lib/schemas/`)

**Ejemplo**:
```typescript
import { z } from 'zod';
import { BUDGETS, DELIVERY_TIMES, PROJECT_TYPES } from '@/types/enums';

export const createProjectSchema = z.object({
  title: z.string()
    .min(5, 'El titulo debe tener al menos 5 caracteres')
    .max(100, 'El titulo no puede superar 100 caracteres'),
  description: z.string()
    .min(20, 'La descripcion debe tener al menos 20 caracteres'),
  budget: z.enum(BUDGETS, {
    errorMap: () => ({ message: 'Debes seleccionar un presupuesto' }),
  }),
  deliveryTime: z.enum(DELIVERY_TIMES, {
    errorMap: () => ({ message: 'Debes seleccionar un tiempo de entrega' }),
  }),
  projectType: z.enum(PROJECT_TYPES, {
    errorMap: () => ({ message: 'Debes seleccionar un tipo de proyecto' }),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
```

---

#### TODO 6: Crear stories de Storybook para los componentes UI

**Que hacer**: Instalar Storybook y crear stories para los componentes existentes en `frontend/src/components/ui/` (Button, Card, Input, Label, Spinner).

**Que es Storybook**: Es una herramienta que permite desarrollar y probar componentes de forma aislada, fuera de la aplicacion. Cada "story" muestra una variante del componente (boton primario, boton deshabilitado, boton de peligro, etc.).

**Por que importa**: Permite ver todos los componentes del sistema de diseno en un solo lugar, probar variantes sin navegar por toda la app, y sirve como documentacion visual para el equipo.

**Archivos a consultar**:
- `frontend/src/components/ui/Button.tsx`
- `frontend/src/components/ui/Card.tsx`
- `frontend/src/components/ui/Input.tsx`
- `frontend/src/components/ui/Label.tsx`
- `frontend/src/components/ui/Spinner.tsx`

**Criterios de aceptacion**:
- [ ] Storybook esta instalado y funciona con `npm run storybook`
- [ ] Cada componente de `ui/` tiene al menos 3 stories (variantes diferentes)
- [ ] Las stories muestran todas las props posibles del componente
- [ ] Se incluyen stories para estados: default, hover, disabled, loading
- [ ] Documentacion basica incluida en cada story (descripcion de uso)

---

#### TODO 7: Agregar tests de integracion para los servicios

**Que hacer**: Crear tests para los servicios en `frontend/src/services/` que verifiquen que la composicion de datos funciona correctamente. Usar mocks para las funciones de la capa de API.

**Que es un test de integracion**: A diferencia de un test unitario (que prueba una funcion aislada), un test de integracion verifica que varias piezas trabajan juntas. En este caso, verificamos que un servicio llama a las funciones de API correctas y compone los datos esperados.

**Por que importa**: Los servicios son la capa mas critica de la aplicacion. Si `getProject` no agrega correctamente los hitos, la pagina de detalle muestra datos incompletos. Los tests con mocks permiten probar la logica sin depender de APIs externas.

**Archivos a consultar**:
- `frontend/src/services/projectService.ts` (la funcion `getProject` es ideal para testear)
- `frontend/src/services/clientService.ts` (funciones mas sencillas para empezar)
- `frontend/src/api/adapter/index.ts` (funciones que hay que mockear)

**Criterios de aceptacion**:
- [ ] Al menos 2 servicios tienen tests de integracion
- [ ] Las funciones de API estan mockeadas (no se hacen llamadas HTTP reales)
- [ ] Se prueba que `getProject` agrega proyecto + cliente + consultor + hitos
- [ ] Se prueba que `getProjectsIndex` usa `Promise.allSettled` y no falla si una peticion falla
- [ ] Todos los tests pasan con `npm test`

**Ejemplo**:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { getProject } from '../projectService';

// Mockear el modulo de API
vi.mock('@/api/adapter', () => ({
  getProjectInfo: vi.fn().mockResolvedValue({
    _id: 'proj-1', clientId: 'client-1', consultantId: 'dev-1', creationStatus: 'created',
  }),
  getClients: vi.fn().mockResolvedValue({
    clients: [{ id: 'client-1', name: 'Ana' }],
  }),
  getDevelopers: vi.fn().mockResolvedValue({
    developers: [{ id: 'dev-1', name: 'Carlos' }],
  }),
  getAllTasks: vi.fn().mockResolvedValue({
    milestones: [{ _id: 'm-1', title: 'Hito 1', developerId: 'dev-1' }],
  }),
}));

describe('getProject', () => {
  it('agrega cliente, consultor y hitos al proyecto', async () => {
    const project = await getProject('proj-1');
    expect(project.client?.name).toBe('Ana');
    expect(project.consultant?.name).toBe('Carlos');
    expect(project.milestones).toHaveLength(1);
  });
});
```

---

#### TODO 8: Implementar paginacion y busqueda en la lista de proyectos

**Que hacer**: Agregar paginacion del lado del cliente y un campo de busqueda a la pagina `ProjectsPage.tsx`. Como la API externa no soporta paginacion nativa, la implementacion sera en el frontend: se cargan todos los proyectos una vez y se paginan/filtran localmente.

**Por que importa**: Actualmente se muestran TODOS los proyectos de golpe. Con 100+ proyectos, la pagina sera lenta y dificil de navegar. La paginacion muestra solo una porcion (ej: 10 proyectos a la vez) y la busqueda permite encontrar rapidamente un proyecto especifico.

**Archivos a consultar**:
- `frontend/src/pages/projects/ProjectsPage.tsx` (pagina a modificar)
- `frontend/src/hooks/useProjects.ts` (hook que obtiene datos)
- `frontend/src/services/projectService.ts` (servicio que carga proyectos)

**Criterios de aceptacion**:
- [ ] La pagina muestra 10 proyectos a la vez (configurable)
- [ ] Existen controles de paginacion (anterior/siguiente, numeros de pagina)
- [ ] El campo de busqueda filtra por titulo o descripcion del proyecto
- [ ] React Query mantiene el cache correctamente
- [ ] La experiencia es fluida (sin parpadeos ni recargas)

---

### :red_circle: Nivel Avanzado

Estas tareas requieren comprension profunda de la arquitectura y posiblemente investigacion adicional.

---

#### TODO 9: Completar las paginas del Dashboard con datos reales

**Que hacer**: Conectar `DashboardPage.tsx` con los hooks de React Query para que muestre datos reales de las APIs externas: conteo de proyectos activos, hitos pendientes, pagos recientes y resumen por estado.

**Por que importa**: El dashboard es la primera pagina que ve un usuario al entrar. Actualmente puede estar mostrando datos placeholder. Conectarlo con datos reales es fundamental para que la aplicacion sea funcional.

**Archivos a consultar**:
- `frontend/src/pages/dashboard/DashboardPage.tsx` (pagina a completar)
- `frontend/src/hooks/useProjects.ts` (datos de proyectos)
- `frontend/src/hooks/usePayments.ts` (datos de pagos)
- `frontend/src/services/projectService.ts` (funcion `getProjectsIndex`)
- `frontend/src/lib/flowStates.ts` (para agrupar proyectos por estado)

**Criterios de aceptacion**:
- [ ] El dashboard muestra conteo real de proyectos por estado (pendiente, en progreso, completado)
- [ ] Muestra los ultimos 5 proyectos con links a su pagina de detalle
- [ ] Muestra hitos pendientes de revision (si es consultor) o pendientes de aprobacion (si es cliente)
- [ ] Maneja correctamente los estados de carga y error
- [ ] Se diferencia la vista entre cliente y developer usando `permissions.ts`

---

#### TODO 10: Agregar tests E2E (End-to-End) con Playwright

**Que hacer**: Configurar Playwright e implementar tests que simulen el flujo completo de un usuario: registrarse, ver la lista de proyectos, navegar al detalle de un proyecto, etc.

**Que es un test E2E**: A diferencia de un test unitario (que prueba una funcion aislada), un test E2E abre un navegador real, hace clic en botones, rellena formularios y verifica que la pagina muestra lo esperado. Simula un usuario real.

**Por que importa**: Es la unica forma de verificar que todos los componentes funcionan correctamente juntos: navegacion, carga de datos, permisos, formularios, etc. Un test unitario puede pasar pero la app puede estar rota si los componentes no se integran bien.

**Archivos a consultar**:
- `frontend/src/App.tsx` (rutas de la aplicacion)
- `frontend/src/pages/auth/LoginPage.tsx` (primer flujo a testear)
- `frontend/src/pages/projects/ProjectsPage.tsx` (segundo flujo a testear)
- [Documentacion de Playwright](https://playwright.dev/docs/intro)

**Criterios de aceptacion**:
- [ ] Playwright esta instalado y configurado
- [ ] Existe un script `npm run test:e2e` en el frontend
- [ ] Al menos 3 flujos E2E implementados: login, ver proyectos, navegar al detalle
- [ ] Los tests se pueden ejecutar contra el entorno de desarrollo (`dev.abako.xyz`)
- [ ] Se incluye documentacion de como ejecutar los tests

---

#### TODO 11: Implementar Zustand devtools y monitoreo de estado

**Que hacer**: Agregar herramientas de depuracion para el estado de Zustand: integrar con Redux DevTools Extension, agregar logging en desarrollo, y crear un segundo store si se necesita (por ejemplo `uiStore` para estado de la interfaz como sidebar abierto/cerrado, tema, etc.).

**Por que importa**: A medida que la aplicacion crece, es importante poder inspeccionar el estado global para depurar problemas. Zustand soporta Redux DevTools, lo que permite ver el historial de cambios de estado en el navegador.

**Archivos a consultar**:
- `frontend/src/stores/authStore.ts` (store existente como referencia)
- [Documentacion de Zustand middleware](https://github.com/pmndrs/zustand#devtools)

**Criterios de aceptacion**:
- [ ] `authStore` esta conectado a Redux DevTools (visible en la extension del navegador)
- [ ] Se agrega logging condicional en desarrollo (`import.meta.env.DEV`)
- [ ] Se crea un `uiStore.ts` si hay estado de UI repetido en multiples componentes
- [ ] `npm run type-check` pasa sin errores

---

#### TODO 12: Configurar CI/CD con GitHub Actions

**Que hacer**: Crear un workflow de GitHub Actions que ejecute automaticamente lint, type-check, build y tests en cada push y pull request.

**Que es CI/CD**: Integracion Continua (CI) es la practica de verificar automaticamente que cada cambio de codigo no rompe nada. Se ejecutan lint, type-check, build y tests automaticamente. Despliegue Continuo (CD) es desplegar automaticamente cuando los checks pasan.

**Por que importa**: Sin CI, los errores llegan a la rama principal y rompen cosas para todos. Con CI, cada pull request se verifica automaticamente y solo se puede mergear si todo pasa.

**Criterios de aceptacion**:
- [ ] Existe un archivo `.github/workflows/ci.yml`
- [ ] El workflow se ejecuta en push y pull request a `feature/web-refactor` y `main`
- [ ] Ejecuta: `npm install`, `npm run lint`, `npm run type-check`, `npm run build`
- [ ] Ejecuta tests si estan configurados
- [ ] El badge de estado se muestra en el README

---

## :handshake: Contribuir al Proyecto

### Flujo de trabajo con Git

```bash
# 1. Asegurate de tener la ultima version de la rama principal
git checkout feature/web-refactor
git pull origin feature/web-refactor

# 2. Crea una rama nueva para tu tarea
git checkout -b tipo/descripcion-corta
# Ejemplos:
#   fix/loading-spinners-all-pages
#   feat/zod-validation-create-project
#   test/flow-states-unit-tests

# 3. Haz tus cambios y commitea frecuentemente
git add .
git commit -m "tipo: descripcion del cambio"

# 4. Sube tu rama al repositorio remoto
git push origin tipo/descripcion-corta

# 5. Crea un Pull Request (PR) en la interfaz web de git
```

### Convenciones de commits

Usamos el formato [Conventional Commits](https://www.conventionalcommits.org/):

| Prefijo | Cuando usarlo | Ejemplo |
|---------|--------------|---------|
| `feat:` | Nueva funcionalidad | `feat: add Zod validation to CreateProjectPage` |
| `fix:` | Correccion de bug | `fix: add missing loading spinner to DashboardPage` |
| `docs:` | Solo documentacion | `docs: update README with new architecture` |
| `style:` | Formateo, sin cambio de logica | `style: fix indentation in ProjectActions.tsx` |
| `refactor:` | Cambio de codigo sin alterar funcionalidad | `refactor: extract error handling to shared util` |
| `test:` | Agregar o corregir tests | `test: add unit tests for flowStates transitions` |
| `chore:` | Tareas de mantenimiento | `chore: install and configure Storybook` |

### Checklist antes de crear un PR

- [ ] El codigo compila sin errores (`npm run build` en frontend)
- [ ] Los tipos estan correctos (`npm run type-check` en frontend)
- [ ] El linter pasa sin warnings (`npm run lint`)
- [ ] Los tests pasan (si hay tests configurados)
- [ ] El PR tiene una descripcion clara de que cambia y por que
- [ ] Se mencionan los archivos clave modificados

### Estructura de un buen PR

```markdown
## Que cambia
- Agrega validacion Zod al formulario de CreateProjectPage
- Crea esquemas en src/lib/schemas/createProject.ts

## Por que
- Sin validacion, se pueden enviar formularios vacios causando errores 400

## Como probar
1. Ir a /projects/new
2. Intentar enviar el formulario vacio -> debe mostrar errores en cada campo
3. Rellenar correctamente -> debe enviar sin problemas

## Archivos clave
- frontend/src/lib/schemas/createProject.ts (NUEVO)
- frontend/src/pages/projects/CreateProjectPage.tsx (MODIFICADO)
```

---

## :file_cabinet: Directorio `backend/` (LEGACY)

> :warning: **El directorio `backend/` se conserva unicamente como referencia durante la migracion. NO es necesario instalarlo ni ejecutarlo para que la aplicacion funcione.**

El backend Express.js original servia como intermediario entre el navegador y las APIs externas. Su logica ya ha sido portada al frontend:

| Backend original | Portado a (frontend) | Estado |
|-----------------|----------------------|--------|
| `models/adapter.js` (1243 lineas) | `src/api/adapter/` + `src/api/virto/` + `src/api/contracts/` | Completado |
| `models/seda/` (13 modulos) | `src/services/` (7 modulos, 58 funciones) | Completado |
| `models/flowStates.js` | `src/lib/flowStates.ts` | Completado |
| `controllers/permission.js` | `src/lib/permissions.ts` | Completado |
| `models/enums/` (JSON) | `src/types/enums.ts` + `src/constants/languages.ts` | Completado |
| Sesiones Express + SQLite | `src/stores/authStore.ts` (Zustand + localStorage) | Completado |

Si necesitas entender la logica original de alguna funcion o endpoint, puedes consultar los archivos del backend como referencia. Pero no necesitas ejecutarlo.

---

## :link: Enlaces Utiles

### Sobre el ecosistema blockchain

| Recurso | URL | Descripcion |
|---------|-----|-------------|
| Polkadot | [polkadot.network](https://polkadot.network/) | Red de blockchains donde vive el proyecto |
| Virto Network | [virto.network](https://virto.network/) | Blockchain de comercio con herramientas de pago |
| WebAuthn | [webauthn.guide](https://webauthn.guide/) | Guia sobre autenticacion sin contrasena |

### Sobre las tecnologias del frontend

| Recurso | URL | Descripcion |
|---------|-----|-------------|
| React | [react.dev](https://react.dev/) | Documentacion oficial de React |
| TypeScript | [typescriptlang.org](https://www.typescriptlang.org/docs/) | Manual de TypeScript |
| Vite | [vitejs.dev](https://vitejs.dev/) | Documentacion de Vite |
| TailwindCSS | [tailwindcss.com/docs](https://tailwindcss.com/docs) | Documentacion de Tailwind |
| TanStack Query | [tanstack.com/query](https://tanstack.com/query/latest) | Documentacion de React Query |
| Zustand | [github.com/pmndrs/zustand](https://github.com/pmndrs/zustand) | Documentacion de Zustand |
| Zod | [zod.dev](https://zod.dev/) | Documentacion de Zod |
| React Hook Form | [react-hook-form.com](https://react-hook-form.com/) | Documentacion de React Hook Form |
| React Router | [reactrouter.com](https://reactrouter.com/) | Documentacion de React Router |
| Axios | [axios-http.com](https://axios-http.com/) | Cliente HTTP |
| Vitest | [vitest.dev](https://vitest.dev/) | Framework de testing para Vite |
| Playwright | [playwright.dev](https://playwright.dev/) | Framework de testing E2E |
| Storybook | [storybook.js.org](https://storybook.js.org/) | Herramienta de desarrollo de componentes |

### Documentacion interna del proyecto

Estos archivos en `.context/` contienen informacion detallada sobre la arquitectura y las decisiones de diseno:

| Archivo | Descripcion |
|---------|-------------|
| `.context/PROJECT_ANALYSIS.md` | Analisis completo del proyecto: arquitectura, APIs, bugs conocidos |
| `.context/CODE_REVIEW_RESULTS.md` | Resultados de la revision de codigo: 17 bugs, 14 vulnerabilidades |
| `.context/FRONTEND_ARCHITECTURE.md` | Arquitectura del frontend React: stack, decisiones, patrones |
| `.context/MIGRATION_PLAN.md` | Plan de migracion detallado: riesgos, fases, dependencias |
| `.context/IMPLEMENTATION_BLUEPRINT.md` | Blueprint con codigo concreto para cada fase |

---

<p align="center">
  <sub>Desarrollado con la red <a href="https://virto.network/">Virto Network</a> sobre <a href="https://polkadot.network/">Polkadot</a></sub>
</p>
