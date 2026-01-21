import { pgTable, text, timestamp, numeric, varchar, jsonb, index, serial, integer, real } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Emergencies Table - Main table for all emergency events
 * Stores: sismos, incendios forestales, alertas meteorológicas, tsunamis
 */
export const emergencies = pgTable(
  "emergencies",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    tipo: varchar("tipo", { length: 50 }).notNull(),
    titulo: text("titulo").notNull(),
    descripcion: text("descripcion"),
    lat: numeric("lat", { precision: 11, scale: 8 }).notNull(),
    lng: numeric("lng", { precision: 11, scale: 8 }).notNull(),
    severidad: varchar("severidad", { length: 20 }).notNull(),
    estado: varchar("estado", { length: 20 }).notNull(),
    fecha_inicio: timestamp("fecha_inicio").notNull(),
    fecha_actualizacion: timestamp("fecha_actualizacion").notNull().default(sql`NOW()`),
    fuente: varchar("fuente", { length: 100 }).notNull(),
    metadata: jsonb("metadata"),
  },
  (table) => ({
    tipoIdx: index("idx_emergencies_tipo").on(table.tipo),
    estadoIdx: index("idx_emergencies_estado").on(table.estado),
    fechaActualizacionIdx: index("idx_emergencies_fecha_actualizacion").on(table.fecha_actualizacion),
    latLngIdx: index("idx_emergencies_lat_lng").on(table.lat, table.lng),
  })
);

/**
 * Hospitals Table - Healthcare facilities from OpenStreetMap
 * Populated via Overpass API
 */
export const hospitals = pgTable(
  "hospitals",
  {
    id: serial("id").primaryKey(),
    osm_id: varchar("osm_id", { length: 50 }).unique().notNull(),
    nombre: text("nombre").notNull(),
    tipo: varchar("tipo", { length: 50 }), // hospital, clinic, emergency, etc.
    lat: numeric("lat", { precision: 11, scale: 8 }).notNull(),
    lng: numeric("lng", { precision: 11, scale: 8 }).notNull(),
    direccion: text("direccion"),
    telefono: varchar("telefono", { length: 50 }),
    region: varchar("region", { length: 100 }),
    comuna: varchar("comuna", { length: 100 }),
    capacidad_camas: integer("capacidad_camas"),
    servicios: jsonb("servicios"), // emergency, intensive_care, surgery, etc.
    created_at: timestamp("created_at").notNull().default(sql`NOW()`),
    updated_at: timestamp("updated_at").notNull().default(sql`NOW()`),
  },
  (table) => ({
    latLngIdx: index("idx_hospitals_lat_lng").on(table.lat, table.lng),
    tipoIdx: index("idx_hospitals_tipo").on(table.tipo),
    regionIdx: index("idx_hospitals_region").on(table.region),
  })
);

/**
 * Refugios (Safe Zones) Table
 * Combination of SENAPRED official refugios + calculated safe zones
 */
export const refugios = pgTable(
  "refugios",
  {
    id: serial("id").primaryKey(),
    nombre: text("nombre").notNull(),
    tipo: varchar("tipo", { length: 50 }).notNull(), // oficial, calculado
    lat: numeric("lat", { precision: 11, scale: 8 }).notNull(),
    lng: numeric("lng", { precision: 11, scale: 8 }).notNull(),
    direccion: text("direccion"),
    capacidad: integer("capacidad"),
    region: varchar("region", { length: 100 }),
    comuna: varchar("comuna", { length: 100 }),
    servicios: jsonb("servicios"), // agua, electricidad, baños, comida, etc.
    activo: integer("activo").notNull().default(1), // 0 = inactivo, 1 = activo
    distancia_emergencia_mas_cercana: real("distancia_emergencia_mas_cercana"), // en km
    fuente: varchar("fuente", { length: 100 }).notNull(), // SENAPRED, calculated
    created_at: timestamp("created_at").notNull().default(sql`NOW()`),
    updated_at: timestamp("updated_at").notNull().default(sql`NOW()`),
  },
  (table) => ({
    latLngIdx: index("idx_refugios_lat_lng").on(table.lat, table.lng),
    tipoIdx: index("idx_refugios_tipo").on(table.tipo),
    activoIdx: index("idx_refugios_activo").on(table.activo),
    regionIdx: index("idx_refugios_region").on(table.region),
  })
);

