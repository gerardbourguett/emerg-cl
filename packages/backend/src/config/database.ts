import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
});

pool.on("error", (err: Error) => {
  console.error("Unexpected error on idle client", err);
});

export async function initializeDatabase() {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Error connecting to the database:", error);
    process.exit(1);
  }
}
