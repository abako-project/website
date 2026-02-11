# Abako Frontend

React + TypeScript + Vite frontend for the Abako/Work3Spaces platform.

## Phase 0: Infrastructure Setup

This is the initial scaffold created as part of Phase 0 of the Express+EJS to React SPA migration.

### Tech Stack

- **React 18.3** - UI library
- **TypeScript 5.7** - Type safety
- **Vite 6** - Build tool and dev server
- **TanStack Query 5** - Server state management
- **Zustand 5** - Client state management
- **React Router 6** - Client-side routing
- **Radix UI** - Accessible component primitives
- **Tailwind CSS 3.4** - Utility-first styling
- **dnd-kit** - Drag and drop functionality
- **Axios** - HTTP client
- **React Hook Form + Zod** - Form validation
- **Sonner** - Toast notifications
- **Lucide React** - Icon library

### Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── api/            # API client and endpoints
│   │   ├── client.ts   # Axios instance with interceptors
│   │   ├── endpoints/  # API endpoint functions
│   │   └── hooks/      # React Query hooks
│   ├── components/
│   │   ├── ui/         # shadcn/ui primitives
│   │   ├── layouts/    # Layout components
│   │   ├── features/   # Feature-specific components
│   │   └── shared/     # Shared components
│   ├── stores/         # Zustand stores
│   ├── lib/            # Utility functions
│   ├── types/          # TypeScript type definitions
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── routes/         # Route configuration
│   ├── App.tsx         # Root component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── index.html          # HTML entry point
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # Tailwind configuration
└── package.json        # Dependencies
```

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```
   The app will be available at http://localhost:5173

3. The Vite dev server proxies API calls to the Express backend at http://localhost:3001

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Lint code with ESLint
- `npm run test` - Run tests with Vitest
- `npm run test:ui` - Run tests with UI
- `npm run test:e2e` - Run end-to-end tests with Playwright

### Path Aliases

The following path aliases are configured:

- `@/` → `src/`
- `@api/` → `src/api/`
- `@components/` → `src/components/`
- `@stores/` → `src/stores/`
- `@lib/` → `src/lib/`
- `@types/` → `src/types/`
- `@hooks/` → `src/hooks/`
- `@pages/` → `src/pages/`

### API Proxy Configuration

During development, Vite proxies these routes to the Express backend:

- `/api/*` → http://localhost:3001
- `/clients/*/attachment` → http://localhost:3001
- `/developers/*/attachment` → http://localhost:3001

### Environment Variables

Create a `.env.local` file with:

```
VITE_API_BASE_URL=
VITE_BACKEND_URL=https://dev.abako.xyz
```

### Migration Phases

- **Phase 0** (Current): Infrastructure setup
- **Phase 1**: API layer integration
- **Phase 2**: Authentication flow
- **Phase 3**: Dashboard implementation
- **Phase 4**: Projects and milestones
- **Phase 5**: Profiles (clients/developers)
- **Phase 6**: Payments

### Notes

- This is a skeleton implementation. Most components are placeholders.
- Authentication logic will be added in Phase 2.
- API endpoints will be implemented in Phase 1.
- The Express backend continues to serve the existing EJS views during migration.