/**
 * Emergency Stats Daily - Aggregated daily statistics
 * For historical dashboard and trend analysis
 */
export const emergencyStatsDaily = pgTable(
  "emergency_stats_daily",
  {
    id: serial("id").primaryKey(),
    fecha: timestamp("fecha").notNull().unique(),
    total_emergencias: integer("total_emergencias").notNull().default(0),
    sismos_count: integer("sismos_count").notNull().default(0),
    incendios_count: integer("incendios_count").notNull().default(0),
    alertas_count: integer("alertas_count").notNull().default(0),
    tsunamis_count: integer("tsunamis_count").notNull().default(0),
    severidad_critica: integer("severidad_critica").notNull().default(0),
    severidad_alta: integer("severidad_alta").notNull().default(0),
    severidad_media: integer("severidad_media").notNull().default(0),
    severidad_baja: integer("severidad_baja").notNull().default(0),
    sismos_magnitud_max: real("sismos_magnitud_max"),
    sismos_magnitud_avg: real("sismos_magnitud_avg"),
    incendios_superficie_total: real("incendios_superficie_total"), // hectáreas
    created_at: timestamp("created_at").notNull().default(sql`NOW()`),
  },
  (table) => ({
    fechaIdx: index("idx_stats_fecha").on(table.fecha),
  })
);

/**
 * Emergencies Archive - Historical emergency data
 * Stores emergencies older than 24 hours for historical analysis
 */
export const emergenciesArchive = pgTable(
  "emergencies_archive",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    tipo: varchar("tipo", { length: 50 }).notNull(),
    titulo: text("titulo").notNull(),
    descripcion: text("descripcion"),
    lat: numeric("lat", { precision: 11, scale: 8 }).notNull(),
    lng: numeric("lng", { precision: 11, scale: 8 }).notNull(),
    severidad: varchar("severidad", { length: 20 }).notNull(),
    estado: varchar("estado", { length: 20 }).notNull(),
    fecha_inicio: timestamp("fecha_inicio").notNull(),
    fecha_actualizacion: timestamp("fecha_actualizacion").notNull(),
    fuente: varchar("fuente", { length: 100 }).notNull(),
    metadata: jsonb("metadata"),
    archived_at: timestamp("archived_at").notNull().default(sql`NOW()`),
  },
  (table) => ({
    tipoIdx: index("idx_archive_tipo").on(table.tipo),
    fechaInicioIdx: index("idx_archive_fecha_inicio").on(table.fecha_inicio),
    archivedAtIdx: index("idx_archive_archived_at").on(table.archived_at),
  })
);

/**
 * Weather Cache - Cache for OpenWeatherMap API calls
 * Reduces API calls and improves performance
 */
export const weatherCache = pgTable(
  "weather_cache",
  {
    id: serial("id").primaryKey(),
    lat: numeric("lat", { precision: 11, scale: 8 }).notNull(),
    lng: numeric("lng", { precision: 11, scale: 8 }).notNull(),
    tipo: varchar("tipo", { length: 50 }).notNull(), // current, uv, air_quality
    data: jsonb("data").notNull(),
    expires_at: timestamp("expires_at").notNull(),
    created_at: timestamp("created_at").notNull().default(sql`NOW()`),
  },
  (table) => ({
    latLngTipoIdx: index("idx_weather_cache_lat_lng_tipo").on(table.lat, table.lng, table.tipo),
    expiresAtIdx: index("idx_weather_cache_expires_at").on(table.expires_at),
  })
);

// Type exports for use in services
export type Emergency = typeof emergencies.$inferSelect;
export type EmergencyInsert = typeof emergencies.$inferInsert;
export type Hospital = typeof hospitals.$inferSelect;
export type HospitalInsert = typeof hospitals.$inferInsert;
export type Refugio = typeof refugios.$inferSelect;
export type RefugioInsert = typeof refugios.$inferInsert;
export type EmergencyStatsDaily = typeof emergencyStatsDaily.$inferSelect;
export type EmergencyStatsDailyInsert = typeof emergencyStatsDaily.$inferInsert;
export type WeatherCache = typeof weatherCache.$inferSelect;
export type WeatherCacheInsert = typeof weatherCache.$inferInsert;
export type EmergencyArchive = typeof emergenciesArchive.$inferSelect;
export type EmergencyArchiveInsert = typeof emergenciesArchive.$inferInsert;

