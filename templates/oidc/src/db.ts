import pg from "pg";

// Laad .env in process.env (Node 20.12+/22) zodat DATABASE_URL beschikbaar is.
try { process.loadEnvFile(); } catch { /* geen .env-bestand: gebruik echte omgeving */ }

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
