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

> **Verplichte testregel.** Voor elke fase geldt: schrijf tests voor **alle** nieuwe of
> gewijzigde code (zowel happy- als failure-paths), voer ze uit, en krijg ze **groen**
> vóór je een PR opent. Geen tests geschreven of een rode testrun = geen PR. Dit is niet
> onderhandelbaar.

1. **Branch** — `git checkout main && git pull && git checkout -b feat/<slug>-fase-<n>`.
2. **Implementeren + tests schrijven** — Lees eerst `.claude/memory/architecture.md` voor
   context. Zet de itworxs-explorer agent **alleen** in bij een grote of onbekende fase;
   voor een kleine, duidelijke fase ga je direct met de itworxs-developer agent aan de slag
   (scheelt tokens). Laat daarna de itworxs-tester agent **verplicht** tests schrijven voor
   alle nieuwe/gewijzigde code — happy- én failure-paths. Code zonder tests telt niet als af.
3. **Tests uitvoeren + kwaliteit** — Voer de tests uit en krijg ze **groen** (verplichte
   gate vóór de PR). Draai daarna de itworxs-quality skill (lint, types, build) en los
   blokkers op. **Bewaar de uitvoer van de testrun** (geslaagd/gefaald + aantallen) — die
   komt in de PR:
   ```bash
   npm test 2>&1 | tee /tmp/itworxs-tests.txt
   ```
   Faalt er een test, los die eerst op; ga niet verder met rode tests. Laat een
   itworxs-reviewer agent daarna een korte self-review doen.
4. **Taken afvinken in het fase-issue** — Haal de body op, zet de afgewerkte taken op
   `- [x]`, schrijf terug:
   ```bash
   gh issue view <issue> --json body -q .body > /tmp/body.md
   # vervang '- [ ]' door '- [x]' voor de afgewerkte taken in /tmp/body.md
   gh issue edit <issue> --body-file /tmp/body.md
   ```
5. **Commit & PR** — Conventional commit, push de branch, en open een PR die het
   fase-issue sluit bij merge. **Zet de testuitslag in de PR-body** (samenvatting van
   `/tmp/itworxs-tests.txt`: aantal geslaagd/gefaald, en de relevante regels):
   ```bash
   TESTS=$(tail -n 20 /tmp/itworxs-tests.txt)
   gh pr create --title "feat: fase <n> - <titel>" \
     --body "$(printf 'Implementeert fase %s.\n\n## Testresultaten\n```\n%s\n```\n\nCloses #%s' "<n>" "$TESTS" "<issue>")"
   ```
   Zijn er gefaalde tests, los die dan eerst op — open geen PR met rode tests.
6. **Fase afvinken in de epic** — Zet het vinkje van deze fase aan in de epic-issue,
   met dezelfde body-edit aanpak op het epicnummer.
7. **Markeer de fase als done** in `.claude/itworxs-plan.json`.
8. **Checkpoint** — Toon een korte samenvatting (wat gebouwd, welke PR) en wacht tot de
   gebruiker de PR reviewt en merget voordat je aan de volgende fase begint.

## Afronden

Wanneer alle fases `done` zijn: meld dat het plan klaar is. De fase-issues sluiten
automatisch bij het mergen van hun PR (door `Closes #...`); de epic kan gesloten worden
zodra alle fases afgevinkt zijn.
