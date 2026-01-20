CREATE TABLE "emergencies" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"tipo" varchar(50) NOT NULL,
	"titulo" text NOT NULL,
	"descripcion" text,
	"lat" numeric(11, 8) NOT NULL,
	"lng" numeric(11, 8) NOT NULL,
	"severidad" varchar(20) NOT NULL,
	"estado" varchar(20) NOT NULL,
	"fecha_inicio" timestamp NOT NULL,
	"fecha_actualizacion" timestamp DEFAULT NOW() NOT NULL,
	"fuente" varchar(100) NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "emergency_stats_daily" (
	"id" serial PRIMARY KEY NOT NULL,
	"fecha" timestamp NOT NULL,
	"total_emergencias" integer DEFAULT 0 NOT NULL,
	"sismos_count" integer DEFAULT 0 NOT NULL,
	"incendios_count" integer DEFAULT 0 NOT NULL,
	"alertas_count" integer DEFAULT 0 NOT NULL,
	"tsunamis_count" integer DEFAULT 0 NOT NULL,
	"severidad_critica" integer DEFAULT 0 NOT NULL,
	"severidad_alta" integer DEFAULT 0 NOT NULL,
	"severidad_media" integer DEFAULT 0 NOT NULL,
	"severidad_baja" integer DEFAULT 0 NOT NULL,
	"sismos_magnitud_max" real,
	"sismos_magnitud_avg" real,
	"incendios_superficie_total" real,
	"created_at" timestamp DEFAULT NOW() NOT NULL,
	CONSTRAINT "emergency_stats_daily_fecha_unique" UNIQUE("fecha")
);
--> statement-breakpoint
CREATE TABLE "hospitals" (
	"id" serial PRIMARY KEY NOT NULL,
	"osm_id" varchar(50) NOT NULL,
	"nombre" text NOT NULL,
	"tipo" varchar(50),
	"lat" numeric(11, 8) NOT NULL,
	"lng" numeric(11, 8) NOT NULL,
	"direccion" text,
	"telefono" varchar(50),
	"region" varchar(100),
	"comuna" varchar(100),
	"capacidad_camas" integer,
	"servicios" jsonb,
	"created_at" timestamp DEFAULT NOW() NOT NULL,
	"updated_at" timestamp DEFAULT NOW() NOT NULL,
	CONSTRAINT "hospitals_osm_id_unique" UNIQUE("osm_id")
);
--> statement-breakpoint
CREATE TABLE "refugios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"tipo" varchar(50) NOT NULL,
	"lat" numeric(11, 8) NOT NULL,
	"lng" numeric(11, 8) NOT NULL,
	"direccion" text,
	"capacidad" integer,
	"region" varchar(100),
	"comuna" varchar(100),
	"servicios" jsonb,
	"activo" integer DEFAULT 1 NOT NULL,
	"distancia_emergencia_mas_cercana" real,
	"fuente" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT NOW() NOT NULL,
	"updated_at" timestamp DEFAULT NOW() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weather_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"lat" numeric(11, 8) NOT NULL,
	"lng" numeric(11, 8) NOT NULL,
	"tipo" varchar(50) NOT NULL,
	"data" jsonb NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT NOW() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_emergencies_tipo" ON "emergencies" USING btree ("tipo");--> statement-breakpoint
CREATE INDEX "idx_emergencies_estado" ON "emergencies" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "idx_emergencies_fecha_actualizacion" ON "emergencies" USING btree ("fecha_actualizacion");--> statement-breakpoint
CREATE INDEX "idx_emergencies_lat_lng" ON "emergencies" USING btree ("lat","lng");--> statement-breakpoint
CREATE INDEX "idx_stats_fecha" ON "emergency_stats_daily" USING btree ("fecha");--> statement-breakpoint
CREATE INDEX "idx_hospitals_lat_lng" ON "hospitals" USING btree ("lat","lng");--> statement-breakpoint
CREATE INDEX "idx_hospitals_tipo" ON "hospitals" USING btree ("tipo");--> statement-breakpoint
CREATE INDEX "idx_hospitals_region" ON "hospitals" USING btree ("region");--> statement-breakpoint
CREATE INDEX "idx_refugios_lat_lng" ON "refugios" USING btree ("lat","lng");--> statement-breakpoint
CREATE INDEX "idx_refugios_tipo" ON "refugios" USING btree ("tipo");--> statement-breakpoint
CREATE INDEX "idx_refugios_activo" ON "refugios" USING btree ("activo");--> statement-breakpoint
CREATE INDEX "idx_refugios_region" ON "refugios" USING btree ("region");--> statement-breakpoint
CREATE INDEX "idx_weather_cache_lat_lng_tipo" ON "weather_cache" USING btree ("lat","lng","tipo");--> statement-breakpoint
CREATE INDEX "idx_weather_cache_expires_at" ON "weather_cache" USING btree ("expires_at");