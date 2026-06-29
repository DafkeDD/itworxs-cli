// Eigen, volledig custom login- en registratiepagina (Pasport-huisstijl).

const STYLE = `
  body{font-family:ui-sans-serif,system-ui,"Segoe UI",Roboto,sans-serif;background:#F1EFE8;display:grid;place-items:center;min-height:100vh;margin:0}
  .card{background:#fff;border:1px solid #D3D1C7;border-radius:14px;box-shadow:0 6px 24px rgba(0,0,0,.06);padding:28px;width:340px}
  .logo{background:#534AB7;color:#fff;font-weight:700;border-radius:9px;padding:10px 14px;display:inline-block;margin-bottom:16px}
  label{display:block;font-size:13px;color:#444;margin:10px 0 4px}
  input{width:100%;box-sizing:border-box;padding:10px;border:1px solid #D3D1C7;border-radius:9px}
  .btn{display:block;width:100%;box-sizing:border-box;text-align:center;margin-top:10px;padding:11px;border:0;border-radius:9px;font-weight:600;cursor:pointer;text-decoration:none;font-size:14px}
  .btn-primary{background:#534AB7;color:#fff}
  .btn-itsme{background:#FF4612;color:#fff}
  .btn-eid{background:#003087;color:#fff}
  .btn-ghost{background:#fff;color:#534AB7;border:1px solid #D3D1C7}
  .divider{display:flex;align-items:center;gap:10px;color:#999;font-size:12px;margin:18px 0 6px}
  .divider:before,.divider:after{content:"";flex:1;height:1px;background:#E5E3DB}
  .err{color:#b00020;font-size:13px;margin-top:10px}
  .alt{margin-top:16px;font-size:13px;color:#777;text-align:center}
  .alt a{color:#534AB7;font-weight:600;text-decoration:none}
`;

function idpButtons(uid: string): string {
  return `
    <a class="btn btn-itsme" href="/interaction/${uid}/idp/itsme">Verder met itsme®</a>
    <a class="btn btn-eid" href="/interaction/${uid}/idp/eid">Verder met eID</a>
    <div class="divider">of met e-mail</div>`;
}

export function loginPage({ uid, error }: { uid: string; error?: string }): string {
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1"><title>Pasport — Inloggen</title>
  <style>${STYLE}</style></head><body>
  <div class="card">
    <div class="logo">Pasport</div>
    <h2 style="margin:0 0 4px">Inloggen</h2>
    <p style="color:#777;margin:0 0 12px;font-size:13px">Eén login voor al je apps.</p>
    ${idpButtons(uid)}
    <form method="post" action="/interaction/${uid}/login">
      <label>E-mail</label>
      <input name="email" type="email" autocomplete="username" required autofocus>
      <label>Wachtwoord</label>
      <input name="password" type="password" autocomplete="current-password" required>
      ${error ? `<div class="err">${error}</div>` : ""}
      <button class="btn btn-primary" type="submit">Inloggen</button>
    </form>
    <div class="alt">Nog geen account? <a href="/interaction/${uid}/register">Registreren</a></div>
  </div></body></html>`;
}

export function registerPage({ uid, error }: { uid: string; error?: string }): string {
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1"><title>Pasport — Account aanmaken</title>
  <style>${STYLE}</style></head><body>
  <div class="card">
    <div class="logo">Pasport</div>
    <h2 style="margin:0 0 4px">Account aanmaken</h2>
    <p style="color:#777;margin:0 0 12px;font-size:13px">Eén account voor al je apps.</p>
    ${idpButtons(uid)}
    <form method="post" action="/interaction/${uid}/register">
      <label>Naam</label>
      <input name="name" type="text" autocomplete="name" required autofocus>
      <label>E-mail</label>
      <input name="email" type="email" autocomplete="username" required>
      <label>Wachtwoord</label>
      <input name="password" type="password" autocomplete="new-password" minlength="8" required>
      ${error ? `<div class="err">${error}</div>` : ""}
      <button class="btn btn-primary" type="submit">Account aanmaken</button>
    </form>
    <div class="alt">Al een account? <a href="/interaction/${uid}/login-page">Inloggen</a></div>
  </div></body></html>`;
}

// Eenvoudige info-pagina voor itsme/eID zolang de koppeling nog niet live is.
export function idpPlaceholder({ uid, provider }: { uid: string; provider: string }): string {
  const naam = provider === "itsme" ? "itsme®" : "eID";
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1"><title>Pasport — ${naam}</title>
  <style>${STYLE}</style></head><body>
  <div class="card">
    <div class="logo">Pasport</div>
    <h2 style="margin:0 0 6px">${naam}</h2>
    <p style="color:#555;font-size:13.5;line-height:1.5">De ${naam}-koppeling is voorzien maar vereist nog
    sandbox-/productiecredentials van de provider. Zodra die er zijn, federeert Pasport hierheen via OIDC/SAML.</p>
    <a class="btn btn-ghost" href="/interaction/${uid}/login-page">Terug naar inloggen</a>
  </div></body></html>`;
}
