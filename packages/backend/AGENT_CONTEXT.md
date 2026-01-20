# Backend Context

## Architecture
- Framework: Hono
- Runtime: Bun
- Database: Postgres with PostGIS

## Key Files
- `src/index.ts`: Entry point.
- `src/db.ts`: Database connection.

## Common Tasks
- Add new route: Create file in `src/routes/` and register in `src/index.ts`.
- Database change: Create migration script.
