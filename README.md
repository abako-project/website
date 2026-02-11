# :globe_with_meridians: Work3Spaces (Abako / PolkaTalent)

**Marketplace descentralizado para freelancers, construido sobre Polkadot/Virto Network.**

> Un cliente propone un proyecto, una DAO (organizacion autonoma descentralizada) asigna un consultor, el consultor define el alcance con hitos, el cliente aprueba, se forma el equipo, se desarrolla, se revisa y se paga a traves de un sistema de custodia (escrow) en blockchain.

[![Estado: En Migracion](https://img.shields.io/badge/Estado-En%20Migraci%C3%B3n-orange)]()
[![Branch](https://img.shields.io/badge/Branch-feature%2Fweb--refactor-blue)]()
[![Node](https://img.shields.io/badge/Node.js-%3E%3D18-green)]()

---

## Tabla de Contenidos

1. [Sobre el Proyecto](#-sobre-el-proyecto)
2. [Stack Tecnologico](#-stack-tecnologico)
3. [Estructura del Proyecto](#-estructura-del-proyecto)
4. [Prerrequisitos](#-prerrequisitos)
5. [Comenzar a Trabajar](#-comenzar-a-trabajar)
6. [Scripts Disponibles](#-scripts-disponibles)
7. [Arquitectura General](#-arquitectura-general)
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

---

## Stack Tecnologico

### Backend (servidor)

| Tecnologia | Version | Para que se usa |
|------------|---------|-----------------|
| **Express.js** | 4.18 | Framework web del servidor (gestiona rutas, peticiones HTTP, etc.) |
| **EJS** | 3.1.8 | Motor de plantillas HTML del lado del servidor (sistema antiguo, en reemplazo) |
| **SQLite** + Sequelize | 5.1 / 6.32 | Base de datos local solo para sesiones de usuario |
| **Axios** | 1.13 | Cliente HTTP para comunicarse con 3 APIs externas |
| **Passport + WebAuthn** | -- | Autenticacion via Virto SDK |
| **CORS** | 2.8.6 | Permite que el frontend React se comunique con el backend |
| **SASS** | -- | Preprocesador de estilos CSS (sistema antiguo) |
| **dotenv** | 17.2 | Carga variables de entorno desde archivos `.env` |

### Frontend (nueva interfaz de usuario)

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

---

## Estructura del Proyecto

<details>
<summary><strong>Haz clic para expandir el arbol completo del proyecto</strong></summary>

```
website/
|
|-- backend/                         # Servidor Express.js (API + vistas EJS)
|   |-- app.js                       # Configuracion principal de Express
|   |-- bin/www                      # Punto de entrada del servidor (PORT=3001)
|   |
|   |-- config/
|   |   |-- adapter.config.js        # URLs de las 3 APIs externas
|   |   `-- bbdd.config.json         # Configuracion de SQLite
|   |
|   |-- controllers/                 # Logica de cada ruta (que hacer con cada peticion)
|   |   |-- auth/                    # Autenticacion (login, registro)
|   |   |   |-- index.js             # Selecciona entre cliente o developer
|   |   |   |-- client.js            # Login/registro de clientes
|   |   |   `-- developer.js         # Login/registro de developers
|   |   |-- permission.js            # Middleware de permisos (quien puede hacer que)
|   |   |-- project.js               # Ciclo de vida del proyecto (el mas grande)
|   |   |-- milestone.js             # Gestion de hitos
|   |   |-- dashboard.js             # Panel principal
|   |   |-- payment.js               # Procesamiento de pagos
|   |   |-- escrow.js                # Sistema de custodia/fondeo
|   |   |-- backdoor.js              # Acceso rapido para desarrollo (NO usar en produccion)
|   |   `-- votes.js                 # Sistema de votacion
|   |
|   |-- models/
|   |   |-- adapter.js               # ** ARCHIVO CLAVE ** (~1243 lineas) Cliente HTTP
|   |   |                            #   para las 3 APIs externas
|   |   |-- flowStates.js            # Maquinas de estado (estados del proyecto/hito)
|   |   |-- session.js               # Configuracion de sesiones con SQLite
|   |   |-- enums/                   # Archivos JSON con opciones (presupuestos, skills, etc.)
|   |   `-- seda/                    # ** CAPA SEDA ** - Logica de negocio (13 modulos)
|   |       |-- index.js             # Re-exporta todos los modulos
|   |       |-- project.js           # Operaciones de proyecto
|   |       |-- proposal.js          # Operaciones de propuesta
|   |       |-- milestone.js         # Operaciones de hito
|   |       |-- scope.js             # Gestion de alcance
|   |       |-- client.js            # Operaciones de cliente
|   |       |-- developer.js         # Operaciones de developer
|   |       |-- budget.js            # Enums de presupuesto
|   |       |-- deliveryTime.js      # Enums de tiempo de entrega
|   |       |-- projectType.js       # Enums de tipo de proyecto
|   |       |-- calendar.js          # Disponibilidad de developers
|   |       |-- objective.js         # Objetivos del proyecto
|   |       |-- constraint.js        # Restricciones del proyecto
|   |       |-- error.js             # Errores personalizados
|   |       `-- milestoneLog.js      # Historial de hitos
|   |
|   |-- routes/
|   |   |-- index.js                 # Agrupador de todas las rutas
|   |   |-- api/                     # ** RUTAS JSON ** (para el frontend React)
|   |   |   |-- index.js             # Agrupador de rutas API
|   |   |   |-- auth.js              # POST /api/auth/login, /register, /logout
|   |   |   |-- projects.js          # GET/POST /api/projects
|   |   |   |-- milestones.js        # Endpoints de hitos
|   |   |   |-- dashboard.js         # GET /api/dashboard
|   |   |   |-- payments.js          # Endpoints de pagos
|   |   |   |-- votes.js             # Endpoints de votacion
|   |   |   |-- clients.js           # Endpoints de perfil de cliente
|   |   |   |-- developers.js        # Endpoints de perfil de developer
|   |   |   `-- enums.js             # GET /api/enums (opciones de formularios)
|   |   |-- auth.js                  # Rutas EJS de autenticacion (sistema antiguo)
|   |   |-- projects.js              # Rutas EJS de proyectos (sistema antiguo)
|   |   `-- ...                      # Otras rutas EJS
|   |
|   |-- views/                       # 90+ plantillas EJS (sistema antiguo)
|   |-- public/                      # Archivos estaticos (CSS, imagenes, JS)
|   `-- .env                         # Variables de entorno (NO subir a git)
|
|-- frontend/                        # Aplicacion React (nueva interfaz)
|   |-- src/
|   |   |-- main.tsx                 # Punto de entrada de la app React
|   |   |-- App.tsx                  # Componente raiz con React Router
|   |   |-- index.css                # Estilos globales con Tailwind
|   |   |
|   |   |-- api/
|   |   |   `-- client.ts            # Cliente Axios configurado + interceptores
|   |   |
|   |   |-- components/
|   |   |   |-- ui/                  # Componentes base reutilizables
|   |   |   |   |-- Button.tsx       # Boton con variantes
|   |   |   |   |-- Card.tsx         # Tarjeta contenedora
|   |   |   |   |-- Input.tsx        # Campo de entrada
|   |   |   |   |-- Label.tsx        # Etiqueta de formulario
|   |   |   |   |-- Spinner.tsx      # Indicador de carga
|   |   |   |   `-- index.ts         # Barrel export (re-exporta todo)
|   |   |   |-- shared/              # Componentes compartidos entre paginas
|   |   |   |   |-- ProtectedRoute.tsx    # Ruta que requiere autenticacion
|   |   |   |   |-- ErrorBoundary.tsx     # Captura errores de React
|   |   |   |   |-- LoadingScreen.tsx     # Pantalla de carga completa
|   |   |   |   |-- EmptyState.tsx        # Estado vacio (sin datos)
|   |   |   |   `-- ProjectStateBadge.tsx # Badge del estado del proyecto
|   |   |   |-- features/            # Componentes especificos por funcionalidad
|   |   |   |   |-- projects/
|   |   |   |   |   |-- ProjectActions.tsx        # Botones de accion del proyecto
|   |   |   |   |   |-- ScopeBuilder.tsx          # Constructor de alcance
|   |   |   |   |   `-- MilestoneStatusBadge.tsx  # Badge de estado de hito
|   |   |   |   `-- milestones/
|   |   |   |       |-- MilestoneCard.tsx     # Tarjeta de hito
|   |   |   |       |-- MilestoneList.tsx     # Lista de hitos
|   |   |   |       `-- MilestoneActions.tsx  # Acciones de hito
|   |   |   `-- layouts/              # Estructuras de pagina
|   |   |       |-- AppLayout.tsx     # Layout principal (sidebar + header + contenido)
|   |   |       |-- AuthLayout.tsx    # Layout de autenticacion
|   |   |       |-- Header.tsx        # Barra superior
|   |   |       `-- Sidebar.tsx       # Menu lateral
|   |   |
|   |   |-- pages/                   # Paginas completas (una por ruta)
|   |   |   |-- auth/
|   |   |   |   |-- LoginPage.tsx             # Pagina de login
|   |   |   |   |-- RegisterPage.tsx          # Seleccion de rol
|   |   |   |   |-- ClientLoginPage.tsx       # Login de cliente
|   |   |   |   |-- DeveloperLoginPage.tsx    # Login de developer
|   |   |   |   |-- ClientRegisterPage.tsx    # Registro de cliente
|   |   |   |   `-- DeveloperRegisterPage.tsx # Registro de developer
|   |   |   |-- dashboard/
|   |   |   |   `-- DashboardPage.tsx # Panel principal
|   |   |   |-- projects/
|   |   |   |   |-- ProjectsPage.tsx        # Lista de proyectos
|   |   |   |   |-- ProjectDetailPage.tsx   # Detalle de un proyecto
|   |   |   |   `-- CreateProjectPage.tsx   # Crear propuesta
|   |   |   |-- payments/
|   |   |   |   |-- PaymentsPage.tsx        # Lista de pagos
|   |   |   |   `-- PaymentDetailPage.tsx   # Detalle de un pago
|   |   |   `-- profiles/
|   |   |       |-- ProfilePage.tsx         # Perfil general
|   |   |       |-- ClientProfilePage.tsx   # Perfil de cliente
|   |   |       `-- DeveloperProfilePage.tsx # Perfil de developer
|   |   |
|   |   |-- hooks/                   # Custom hooks (logica reutilizable)
|   |   |   |-- useAuth.ts           # Hook de autenticacion
|   |   |   |-- useProjects.ts       # Hook de proyectos (React Query)
|   |   |   |-- useMilestones.ts     # Hook de hitos
|   |   |   |-- usePayments.ts       # Hook de pagos
|   |   |   |-- useVotes.ts          # Hook de votaciones
|   |   |   |-- useProfile.ts        # Hook de perfil
|   |   |   |-- useScope.ts          # Hook de alcance
|   |   |   `-- useEnums.ts          # Hook de enums (opciones de formularios)
|   |   |
|   |   |-- stores/
|   |   |   `-- authStore.ts         # Estado global de autenticacion (Zustand)
|   |   |
|   |   |-- lib/                     # Utilidades y logica pura
|   |   |   |-- flowStates.ts        # Maquina de estados (TypeScript)
|   |   |   |-- cn.ts                # Utilidad para combinar clases CSS
|   |   |   |-- paymentUtils.ts      # Utilidades de pagos
|   |   |   `-- virto-sdk.ts         # Integracion con Virto Network SDK
|   |   |
|   |   `-- types/                   # Definiciones de tipos TypeScript
|   |       |-- index.ts             # Barrel export de todos los tipos
|   |       |-- user.ts              # Tipos de usuario y autenticacion
|   |       |-- project.ts           # Tipos de proyecto y hito
|   |       |-- client.ts            # Tipos de cliente
|   |       |-- developer.ts         # Tipos de developer
|   |       |-- payment.ts           # Tipos de pago y votacion
|   |       |-- enums.ts             # Tipos y constantes de enums
|   |       `-- api.ts               # Tipos de respuesta/error de API
|   |
|   |-- vite.config.ts               # Configuracion de Vite (proxy, aliases, build)
|   |-- tsconfig.json                # Configuracion de TypeScript
|   |-- tailwind.config.js           # Configuracion de Tailwind CSS
|   `-- package.json                 # Dependencias del frontend
|
|-- .context/                        # Documentacion tecnica del proyecto
|   |-- PROJECT_ANALYSIS.md          # Analisis completo del proyecto
|   |-- CODE_REVIEW_RESULTS.md       # Resultados de revision de codigo
|   |-- FRONTEND_ARCHITECTURE.md     # Arquitectura del frontend React
|   |-- MIGRATION_PLAN.md            # Plan de migracion detallado
|   `-- IMPLEMENTATION_BLUEPRINT.md  # Blueprint de implementacion con codigo
|
|-- .gitignore                       # Archivos excluidos de git
`-- README.md                        # Este archivo
```

</details>

---

## Prerrequisitos

Antes de empezar, asegurate de tener instalado lo siguiente en tu computadora:

| Herramienta | Version minima | Como verificar | Como instalar |
|-------------|---------------|----------------|---------------|
| **Node.js** | >= 18.0 | `node --version` | [nodejs.org](https://nodejs.org/) |
| **npm** | >= 9.0 | `npm --version` | Viene con Node.js |
| **Git** | >= 2.0 | `git --version` | [git-scm.com](https://git-scm.com/) |

> **Nota para juniors**: Node.js es el entorno que ejecuta JavaScript fuera del navegador. npm es su gestor de paquetes (como una tienda de librerias que puedes instalar con un comando).

---

## Comenzar a Trabajar

### 1. Clonar el repositorio

```bash
# Clona el proyecto en tu computadora
git clone <URL_DEL_REPOSITORIO>

# Entra en la carpeta del proyecto
cd website/website

# Cambia a la rama de trabajo activa
git checkout feature/web-refactor
```

### 2. Instalar dependencias del backend

```bash
# Entra en la carpeta del backend
cd backend

# Instala todas las librerias necesarias
npm install

# Vuelve a la raiz del proyecto
cd ..
```

### 3. Configurar variables de entorno del backend

```bash
# Copia el archivo de ejemplo (si existe) o crea uno nuevo
cp backend/.env.example backend/.env

# Edita el archivo con tu editor preferido
# Las variables necesarias son:
#   SESSION_SECRET=una_cadena_secreta_larga_y_aleatoria
#   NODE_ENV=development
#   PORT=3001
```

> **Importante**: El archivo `.env` contiene datos sensibles (claves secretas). NUNCA lo subas a git. Ya esta incluido en `.gitignore`.

### 4. Instalar dependencias del frontend

```bash
# Entra en la carpeta del frontend
cd frontend

# Instala todas las librerias necesarias
npm install

# Vuelve a la raiz del proyecto
cd ..
```

### 5. Iniciar el backend (puerto 3001)

```bash
cd backend
npm start
```

Deberia mostrar algo como:
```
Listening on port 3001
```

### 6. Iniciar el frontend (puerto 5173) - En otra terminal

```bash
cd frontend
npm run dev
```

Deberia mostrar algo como:
```
  VITE v6.0.3  ready in 300 ms

  > Local:   http://localhost:5173/
```

### 7. Abrir la aplicacion

Abre tu navegador y ve a **http://localhost:5173**. El frontend React se comunicara automaticamente con el backend en el puerto 3001 gracias a la configuracion del proxy en Vite.

### Arrancar ambos con un solo comando (tip)

Puedes abrir dos terminales en paralelo o usar una herramienta como `concurrently`. Desde la raiz del proyecto:

```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend (en otra ventana/pestana de terminal)
cd frontend && npm run dev
```

---

## :scroll: Scripts Disponibles

### Backend (`backend/package.json`)

| Script | Comando | Que hace |
|--------|---------|----------|
| `start` | `npm start` | Inicia el servidor Express en el puerto 3001 con `supervisor` (reinicia automaticamente al guardar cambios) |
| `sass` | `npm run sass` | Compila los archivos SASS a CSS (estilos del sistema antiguo EJS) |
| `lint` | `npm run lint` | Ejecuta ESLint para detectar errores y malas practicas en el codigo |

### Frontend (`frontend/package.json`)

| Script | Comando | Que hace |
|--------|---------|----------|
| `dev` | `npm run dev` | Inicia el servidor de desarrollo Vite con recarga en caliente (HMR) |
| `build` | `npm run build` | Compila TypeScript y genera la version de produccion en `dist/` |
| `preview` | `npm run preview` | Sirve la version de produccion localmente para verificar antes de desplegar |
| `lint` | `npm run lint` | Ejecuta ESLint con cero warnings permitidos |
| `type-check` | `npm run type-check` | Verifica tipos TypeScript sin generar archivos (solo comprueba errores) |

---

## :building_construction: Arquitectura General

### Como se comunican el frontend y el backend

```
                    NAVEGADOR DEL USUARIO
                           |
                    +------+------+
                    |             |
            Puerto 5173     Puerto 3001
            (desarrollo)    (siempre)
                    |             |
              +-----+-----+  +---+---+
              |   Vite     |  |       |
              |   Dev      +--+ Express|
              |   Server   |  |  API   |
              +-----+------+  +---+---+
                    |             |
              React SPA      Rutas /api/*
              (TypeScript)   (JSON)
                                  |
                          +-------+-------+
                          |               |
                     Capa SEDA     Rutas EJS
                    (logica de    (sistema
                     negocio)     antiguo)
                          |
                    +-----+-----+
                    | adapter.js |
                    +-----+-----+
                          |
              +-----------+-----------+
              |           |           |
         API Adapter  API Virto  API Contracts
         (NestJS)     (WebAuthn)  (Blockchain)
```

**En desarrollo**: Vite actua como proxy. Cuando el frontend hace una peticion a `/api/projects`, Vite la redirige automaticamente al backend en `http://localhost:3001/api/projects`. Esto esta configurado en `frontend/vite.config.ts`.

**En produccion**: El frontend se compila a archivos estaticos (`npm run build`) y se sirve directamente. Las peticiones a `/api/*` van al backend Express.

### La capa SEDA (`backend/models/seda/`)

SEDA significa **S**ervicio de **E**ncapsulamiento de **D**atos y **A**cciones. Es una capa de abstraccion que separa la logica de negocio del acceso a datos.

**Sin SEDA** (malo):
```javascript
// El controlador llama directamente a la API externa
const response = await axios.get('https://dev.abako.xyz/adapter/v1/projects');
const projects = response.data;
// ... logica de negocio mezclada con llamadas HTTP
```

**Con SEDA** (bueno):
```javascript
// El controlador llama a SEDA, que se encarga internamente
const projects = await seda.projectsIndex(token);
// SEDA gestiona: llamadas HTTP, transformacion de datos, manejo de errores
```

La capa SEDA tiene 13 modulos en `backend/models/seda/`:

| Modulo | Responsabilidad |
|--------|----------------|
| `project.js` | Listar, obtener, crear y actualizar proyectos |
| `proposal.js` | Gestionar propuestas de proyecto |
| `milestone.js` | CRUD de hitos dentro de un proyecto |
| `scope.js` | Proponer, aprobar y rechazar alcances |
| `client.js` | Operaciones de perfil de cliente |
| `developer.js` | Operaciones de perfil de developer |
| `budget.js` | Opciones de presupuesto |
| `deliveryTime.js` | Opciones de tiempo de entrega |
| `projectType.js` | Tipos de proyecto |
| `calendar.js` | Disponibilidad de developers |
| `objective.js` | Objetivos del proyecto |
| `constraint.js` | Restricciones del proyecto |
| `milestoneLog.js` | Historial de cambios en hitos |

### El archivo `adapter.js`

Es el archivo mas grande del backend (~1243 lineas). Funciona como un **cliente HTTP centralizado** que se comunica con 3 APIs externas:

1. **Adapter API** (`dev.abako.xyz/adapter/v1`): CRUD de clientes, developers, proyectos y hitos.
2. **Virto API** (`dev.abako.xyz`): Autenticacion WebAuthn, gestion de miembros y pagos.
3. **Contracts API** (`dev.abako.xyz`): Despliegue e interaccion con contratos inteligentes en blockchain.

### Estado global con Zustand

En el frontend React, usamos **Zustand** para manejar el estado global (datos que necesitan compartirse entre varios componentes). Actualmente tenemos:

- **`authStore.ts`**: Almacena la informacion del usuario autenticado, su token y su rol (cliente o developer).

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

### Datos del servidor con React Query

Para los datos que vienen del backend (proyectos, hitos, pagos), usamos **TanStack React Query**. Esto nos da:

- **Cache automatico**: Si ya cargaste la lista de proyectos, no la vuelve a pedir al servidor.
- **Reintentos**: Si falla una peticion, lo intenta de nuevo automaticamente.
- **Actualizacion en segundo plano**: Los datos se refrescan sin que el usuario lo note.

```typescript
// Ejemplo: hook que obtiene proyectos del servidor
import { useProjects } from '@/hooks/useProjects';

function ListaProyectos() {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) return <Spinner />;
  if (error) return <p>Error al cargar proyectos</p>;
  return projects.map(p => <ProjectCard key={p.id} project={p} />);
}
```

---

## :chart_with_upwards_trend: Estado de la Migracion

El proyecto esta migrando de **EJS** (plantillas HTML renderizadas en el servidor) a **React** (SPA moderna). La migracion se divide en fases:

```
Fase 0: Correcciones previas              [##########] 100%  COMPLETADA
  - Bugs en flowStates.js corregidos
  - Bugs en adapter.js corregidos
  - CORS configurado
  - Session secret movido a variable de entorno
  - Ruta /backdoor/wild eliminada
  - QA pasado: 71/71 tests

Fase 1: Infraestructura                   [######----]  60%  EN PROGRESO
  - [x] Scaffold React + Vite + TypeScript
  - [x] Tailwind CSS configurado
  - [x] Cliente Axios con interceptores
  - [x] React Router configurado
  - [x] Zustand auth store
  - [x] Rutas /api en Express
  - [ ] Middleware dual-auth (sesion + token Bearer)
  - [ ] Endpoints de auth completos
  - [ ] Pruebas de integracion

Fase 2: Logica compartida                 [----------]   0%  PENDIENTE
  - Portar tipos TypeScript completos
  - Maquina de estados en TypeScript
  - Validaciones Zod compartidas

Fase 3: Auth + App Shell                  [----------]   0%  PENDIENTE
  - Layout principal (sidebar, header)
  - Paginas de login y registro
  - Rutas protegidas
  - Error boundaries

Fase 4: Paginas Core + Alcance            [----------]   0%  PENDIENTE
  ** FASE ATOMICA - no se puede dividir **
  - Dashboard, proyectos, hitos y alcance
  - Deben migrarse todos juntos

Fase 5: Pagos + Perfiles + Corte final   [----------]   0%  PENDIENTE
  - Paginas de perfiles
  - Paginas de pagos
  - Eliminacion del sistema EJS
```

> **Que significa "ATOMICA"**: La Fase 4 no se puede hacer parcialmente. El flujo de trabajo de alcance (crear hitos, editar, enviar para aprobacion) depende de datos que se almacenan en la sesion de Express. Si migramos la mitad a React y dejamos la otra en EJS, el usuario perderia datos al cambiar entre sistemas. Por eso se migra todo junto.

---

## :clipboard: TODOs para Desarrolladores Junior

Esta seccion contiene tareas concretas ordenadas por dificultad. Cada tarea incluye:
- **Que hay que hacer** y **por que importa**
- **Archivos a consultar** para entender el contexto
- **Criterios de aceptacion** (como saber que terminaste bien)

---

### :green_circle: Nivel Facil (buenas primeras tareas)

Estas tareas son ideales para familiarizarte con el proyecto. No requieren conocimiento profundo de la arquitectura.

---

#### TODO 1: Crear un archivo `.env.example` para el backend

**Que hacer**: Crear un archivo en `backend/.env.example` que documente todas las variables de entorno necesarias para ejecutar el backend, con valores de ejemplo (NO valores reales).

**Por que importa**: Cuando un nuevo developer clona el proyecto, necesita saber que variables de entorno configurar. Sin un `.env.example`, tiene que adivinar o preguntar. Esto reduce fricciones en el onboarding.

**Archivos a consultar**:
- `backend/.env` (el archivo real, para ver que variables existen)
- `backend/app.js` (busca `process.env` para ver que variables se usan)
- `backend/models/session.js` (usa variables de configuracion de base de datos)
- `backend/config/adapter.config.js` (URLs de APIs externas)

**Criterios de aceptacion**:
- [ ] Existe el archivo `backend/.env.example`
- [ ] Lista TODAS las variables de entorno usadas en el proyecto
- [ ] Cada variable tiene un comentario explicando que es
- [ ] Los valores de ejemplo son genericos (no datos reales)
- [ ] Incluye un comentario al inicio con instrucciones: "Copia este archivo como .env y rellena los valores"

**Ejemplo de formato esperado**:
```bash
# Copia este archivo como .env y rellena los valores reales
# cp .env.example .env

# Secreto para firmar las cookies de sesion (usa una cadena larga y aleatoria)
SESSION_SECRET=cambia_esto_por_un_secreto_seguro

# Entorno de ejecucion: development o production
NODE_ENV=development

# Puerto del servidor
PORT=3001
```

---

#### TODO 2: Agregar comentarios JSDoc a un modulo SEDA

**Que hacer**: Elegir uno de los modulos mas sencillos de la capa SEDA (por ejemplo `budget.js` o `deliveryTime.js`) y agregar comentarios JSDoc a todas sus funciones.

**Que es JSDoc**: Es un formato estandar para documentar funciones en JavaScript. Los editores como VS Code lo usan para mostrar informacion util cuando pasas el cursor sobre una funcion.

**Por que importa**: El backend no tiene documentacion en el codigo. Los nuevos developers no pueden saber que hace cada funcion sin leer todo el codigo. JSDoc resuelve esto.

**Archivos a consultar**:
- `backend/models/seda/budget.js` (modulo sencillo, bueno para empezar)
- `backend/models/seda/deliveryTime.js` (otro modulo sencillo)
- `backend/models/seda/projectType.js` (otro candidato)

**Criterios de aceptacion**:
- [ ] Cada funcion exportada tiene un comentario JSDoc
- [ ] El JSDoc incluye: descripcion, parametros (`@param`) y retorno (`@returns`)
- [ ] Los tipos de los parametros estan documentados
- [ ] El modulo elegido se documenta completamente

**Ejemplo de formato esperado**:
```javascript
/**
 * Obtiene la lista de opciones de presupuesto disponibles.
 *
 * @param {string} token - Token de autenticacion del usuario
 * @returns {Promise<Array<{id: string, label: string, range: string}>>}
 *   Lista de rangos de presupuesto (ej: "5000-10000 USD")
 * @throws {SedaError} Si la API externa no responde
 */
async function getBudgets(token) {
  // ...
}
```

---

#### TODO 3: Corregir los warnings de ESLint en el backend

**Que hacer**: Ejecutar `cd backend && npm run lint`, revisar los warnings y corregirlos. La mayoria son variables declaradas pero nunca usadas (patron `_e` en bloques catch).

**Que es ESLint**: Es una herramienta que analiza tu codigo sin ejecutarlo y detecta problemas: variables sin usar, errores de sintaxis, malas practicas, etc. Es como un corrector ortografico pero para codigo.

**Por que importa**: Los warnings de lint son "ruido" que oculta problemas reales. Si hay muchos warnings, nadie los lee y un bug nuevo se pierde entre ellos. Con cero warnings, cualquier warning nuevo se nota inmediatamente.

**Archivos a consultar**:
- Ejecuta `cd backend && npm run lint` para ver la lista completa
- Los archivos con mas warnings son los controllers y los modulos SEDA

**Criterios de aceptacion**:
- [ ] `npm run lint` ejecuta sin errors ni warnings
- [ ] Las variables no usadas se eliminaron o se prefijaron con `_` (convencion para indicar "intencionalmente ignorada")
- [ ] Ningun cambio altera la funcionalidad existente (solo limpieza)
- [ ] Se hace un commit con mensaje descriptivo: `fix: resolve ESLint warnings in backend`

**Patron comun que encontraras**:
```javascript
// ANTES (warning: '_e' is defined but never used)
try {
  await seda.doSomething();
} catch (_e) {
  res.render('error');
}

// DESPUES (sin warning: usar catch sin parametro)
try {
  await seda.doSomething();
} catch {
  res.render('error');
}
```

---

#### TODO 4: Agregar spinners de carga a las paginas del frontend

**Que hacer**: Revisar las paginas del frontend (`frontend/src/pages/`) y asegurarse de que todas muestren un spinner (indicador de carga) mientras esperan datos del servidor.

**Por que importa**: Sin un indicador de carga, el usuario ve una pagina en blanco y piensa que la aplicacion esta rota. Un spinner le indica "estoy cargando, espera un momento".

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

#### TODO 5: Escribir tests unitarios para la maquina de estados `flowStates`

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

### :yellow_circle: Nivel Intermedio

Estas tareas requieren comprender mas sobre la arquitectura del proyecto y escribir codigo mas complejo.

---

#### TODO 6: Convertir bloques catch con errores ignorados a logging adecuado

**Que hacer**: Buscar todos los bloques `catch` en el backend que ignoran el error (patron `catch (_e)` o `catch (e)` sin usar `e`) y reemplazarlos con logging estructurado.

**Por que importa**: Cuando algo falla en produccion, necesitamos saber QUE fallo y DONDE. Si los errores se ignoran silenciosamente, los bugs son invisibles y muy dificiles de depurar.

**Archivos a consultar**:
- Busca en todo `backend/` el patron `catch` con `grep -rn "catch" backend/controllers/ backend/models/seda/`
- `backend/controllers/project.js` (el controlador mas grande, tiene varios catch)
- `backend/controllers/milestone.js` (otro con muchos catch)

**Criterios de aceptacion**:
- [ ] Ningun bloque `catch` ignora el error silenciosamente
- [ ] Cada `catch` registra el error con `console.error` incluyendo contexto (nombre de la funcion, parametros relevantes)
- [ ] Los errores no exponen informacion sensible en las respuestas al usuario
- [ ] Los mensajes de error son utiles para depurar: "Error en projectApprove para projectId=123: Connection refused"

**Ejemplo de mejora**:
```javascript
// ANTES
try {
  await seda.approveProposal(token, projectId);
} catch (_e) {
  req.flash('error', 'Error al aprobar');
  res.redirect('/projects');
}

// DESPUES
try {
  await seda.approveProposal(token, projectId);
} catch (error) {
  console.error(`[projectApprove] Error al aprobar proyecto ${projectId}:`, error.message);
  req.flash('error', 'Error al aprobar la propuesta. Intentalo de nuevo.');
  res.redirect('/projects');
}
```

---

#### TODO 7: Agregar interfaces TypeScript para todas las respuestas de la API

**Que hacer**: Revisar las respuestas de los endpoints `/api/*` del backend y crear interfaces TypeScript en el frontend que describan exactamente la estructura de esas respuestas.

**Por que importa**: Sin tipos, TypeScript no puede avisarte si estas accediendo a una propiedad que no existe. Por ejemplo, si la API devuelve `project.name` pero tu escribes `project.nombre`, sin tipos no habra error hasta que el usuario vea "undefined" en pantalla.

**Archivos a consultar**:
- `frontend/src/types/` (tipos existentes para comparar el estilo)
- `frontend/src/types/index.ts` (barrel file que exporta todos los tipos)
- `backend/routes/api/projects.js` (para ver que devuelven los endpoints)
- `backend/routes/api/milestones.js` (para ver estructura de respuestas)
- `frontend/src/api/client.ts` (cliente Axios, para ver como se usan los tipos)

**Criterios de aceptacion**:
- [ ] Cada endpoint del backend tiene su tipo de respuesta correspondiente en `frontend/src/types/`
- [ ] Los tipos se exportan desde `frontend/src/types/index.ts`
- [ ] Los hooks en `frontend/src/hooks/` usan estos tipos en las llamadas de React Query
- [ ] `npm run type-check` pasa sin errores

---

#### TODO 8: Implementar componentes Error Boundary en React

**Que hacer**: Mejorar el `ErrorBoundary.tsx` existente y asegurarse de que envuelve correctamente las secciones clave de la aplicacion para capturar errores de renderizado.

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

#### TODO 9: Agregar validacion de formularios con esquemas Zod

**Que hacer**: Crear esquemas de validacion Zod para los formularios del frontend y conectarlos con React Hook Form usando `@hookform/resolvers`.

**Que es Zod**: Una libreria de validacion que te permite definir "la forma" que deben tener tus datos. Por ejemplo: "el nombre es una cadena de al menos 2 caracteres y el email debe tener formato de correo".

**Por que importa**: Sin validacion, un usuario puede enviar un formulario vacio o con datos incorrectos, causando errores en el backend. La validacion en el frontend da feedback inmediato antes de enviar.

**Archivos a consultar**:
- `frontend/package.json` (Zod y `@hookform/resolvers` ya estan instalados)
- `frontend/src/pages/projects/CreateProjectPage.tsx` (formulario de crear proyecto)
- `frontend/src/pages/auth/ClientRegisterPage.tsx` (formulario de registro)
- `frontend/src/types/project.ts` (tipos existentes para basarse)

**Criterios de aceptacion**:
- [ ] Al menos 2 formularios tienen validacion Zod completa
- [ ] Los mensajes de error son en espanol y amigables
- [ ] Se validan campos obligatorios, formatos y longitudes minimas/maximas
- [ ] Los errores se muestran debajo de cada campo (no como alerta generica)
- [ ] Los esquemas Zod estan en archivos separados (ej: `frontend/src/lib/schemas/`)

**Ejemplo**:
```typescript
import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string()
    .min(5, 'El titulo debe tener al menos 5 caracteres')
    .max(100, 'El titulo no puede superar 100 caracteres'),
  description: z.string()
    .min(20, 'La descripcion debe tener al menos 20 caracteres'),
  budgetId: z.string()
    .min(1, 'Debes seleccionar un presupuesto'),
  deliveryTimeId: z.string()
    .min(1, 'Debes seleccionar un tiempo de entrega'),
});
```

---

#### TODO 10: Crear stories de Storybook para los componentes UI

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

### :red_circle: Nivel Avanzado

Estas tareas requieren comprension profunda de la arquitectura y posiblemente investigacion adicional.

---

#### TODO 11: Implementar el middleware dual-auth (Sesion + Token Bearer)

**Que hacer**: Crear un middleware en Express que acepte autenticacion de DOS formas: sesion de Express (para las paginas EJS antiguas) O token Bearer en la cabecera Authorization (para el frontend React). Ambos metodos deben coexistir durante la migracion.

**Por que importa**: Durante la migracion, el backend debe servir tanto a las paginas EJS (que usan sesiones) como al frontend React (que envia tokens). Sin este middleware, o rompemos el sistema antiguo o el nuevo.

**Archivos a consultar**:
- `backend/controllers/permission.js` (middleware de permisos actual)
- `backend/controllers/auth/client.js` (como se establece la sesion)
- `backend/controllers/auth/developer.js` (idem)
- `backend/routes/api/auth.js` (endpoint de login para React)
- `.context/MIGRATION_PLAN.md` (seccion 1.1, RISK 1: explica el problema en detalle)

**Criterios de aceptacion**:
- [ ] El middleware intenta primero leer `req.session.loginUser.token`
- [ ] Si no hay sesion, intenta leer la cabecera `Authorization: Bearer <token>`
- [ ] En ambos casos, coloca el token y los datos del usuario en un lugar unificado (ej: `req.auth`)
- [ ] Las rutas EJS siguen funcionando sin cambios
- [ ] Las rutas `/api/*` aceptan Bearer token
- [ ] Si no hay autenticacion por ninguna via, devuelve 401

---

#### TODO 12: Optimizar las llamadas N+1 en `projectsIndex`

**Que hacer**: Refactorizar la funcion `seda.projectsIndex()` y/o crear endpoints API agregados que reduzcan las ~47 llamadas HTTP a la API externa por cada carga de la pagina de proyectos.

**Que es el problema N+1**: Si tienes 10 clientes y 10 developers, la funcion actual hace: 1 llamada para listar clientes + 10 llamadas para sus proyectos + 1 llamada para listar developers + 10 llamadas para sus proyectos + N llamadas para hitos. Total: ~47 llamadas HTTP secuenciales. Esto es MUY lento.

**Por que importa**: La pagina tarda 5-10 segundos en cargar. En produccion con mas datos, sera aun peor. Cada llamada HTTP tiene latencia de red.

**Archivos a consultar**:
- `backend/models/seda/project.js` (lineas 129-255: funcion `projectsIndex`)
- `backend/routes/api/dashboard.js` (endpoint que usa esta funcion)
- `.context/MIGRATION_PLAN.md` (seccion 1.1, RISK 3: describe el problema)
- `.context/CODE_REVIEW_RESULTS.md` (lista el N+1 como issue)

**Criterios de aceptacion**:
- [ ] El numero de llamadas HTTP se reduce a menos de 10 por carga de pagina
- [ ] Se usan `Promise.all` para paralelizar llamadas que no dependen entre si
- [ ] La respuesta del endpoint `/api/dashboard` incluye datos agregados (proyectos con sus clientes, developers e hitos)
- [ ] El tiempo de respuesta se reduce notablemente (medir antes y despues)
- [ ] La funcionalidad no cambia: se muestran los mismos datos

---

#### TODO 13: Implementar las funciones stub de la capa SEDA

**Que hacer**: Hay 18 funciones en la capa SEDA que lanzan el error `'Internal Error. To be adapted.'`. Estas funciones deben implementarse correctamente usando el `adapter.js` para comunicarse con las APIs externas.

**Por que importa**: Estas funciones representan funcionalidad incompleta. Cuando el frontend React intente usarlas (a traves de endpoints API), la aplicacion lanzara un error 500.

**Archivos a consultar**:
- `backend/models/seda/milestone.js` (7 stubs en lineas: 183, 205, 233, 276, 298, 315, 329)
- `backend/models/seda/objective.js` (3 stubs en lineas: 38, 61, 106)
- `backend/models/seda/constraint.js` (4 stubs en lineas: 15, 41, 65, 109)
- `backend/models/seda/proposal.js` (1 stub en linea: 93)
- `backend/models/seda/project.js` (1 stub en linea: 271)
- `backend/models/seda/milestoneLog.js` (1 stub en linea: 9)
- `backend/models/adapter.js` (el cliente HTTP que las funciones deben llamar)
- `backend/config/adapter.config.js` (endpoints de las APIs externas)

**Criterios de aceptacion**:
- [ ] Cada funcion stub ahora llama al endpoint correcto del adapter
- [ ] Se manejan errores adecuadamente (try/catch con mensajes descriptivos)
- [ ] Las funciones devuelven datos en el formato esperado por los controladores
- [ ] Se documentan con JSDoc
- [ ] Se crean tests unitarios para al menos 5 funciones implementadas

---

#### TODO 14: Agregar tests E2E (End-to-End) con Playwright

**Que hacer**: Configurar Playwright e implementar tests que simulen el flujo completo de un usuario: registrarse, crear un proyecto, aprobar propuesta, etc.

**Que es un test E2E**: A diferencia de un test unitario (que prueba una funcion aislada), un test E2E abre un navegador real, hace clic en botones, rellena formularios y verifica que la pagina muestra lo esperado. Simula un usuario real.

**Por que importa**: Es la unica forma de verificar que frontend, backend y APIs externas funcionan correctamente juntos. Un test unitario puede pasar pero la app puede estar rota si los componentes no se integran bien.

**Archivos a consultar**:
- `frontend/src/App.tsx` (rutas de la aplicacion)
- `frontend/src/pages/auth/LoginPage.tsx` (primer flujo a testear)
- `frontend/src/pages/projects/ProjectsPage.tsx` (segundo flujo a testear)
- [Documentacion de Playwright](https://playwright.dev/docs/intro)

**Criterios de aceptacion**:
- [ ] Playwright esta instalado y configurado
- [ ] Existe un script `npm run test:e2e` en el frontend
- [ ] Al menos 3 flujos E2E implementados: login, ver proyectos, crear proyecto
- [ ] Los tests se pueden ejecutar contra el entorno de desarrollo
- [ ] Se incluye documentacion de como ejecutar los tests

---

#### TODO 15: Implementar paginacion y busqueda en la lista de proyectos

**Que hacer**: Agregar paginacion del lado del servidor y un campo de busqueda al endpoint `/api/projects` y a la pagina `ProjectsPage.tsx`.

**Por que importa**: Actualmente se cargan TODOS los proyectos de golpe. Con 100+ proyectos, esto sera lento y consumira mucha memoria. La paginacion carga solo una porcion (ej: 10 proyectos a la vez).

**Archivos a consultar**:
- `backend/routes/api/projects.js` (endpoint a modificar)
- `backend/models/seda/project.js` (funcion que obtiene proyectos)
- `frontend/src/pages/projects/ProjectsPage.tsx` (pagina a modificar)
- `frontend/src/hooks/useProjects.ts` (hook que obtiene datos)

**Criterios de aceptacion**:
- [ ] El endpoint acepta parametros `?page=1&limit=10&search=texto`
- [ ] La respuesta incluye metadatos: `{ data: [...], total: 45, page: 1, pages: 5 }`
- [ ] El frontend muestra controles de paginacion (anterior/siguiente, numeros de pagina)
- [ ] El campo de busqueda filtra por titulo o descripcion del proyecto
- [ ] React Query maneja la cache correctamente al cambiar de pagina

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
#   fix/eslint-warnings-backend
#   feat/zod-validation-create-project
#   docs/jsdoc-seda-budget

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
| `fix:` | Correccion de bug | `fix: resolve ESLint warnings in backend controllers` |
| `docs:` | Solo documentacion | `docs: add JSDoc to seda/budget.js` |
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

### Sobre las tecnologias del backend

| Recurso | URL | Descripcion |
|---------|-----|-------------|
| Express.js | [expressjs.com](https://expressjs.com/) | Framework web de Node.js |
| EJS | [ejs.co](https://ejs.co/) | Motor de plantillas |
| Sequelize | [sequelize.org](https://sequelize.org/) | ORM para bases de datos |
| Axios | [axios-http.com](https://axios-http.com/) | Cliente HTTP |

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
