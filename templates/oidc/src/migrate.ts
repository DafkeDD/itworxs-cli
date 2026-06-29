import { pool } from "./db.js";

await pool.query(`
  CREATE TABLE IF NOT EXISTS oidc_payloads (
    id TEXT NOT NULL, model TEXT NOT NULL, payload JSONB NOT NULL,
    grant_id TEXT, user_code TEXT, uid TEXT, expires_at TIMESTAMPTZ,
    PRIMARY KEY (id, model)
  );
  CREATE INDEX IF NOT EXISTS idx_oidc_grant ON oidc_payloads (grant_id);
  CREATE INDEX IF NOT EXISTS idx_oidc_uid   ON oidc_payloads (uid);
  CREATE INDEX IF NOT EXISTS idx_oidc_uc    ON oidc_payloads (user_code);

  CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS pasport_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL, name TEXT, password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  -- Rol voor RBAC: 'superadmin' | 'admin' | 'user' (idempotent toevoegen).
  ALTER TABLE pasport_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
  -- Tot welke tenant de gebruiker behoort (superadmin overstijgt alle tenants).
  ALTER TABLE pasport_users ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
`);
console.log("migraties toegepast");
await pool.end();
