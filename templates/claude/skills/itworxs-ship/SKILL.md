---
name: itworxs-ship
description: Voer een itworxs-plan fase per fase uit op de GitHub issues: implementeren, testen, quality-gate, commit, PR, issues bijwerken. Gebruik om gepland werk te bouwen.
---

# ItWorXs Ship

Bouwt het werk **fase per fase** op basis van `.claude/itworxs-plan.json` en de GitHub
issues. Vereist `gh` (ingelogd). Bestaat het planbestand niet, run dan eerst de
**itworxs-plan** skill.

## Voorwaarde — controleer dit eerst

Begin pas met bouwen als het plannen volledig klaar is:
- `.claude/itworxs-plan.json` bestaat,
- elke fase daarin heeft een `issue`-nummer (alle fase-issues zijn aangemaakt),
- de epic bestaat.

Klopt een van deze niet, stop dan en run eerst de itworxs-plan skill. Schrijf geen code
zolang niet alle issues bestaan.

> **Tip voor minimaal klikwerk:** draai Claude Code in auto-accept (acceptEdits) modus.
> Dan word je niet per tool-call gevraagd; je enige checkpoint is het reviewen en mergen
> van de PR per fase.

## Per fase — in volgorde, enkel fases met `"done": false`

1. **Branch** — `git checkout main && git pull && git checkout -b feat/<slug>-fase-<n>`.
2. **Implementeren** — Gebruik de itworxs-explorer agent om de fase te situeren, dan de
   itworxs-developer agent om de taken te bouwen volgens de projectpatronen, en de
   itworxs-tester agent voor happy- én failure-path tests.
3. **Kwaliteit** — Draai de itworxs-quality skill en los blokkers op. Laat een
   itworxs-reviewer agent een korte self-review doen.
4. **Taken afvinken in het fase-issue** — Haal de body op, zet de afgewerkte taken op
   `- [x]`, schrijf terug:
   ```bash
   gh issue view <issue> --json body -q .body > /tmp/body.md
   # vervang '- [ ]' door '- [x]' voor de afgewerkte taken in /tmp/body.md
   gh issue edit <issue> --body-file /tmp/body.md
   ```
5. **Commit & PR** — Conventional commit, push de branch, en open een PR die het
   fase-issue sluit bij merge:
   ```bash
   gh pr create --title "feat: fase <n> - <titel>" \
     --body "$(printf 'Implementeert fase %s.\n\nCloses #%s' "<n>" "<issue>")"
   ```
6. **Fase afvinken in de epic** — Zet het vinkje van deze fase aan in de epic-issue,
   met dezelfde body-edit aanpak op het epicnummer.
7. **Markeer de fase als done** in `.claude/itworxs-plan.json`.
8. **Checkpoint** — Toon een korte samenvatting (wat gebouwd, welke PR) en wacht tot de
   gebruiker de PR reviewt en merget voordat je aan de volgende fase begint.

## Afronden

Wanneer alle fases `done` zijn: meld dat het plan klaar is. De fase-issues sluiten
automatisch bij het mergen van hun PR (door `Closes #...`); de epic kan gesloten worden
zodra alle fases afgevinkt zijn.
