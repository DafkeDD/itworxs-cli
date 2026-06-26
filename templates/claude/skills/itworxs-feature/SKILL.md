---
name: itworxs-feature
description: Volledig feature-traject van plan tot opgeleverde code: plant in fases met GitHub issues en bouwt fase per fase. Gebruik om een feature van A tot Z te laten plannen en bouwen.
---

# ItWorXs Feature (plan -> issues -> ship)

Rijgt de volledige flow aan elkaar in drie strikt opeenvolgende stappen: eerst plannen,
dan ALLE GitHub issues aanmaken, en pas daarna code schrijven. Vereist de GitHub CLI
(`gh`, ingelogd). Combineert de itworxs-plan en itworxs-ship skills.

## Harde regel

**Schrijf geen enkele regel code voordat het plan akkoord is én alle issues (epic +
een issue per fase) zijn aangemaakt.** De volgorde plan -> issues -> code is niet
onderhandelbaar: sla geen stap over en loop niet vooruit.

## Verloop

1. **Plan opstellen** — Volg de itworxs-plan skill: verfijn de feature, verken de
   codebase en splits het werk in 2-5 fases. Schrijf het plan naar
   `docs/plans/<slug>.md`. In deze stap wordt nog geen code geschreven.
2. **Akkoord** — Toon de fases en wacht op "go". Dit is het plan-checkpoint.
3. **Alle issues aanmaken** — Maak na akkoord eerst een issue per fase, dan de epic die
   ernaar verwijst, en sla de mapping op in `.claude/itworxs-plan.json`. Maak ze
   allemaal aan voordat je verdergaat.
4. **Controle (gate)** — Bevestig dat `.claude/itworxs-plan.json` bestaat, dat elke fase
   een issuenummer heeft en dat de epic bestaat. Pas als dat klopt, ga je verder.
5. **Bouwen** — Volg nu pas de itworxs-ship skill: bouw fase per fase (implementeren,
   testen, quality-gate, commit, PR met `Closes #...`), vink taken en fases af in de
   issues, en stop telkens kort na een fase zodat de gebruiker de PR kan reviewen en
   mergen.

## Tips

- Voor minimaal klikwerk: draai Claude Code in auto-accept (acceptEdits) modus. Het
  plan-akkoord en de PR-merge per fase blijven jouw checkpoints.
- Wil je tussen plannen en bouwen nog bijsturen, gebruik dan de skills apart (eerst
  itworxs-plan, daarna itworxs-ship).
