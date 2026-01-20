# Emergencias Chile - API de Monitoreo de Emergencias

## Descripción

Sistema de monitoreo de emergencias en Chile que agrega datos de múltiples fuentes oficiales (CONAF, SENAPRED) y los expone mediante una API REST con soporte geoespacial.

## Stack Tecnológico

- **Runtime:** Bun
- **Framework:** Hono (minimalista, similar a Express)
- **Base de Datos:** PostgreSQL + PostGIS (geoespacial)
- **Hosting DB:** Supabase
- **Lenguaje:** TypeScript

## Estructura del Proyecto

```
emergencias-chile/
├── src/
│   ├── config/
│   │   └── database.ts          # Conexión a PostgreSQL
│   ├── routes/
│   │   └── emergencias.ts       # Endpoints de la API
│   ├── services/
│   │   ├── database.ts          # Funciones de acceso a datos
│   │   └── scrapers/
│   │       ├── conaf.ts         # Scraper de incendios (CONAF)
│   │       └── senapred.ts      # Scraper de alertas (SENAPRED)
│   ├── types/
│   │   └── emergency.ts         # Tipos TypeScript
│   └── index.ts                 # Punto de entrada
├── package.json
├── tsconfig.json
└── .env                         # Variables de entorno (no commitear)
```

## Configuración

### Variables de Entorno (.env)

```env
DATABASE_URL=postgresql://usuario:password@host:5432/database
NODE_ENV=development
```

**IMPORTANTE:** Si la contraseña contiene caracteres especiales (`@`, `#`, `^`, `!`, etc.), deben ser URL-encoded:
- `@` → `%40`
- `#` → `%23`
- `^` → `%5E`
- `!` → `%21`
- `:` → `%3A`
- `/` → `%2F`

### Base de Datos

Requiere PostgreSQL con extensión PostGIS. Ejecutar en Supabase SQL Editor:

```sql
-- Habilitar PostGIS (si no está habilitado)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Crear tabla de emergencias
CREATE TABLE IF NOT EXISTS emergencies (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  ubicacion geography(POINT, 4326),
  severidad TEXT DEFAULT 'media',
  estado TEXT DEFAULT 'activo',
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fuente TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_emergencies_tipo ON emergencies(tipo);
CREATE INDEX IF NOT EXISTS idx_emergencies_estado ON emergencies(estado);
CREATE INDEX IF NOT EXISTS idx_emergencies_ubicacion ON emergencies USING GIST(ubicacion);
CREATE INDEX IF NOT EXISTS idx_emergencies_fecha ON emergencies(fecha_actualizacion DESC);
```

## Comandos

```bash
# Instalar dependencias
bun install

# Ejecutar en desarrollo (hot reload)
bun run dev

# Ejecutar directamente
bun run src/index.ts
```

## API Endpoints

### Health Check
```
GET /health
Response: { "status": "ok" }
```

### Obtener Emergencias Activas
```
GET /api/emergencias/
Response: { "emergencies": [...], "count": N }
```

### Buscar por Radio
```
GET /api/emergencias/radio?lat=-33.45&lng=-70.66&radio=50
Parámetros:
  - lat: latitud (requerido)
  - lng: longitud (requerido)
  - radio: kilómetros (opcional, default: 50)
```

### Buscar por Tipo
```
GET /api/emergencias/tipo/:tipo
Tipos válidos: incendio_forestal, seismo, tsunami, alerta_meteorologica
```

## Fuentes de Datos

| Fuente | URL | Tipo de Emergencia | Estado |
|--------|-----|-------------------|--------|
| Sismos Chile (CSN) | `api.gael.cloud/general/public/sismos` | Sismos | ✅ Activo |
| NASA FIRMS | `firms.modaps.eosdis.nasa.gov/api/` | Incendios (satelital) | ✅ Activo |
| SENAPRED Telegram | `t.me/s/SenapredChile` | Alertas/Evacuaciones | ✅ Activo |
| CONAF Power BI | `app.powerbi.com/view?r=...` | Incendios forestales | ⚠️ Solo visual |

### NASA FIRMS (Focos de calor satelitales)
- Datos del satélite VIIRS de NASA
- Detecta focos de calor en tiempo casi-real
- Cobertura: Todo Chile (-75,-56 a -66,-17)
- Actualización: Cada pasada del satélite (~2 veces/día)
- Límite: 5000 transacciones / 10 minutos

### Obtener API key de NASA FIRMS
1. Ir a https://firms.modaps.eosdis.nasa.gov/api/
2. Registrarse con email
3. Agregar `FIRMS_API_KEY=tu_key` al `.env`

### SENAPRED Telegram
- Scraping del canal público https://t.me/s/SenapredChile
- Extrae alertas de evacuación y emergencias
- Geocodifica automáticamente comunas chilenas a coordenadas
- Detecta tipo de emergencia y severidad del mensaje

## Tipos de Emergencia

- `incendio_forestal` - Incendios forestales
- `seismo` - Sismos y terremotos
- `tsunami` - Alertas de tsunami
- `alerta_meteorologica` - Alertas meteorológicas

## Niveles de Severidad

- `baja` - Emergencia menor
- `media` - Emergencia moderada
- `alta` - Emergencia significativa
- `critica` - Emergencia crítica

## Estados

- `activo` - Emergencia en curso
- `monitoreo` - Bajo vigilancia
- `controlado` - Bajo control
- `extinguido` - Finalizado

## Problemas Conocidos

1. **URL de conexión:** Caracteres especiales en contraseña deben estar URL-encoded
2. **SENAPRED scraper:** Usa coordenadas placeholder, necesita geocodificación real
3. **Scrapers:** Configurados pero el guardado a BD está comentado (línea 31 de index.ts)

## Desarrollo

El servidor corre en `http://localhost:3000` por defecto.

Los scrapers se ejecutan cada 5 minutos automáticamente al iniciar el servidor.
