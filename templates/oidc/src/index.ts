import express from "express";
import Provider, { errors } from "oidc-provider";
import { configuration } from "./config.js";
import { PostgresAdapter } from "./adapter.js";
import { pool } from "./db.js";
import { verifyPassword, hashPassword } from "./passwords.js";
import { loginPage, registerPage, idpPlaceholder } from "./login-page.js";

const ISSUER = process.env.ISSUER || "http://localhost:9000";
const PORT = Number(process.env.PORT || 9000);

const config = { ...configuration };
if (process.env.DATABASE_URL) config.adapter = PostgresAdapter;

const provider = new Provider(ISSUER, config);
provider.proxy = true;

// Password grant (ROPC): laat de app credentials server-side inwisselen voor
// tokens, zonder redirect. Geeft een JWT-access token gericht op de API-resource.
const RESOURCE = "http://localhost:4000/api";
provider.registerGrantType(
  "password",
  async (ctx: any, next: any) => {
    const { client } = ctx.oidc;
    const { username, password, scope } = ctx.oidc.params as { username?: string; password?: string; scope?: string };
    if (!username || !password) throw new errors.InvalidGrant("ontbrekende gegevens");
    const { rows } = await pool.query("SELECT id, password_hash FROM pasport_users WHERE email=$1", [username]);
    const user = rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) throw new errors.InvalidGrant("onjuiste e-mail of wachtwoord");

    const AccessToken = (provider as any).AccessToken;
    const at = new AccessToken({ accountId: user.id, client, scope: scope || "openid profile email" });
    at.resourceServer = {
      identifier: RESOURCE,
      audience: "pasport-api",
      accessTokenFormat: "jwt",
      accessTokenTTL: 60 * 60,
      scope: "openid profile email",
    };
    const accessToken = await at.save();
    ctx.body = { access_token: accessToken, token_type: "Bearer", expires_in: 3600, scope: at.scope };
    await next();
  },
  ["username", "password", "scope"],
);

const app = express();

// Body-parser alleen op de login-route (niet globaal) — zo botst hij niet met
// de eigen parser van oidc-provider.
const parseForm = express.urlencoded({ extended: false });

app.get("/interaction/:uid", async (req, res, next) => {
  try {
    const details = await provider.interactionDetails(req, res);
    const { prompt, params, session } = details;

    if (prompt.name === "login") {
      // De app kan met screen=register meteen de registratiepagina openen.
      if ((params as { screen?: string }).screen === "register") {
        return res.send(registerPage({ uid: details.uid }));
      }
      return res.send(loginPage({ uid: details.uid }));
    }

    if (prompt.name === "consent") {
      const accountId = session!.accountId;
      const grant = new provider.Grant({ accountId, clientId: params.client_id as string });
      const d = prompt.details as {
        missingOIDCScope?: string[]; missingOIDCClaims?: string[];
        missingResourceScopes?: Record<string, string[]>;
      };
      if (d.missingOIDCScope) grant.addOIDCScope(d.missingOIDCScope.join(" "));
      if (d.missingOIDCClaims) grant.addOIDCClaims(d.missingOIDCClaims);
      if (d.missingResourceScopes) {
        for (const [indicator, scopes] of Object.entries(d.missingResourceScopes)) {
          grant.addResourceScope(indicator, scopes.join(" "));
        }
      }
      const grantId = await grant.save();
      return provider.interactionFinished(req, res, { consent: { grantId } }, { mergeWithLastSubmission: true });
    }
    return res.sendStatus(400);
  } catch (e) { next(e); }
});

// Toon de loginpagina expliciet (voor "terug"/"al een account?"-links).
app.get("/interaction/:uid/login-page", (req, res) => {
  res.send(loginPage({ uid: req.params.uid }));
});

// Toon de registratiepagina.
app.get("/interaction/:uid/register", (req, res) => {
  res.send(registerPage({ uid: req.params.uid }));
});

// Verwerk registratie: maak account aan en log meteen in.
app.post("/interaction/:uid/register", parseForm, async (req, res, next) => {
  try {
    const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
    if (!name || !email || !password || password.length < 8) {
      return res.status(400).send(registerPage({ uid: req.params.uid, error: "Vul naam, e-mail en een wachtwoord (min. 8 tekens) in." }));
    }
    const exists = await pool.query("SELECT 1 FROM pasport_users WHERE email=$1", [email]);
    if (exists.rowCount) {
      return res.status(409).send(registerPage({ uid: req.params.uid, error: "Er bestaat al een account met dit e-mailadres." }));
    }
    const { rows } = await pool.query(
      `INSERT INTO pasport_users (email, name, password_hash, role) VALUES ($1,$2,$3,'user') RETURNING id`,
      [email, name, hashPassword(password)],
    );
    await provider.interactionFinished(req, res, { login: { accountId: rows[0].id } }, { mergeWithLastSubmission: false });
  } catch (e) { next(e); }
});

// itsme/eID — instappunt (federatie volgt zodra er credentials zijn).
app.get("/interaction/:uid/idp/:provider", (req, res) => {
  res.send(idpPlaceholder({ uid: req.params.uid, provider: req.params.provider === "itsme" ? "itsme" : "eid" }));
});

app.post("/interaction/:uid/login", parseForm, async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    const { rows } = await pool.query("SELECT id, password_hash FROM pasport_users WHERE email=$1", [email]);
    const user = rows[0];
    if (!user || !password || !verifyPassword(password, user.password_hash)) {
      const details = await provider.interactionDetails(req, res);
      return res.status(401).send(loginPage({ uid: details.uid, error: "Onjuiste e-mail of wachtwoord." }));
    }
    await provider.interactionFinished(req, res, { login: { accountId: user.id } }, { mergeWithLastSubmission: false });
  } catch (e) { next(e); }
});

// Registratie-endpoint: maakt een account aan (door de frontend server-side
// aangeroepen). Daarna logt de frontend in via het password grant.
app.post("/register-account", express.json(), async (req, res, next) => {
  try {
    const { name, email, password } = (req.body || {}) as { name?: string; email?: string; password?: string };
    if (!name || !email || !password || String(password).length < 8) {
      return res.status(400).json({ error: "invalid" });
    }
    const exists = await pool.query("SELECT 1 FROM pasport_users WHERE email=$1", [email]);
    if (exists.rowCount) return res.status(409).json({ error: "exists" });
    await pool.query(
      `INSERT INTO pasport_users (email, name, password_hash, role) VALUES ($1,$2,$3,'user')`,
      [email, name, hashPassword(password)],
    );
    res.json({ ok: true });
  } catch (e) { next(e); }
});

app.use(provider.callback());
app.listen(PORT, () => console.log(`Pasport OIDC op ${ISSUER}`));
