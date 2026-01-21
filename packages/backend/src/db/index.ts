import { drizzle } from "drizzle-orm/postgres-js";
import { client } from "../config/database";
import * as schema from "./schema";

// Create Drizzle instance with schema
export const db = drizzle(client, { schema });

// Re-export schema for convenience
export * from "./schema";
