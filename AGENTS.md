# Agent Architecture Guide

## Overview
This repository contains the full stack application for Emergencias Chile.
Monorepo using Bun Workspaces with TypeScript throughout.

## Project Structure
```
emergencias-chile-monorepo/
├── packages/
│   ├── backend/     # Hono API, PostgreSQL with PostGIS
│   └── frontend/    # React Router 7, Tailwind CSS v4, Leaflet maps
```

## Build, Run & Test Commands

### Root Level
```bash
bun install                    # Install all workspace dependencies
```

### Backend (packages/backend)
```bash
bun run dev                    # Start dev server with hot reload
bun run start                  # Start production server
bun run --hot src/index.ts     # Explicit hot reload
```

### Frontend (packages/frontend)
```bash
bun run dev                    # Start dev server
bun run build                  # Build for production
bun run start                  # Serve production build
bun run typecheck              # Run TypeScript type checking
```

### Testing
**Note**: No test infrastructure currently exists. When adding tests:
- Use Bun's built-in test runner: `bun test`
- Run single test file: `bun test path/to/test.ts`
- Run with pattern: `bun test --test-name-pattern "pattern"`

## Code Style Guidelines

### TypeScript Configuration
- **Strict mode enabled**: All code must pass strict TypeScript checks
- **No implicit any**: Always provide explicit types
- **Prefer interfaces** over type aliases for object shapes
- Use `type` for unions, intersections, and utility types

### Imports & Exports

#### Import Order
```typescript
// 1. External libraries
import { Hono } from "hono";
import { cors } from "hono/cors";

// 2. Internal absolute imports (backend services)
import { pool } from "../config/database";
import { Emergency } from "../types/emergency";

// 3. Internal relative imports
import type { Route } from "./+types/home";
```

#### Export Patterns
```typescript
// Named exports for utilities, services, types
export async function saveEmergency() { }
export class SenapredService { }
export interface Emergency { }

// Default exports for React components only
export default function HomePage() { }

// Use 'as const' for constant objects
export const SEVERITY_COLORS = { } as const;
```

### Naming Conventions

#### Files & Directories
- **Components**: `PascalCase.tsx` (e.g., `MapControls.tsx`, `AlertsTicker.tsx`)
- **Services**: `lowercase.ts` (e.g., `database.ts`, `senapred.ts`)
- **Types**: `lowercase.ts` (e.g., `emergency.ts`)
- **Routes**: `lowercase.tsx` (e.g., `home.tsx`)
- **Client-only components**: `.client.tsx` suffix (e.g., `Map.client.tsx`)

#### Code Identifiers
```typescript
// Variables & functions: camelCase
const emergencies = [];
async function loadEmergencies() { }

// Constants: SCREAMING_SNAKE_CASE
const EMERGENCY_ICONS = { };

// Classes & interfaces: PascalCase
export class SenapredService { }
export interface Emergency { }

// Props interfaces: {ComponentName}Props
interface MapControlsProps { }

// Database fields: snake_case
// fecha_inicio, fecha_actualizacion, incendio_forestal
```

### React Component Structure

```typescript
// 1. Type/interface imports with 'type' keyword
import type { Emergency } from "../../types/emergency";

// 2. Props interface
interface MapControlsProps {
  emergencies: Emergency[];
  onFilterChange: (filter: string) => void;
}

// 3. Component definition (functional only)
export function MapControls({ emergencies, onFilterChange }: MapControlsProps) {
  // 4. Hooks (state first, then effects)
  const [collapsed, setCollapsed] = useState(false);
  
  useEffect(() => {
    // side effects
  }, [dependencies]);
  
  // 5. Derived values & handlers
  const counts = emergencies.filter(e => e.tipo === "seismo").length;
  
  // 6. Early returns for loading/error states
  if (!emergencies) return null;
  
  // 7. JSX return
  return <div>...</div>;
}

// 8. Sub-components (if needed in same file)
function StatBadge({ label, count }: { label: string; count: number }) {
  return <span>{count}</span>;
}

// 9. Default export (if main component)
export default MapControls;
```

### Backend API Patterns

#### Hono Routes
```typescript
export const emergenciasRouter = new Hono();

// Validate query params before processing
emergenciasRouter.get("/radio", async (c) => {
  const lat = parseFloat(c.req.query("lat") || "0");
  
  if (!lat || !lng) {
    return c.json({ error: "lat y lng requeridos" }, 400);
  }
  
  const data = await getEmergenciesByRadius(lat, lng);
  return c.json({ emergencies: data });
});
```

#### Service Classes
```typescript
// Use static methods for stateless services
export class SenapredService {
  static async getAlbergues() {
    try {
      const response = await fetch("...");
      return await response.json();
    } catch (error) {
      console.error("Error scraping albergues:", error);
      return []; // Return empty array on error
    }
  }
}
```

### Error Handling

#### Backend
```typescript
// Try-catch with console logging, graceful degradation
try {
  const data = await scrapeSismosChile();
  console.log(`✓ Sismos: ${data.length} guardados`);
} catch (error) {
  console.error("✗ Scraper sismos falló:", error);
  // Don't crash - return empty/fallback
  return [];
}
```

#### Frontend
```typescript
// ErrorBoundary in route components
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <div>Error: {error.message}</div>;
}

// Fetch with error handling
try {
  const response = await fetch("/api/emergencias");
  if (!response.ok) throw new Error("Failed to fetch");
  const data = await response.json();
} catch (err) {
  console.error("Failed to load emergencies", err);
}
```

## Special Considerations

### Spanish Context
- User-facing text is in Spanish
- Many variable names use Spanish (sismos, incendios, albergues)
- API responses and database fields use Spanish naming

### Database
- PostgreSQL with PostGIS extension for geospatial queries
- Use parameterized queries: `pool.query(sql, [$1, $2])`
- Upsert pattern: `INSERT ... ON CONFLICT DO UPDATE`

### State Management
- Use React hooks (useState, useEffect) - no external state library
- Lift state up when sharing between components
- Use context sparingly for deeply nested props

### Styling
- Tailwind CSS v4 with utility classes
- Inline styles for dynamic colors from data
- No CSS modules or styled-components

## Subagents
When working on specific parts of the application, refer to:

### Backend Agent
- **Location**: `packages/backend`
- **Context**: `packages/backend/AGENT_CONTEXT.md`
- **Focus**: Hono API, Database migrations, PostGIS, scrapers

### Frontend Agent
- **Location**: `packages/frontend`
- **Context**: `packages/frontend/AGENT_CONTEXT.md`
- **Focus**: React Router 7, Tailwind styling, Leaflet/React-Leaflet maps
