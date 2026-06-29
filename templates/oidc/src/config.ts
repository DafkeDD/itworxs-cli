import { readFileSync } from "node:fs";
import type { Configuration } from "oidc-provider";
import { pool } from "./db.js";

const jwks = JSON.parse(readFileSync(new URL("../jwks.json", import.meta.url), "utf8"));

export const configuration: Configuration = {
  jwks,

  async findAccount(_ctx, id) {
    const { rows } = await pool.query("SELECT id, email, name FROM pasport_users WHERE id=$1", [id]);
    const user = rows[0];
    if (!user) return undefined;
    return {
      accountId: id,
      async claims() {
        return { sub: id, email: user.email, email_verified: true, name: user.name };
      },
    };
  },

  // Voegt rol + tenant van de gebruiker toe aan het JWT-access token, zodat de
  // backend er multi-tenant RBAC op kan doen.
  async extraTokenClaims(_ctx, token) {
    const t = token as unknown as { kind?: string; accountId?: string };
    if (t.kind !== "AccessToken" || !t.accountId) return undefined;
    const { rows } = await pool.query(
      "SELECT role, tenant_id, email, name FROM pasport_users WHERE id=$1", [t.accountId]);
    const row = rows[0];
    if (!row) return undefined;
    return {
      roles: [row.role as string],
      tenant_id: (row.tenant_id as string | null) ?? null,
      email: row.email as string,
      name: row.name as string,
    };
  },

  // Aangesloten apps (publieke PKCE-clients). Elke app = eigen client_id +
  // eigen redirect/poort, maar dezelfde Pasport -> Single Sign-On.
  clients: [
    {
      client_id: "pasport-web",
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token", "password"],
      response_types: ["code"],
      redirect_uris: ["http://localhost:3000/api/auth/callback"],
      post_logout_redirect_uris: ["http://localhost:3000/"],
    },
    {
      client_id: "planning-web",
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      redirect_uris: ["http://localhost:3001/api/auth/callback"],
      post_logout_redirect_uris: ["http://localhost:3001/"],
    },
  ],

  interactions: { url: (_ctx, interaction) => `/interaction/${interaction.uid}` },

  // Sta een 'screen'-hint toe op /auth (bv. screen=register) zodat de app
  // direct de registratiepagina kan openen.
  extraParams: ["screen"],

  features: {
    devInteractions: { enabled: false },
    resourceIndicators: {
      enabled: true,
      defaultResource: () => "http://localhost:4000/api",
      useGrantedResource: () => true,
      getResourceServerInfo: () => ({
        scope: "openid profile email",
        audience: "pasport-api",
        accessTokenFormat: "jwt",
        accessTokenTTL: 60 * 60,
      }),
    },
    rpInitiatedLogout: {
      enabled: true,
      // Naadloos uitloggen: geen bevestigingspagina, meteen doorsturen.
      logoutSource(ctx, form) {
        ctx.body = `<!doctype html><html><head><meta charset="utf-8"><title>Uitloggen…</title></head>
<body>${form}<script>
  var f = document.forms[0];
  var i = document.createElement('input');
  i.type = 'hidden'; i.name = 'logout'; i.value = 'yes';
  f.appendChild(i); f.submit();
</script></body></html>`;
      },
    },
  },

  claims: {
    openid: ["sub"],
    email: ["email", "email_verified"],
    profile: ["name"],
  },

  cookies: { keys: [process.env.COOKIE_SECRET || "dev-cookie-secret-change-me"] },

  // Expliciete vervaltijden (seconden) — voorkomt de ttl-NOTICE's.
  ttl: {
    AccessToken: 60 * 60,
    IdToken: 60 * 60,
    Session: 24 * 60 * 60,
    Interaction: 60 * 60,
    Grant: 24 * 60 * 60,
  },
};
