import { drizzle } from "drizzle-orm/node-postgres";
import { pool } from "../config/database";
import * as schema from "./schema";

// Create Drizzle instance with schema
export const db = drizzle({ client: pool, schema });

// Re-export schema for convenience
export * from "./schema";
