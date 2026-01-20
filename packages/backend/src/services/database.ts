import { pool } from "../config/database";
import { Emergency } from "../types/emergency";

export async function saveEmergency(emergency: Emergency) {
  const query = `
    INSERT INTO emergencies 
    (id, tipo, titulo, descripcion, lat, lng, severidad, 
     estado, fecha_inicio, fecha_actualizacion, fuente, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (id) DO UPDATE SET
      metadata = EXCLUDED.metadata,
      fecha_actualizacion = EXCLUDED.fecha_actualizacion,
      estado = EXCLUDED.estado,
      severidad = EXCLUDED.severidad
    RETURNING *;
  `;

  const result = await pool.query(query, [
    emergency.id,
    emergency.tipo,
    emergency.titulo,
    emergency.descripcion,
    emergency.lat,
    emergency.lng,
    emergency.severidad,
    emergency.estado,
    emergency.fecha_inicio,
    emergency.fecha_actualizacion,
    emergency.fuente,
    JSON.stringify(emergency.metadata),
  ]);

  return result.rows[0];
}

export async function getEmergenciesByRadius(
  lat: number,
  lng: number,
  radiusKm: number = 50,
) {
  // Simple distance calculation without PostGIS (Haversine approximation)
  const query = `
    SELECT id, tipo, titulo, descripcion, lat, lng,
           severidad, estado, fecha_actualizacion, fuente,
           (6371 * ACOS(
             COS(RADIANS($2)) * COS(RADIANS(lat)) * 
             COS(RADIANS(lng) - RADIANS($3)) + 
             SIN(RADIANS($2)) * SIN(RADIANS(lat))
           )) AS distance_km
    FROM emergencies
    WHERE fecha_actualizacion > NOW() - INTERVAL '7 days'
    HAVING (6371 * ACOS(
      COS(RADIANS($2)) * COS(RADIANS(lat)) * 
      COS(RADIANS(lng) - RADIANS($3)) + 
      SIN(RADIANS($2)) * SIN(RADIANS(lat))
    )) < $1
    ORDER BY distance_km ASC;
  `;

  const result = await pool.query(query, [radiusKm, lat, lng]);
  return result.rows;
}

export async function getEmergenciesByType(tipo: string) {
  const query = `
    SELECT id, tipo, titulo, descripcion, lat, lng,
           severidad, estado, fecha_actualizacion, fuente, metadata
    FROM emergencies
    WHERE tipo = $1
    AND estado != 'extinguido'
    AND fecha_actualizacion > NOW() - INTERVAL '7 days'
    ORDER BY fecha_actualizacion DESC;
  `;

  const result = await pool.query(query, [tipo]);
  return result.rows;
}
