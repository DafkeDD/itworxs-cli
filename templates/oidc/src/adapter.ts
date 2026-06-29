import type { Adapter, AdapterPayload } from "oidc-provider";
import { pool } from "./db.js";

// Postgres-adapter: alle oidc-objecten in één key/value-tabel met expiry.
export class PostgresAdapter implements Adapter {
  constructor(private readonly name: string) {}

  async upsert(id: string, payload: AdapterPayload, expiresIn: number): Promise<void> {
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;
    await pool.query(
      `INSERT INTO oidc_payloads (id, model, payload, grant_id, user_code, uid, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id, model) DO UPDATE
       SET payload=$3, grant_id=$4, user_code=$5, uid=$6, expires_at=$7`,
      [id, this.name, payload, payload.grantId ?? null, payload.userCode ?? null, payload.uid ?? null, expiresAt],
    );
  }
  async find(id: string): Promise<AdapterPayload | undefined> {
    const { rows } = await pool.query(
      `SELECT payload FROM oidc_payloads WHERE id=$1 AND model=$2 AND (expires_at IS NULL OR expires_at > now())`, [id, this.name]);
    return rows[0]?.payload;
  }
  async findByUserCode(userCode: string): Promise<AdapterPayload | undefined> {
    const { rows } = await pool.query(
      `SELECT payload FROM oidc_payloads WHERE user_code=$1 AND model=$2 AND (expires_at IS NULL OR expires_at > now())`, [userCode, this.name]);
    return rows[0]?.payload;
  }
  async findByUid(uid: string): Promise<AdapterPayload | undefined> {
    const { rows } = await pool.query(
      `SELECT payload FROM oidc_payloads WHERE uid=$1 AND model=$2 AND (expires_at IS NULL OR expires_at > now())`, [uid, this.name]);
    return rows[0]?.payload;
  }
  async consume(id: string): Promise<void> {
    await pool.query(`UPDATE oidc_payloads SET payload = payload || jsonb_build_object('consumed', extract(epoch from now())) WHERE id=$1 AND model=$2`, [id, this.name]);
  }
  async destroy(id: string): Promise<void> {
    await pool.query(`DELETE FROM oidc_payloads WHERE id=$1 AND model=$2`, [id, this.name]);
  }
  async revokeByGrantId(grantId: string): Promise<void> {
    await pool.query(`DELETE FROM oidc_payloads WHERE grant_id=$1`, [grantId]);
  }
}
