import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let connectionString = process.env.DATABASE_URL!;

// Handle Supabase local development URLs
if (connectionString.includes("postgres:postgres@supabase_db_")) {
  const url = new URL(connectionString);
  url.hostname = url.hostname.split("_")[1];
  connectionString = url.href;
}

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);

export async function initializeDatabase() {
  try {
    await client`SELECT NOW()`;
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Error connecting to the database:", error);
    process.exit(1);
  }
}
