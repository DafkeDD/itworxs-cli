---
name: itworxs-handoff
description: Werk de session-handoff bij (.claude/HANDOFF.md): huidig werk, volgende stappen, beslissingen. Gebruik aan het einde van een sessie of bij een mijlpaal.
---

# ItWorXs Session Handoff

`.claude/HANDOFF.md` bewaart context tussen Claude-sessies en wordt bij de start van
een nieuwe sessie automatisch ingeladen. De **git-snapshot** sectie wordt automatisch
bijgewerkt door een hook — die laat je met rust. Jij vult de narratieve secties in.

## Wat te doen

Werk in `.claude/HANDOFF.md` deze drie secties bij:

- **Waar ik aan werk** — de huidige taak of feature in 1-3 zinnen.
- **Volgende stappen** — de concrete eerstvolgende acties.
- **Beslissingen / context** — keuzes en aannames die een nieuwe sessie moet kennen.

## Belangrijk

- Houd het **kort en concreet**: dit wordt bij de volgende sessie ingeladen, dus elke
  regel kost tokens. Geen volledige geschiedenis — enkel wat nodig is om verder te kunnen.
- Raak de sectie **"Git-snapshot (automatisch)"** niet aan; die wordt door de hook beheerd.
- Het bestand zelf staat in `.claude/.gitignore` (lokale sessie-staat, niet in git).
