---
name: itworxs-handoff
description: Werk de session-handoff van een ItWorXs-project bij (.claude/HANDOFF.md). Noteer waar je aan werkt, de volgende stappen en belangrijke beslissingen, zodat een volgende Claude-sessie verdergaat zonder context te verliezen. Gebruik op het einde van een werksessie of bij een grote mijlpaal.
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
