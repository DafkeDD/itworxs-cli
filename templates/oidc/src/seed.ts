import { pool } from "./db.js";
import { hashPassword } from "./passwords.js";

// Twee tenants.
async function upsertTenant(slug: string, name: string): Promise<string> {
  const { rows } = await pool.query(
    `INSERT INTO tenants (slug, name) VALUES ($1,$2)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [slug, name],
  );
  return rows[0].id as string;
}

// Eén gebruiker (idempotent op e-mail).
async function upsertUser(email: string, name: string, role: string, tenantId: string | null) {
  await pool.query(
    `INSERT INTO pasport_users (email, name, password_hash, role, tenant_id)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, tenant_id = EXCLUDED.tenant_id`,
    [email, name, hashPassword("Welkom123!"), role, tenantId],
  );
}

const tenantA = await upsertTenant("tenant-a", "Tenant A");
const tenantB = await upsertTenant("tenant-b", "Tenant B");

// superadmin: tenant_id mag null — overstijgt alle tenants.
await upsertUser("super@pasport.local", "Super Admin", "superadmin", null);
await upsertUser("admin-a@pasport.local", "Admin A", "admin", tenantA);
await upsertUser("user-a@pasport.local", "Gebruiker A", "user", tenantA);
await upsertUser("admin-b@pasport.local", "Admin B", "admin", tenantB);

console.log("seed klaar — wachtwoord voor iedereen: Welkom123!");
console.log("  super@pasport.local    superadmin   (alle tenants)");
console.log("  admin-a@pasport.local  admin        Tenant A");
console.log("  user-a@pasport.local   user         Tenant A");
console.log("  admin-b@pasport.local  admin        Tenant B");
await pool.end();
