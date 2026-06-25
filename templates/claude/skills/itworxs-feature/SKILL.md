---
name: itworxs-feature
description: Volledig feature-traject van plan tot opgeleverde code: plant in fases met GitHub issues en bouwt fase per fase. Gebruik om een feature van A tot Z te laten plannen en bouwen.
---

# ItWorXs Feature (plan -> ship)

Rijgt de volledige flow aan elkaar: eerst plannen, dan fase per fase bouwen. Vereist de
GitHub CLI (`gh`, ingelogd). Combineert de itworxs-plan en itworxs-ship skills.

## Verloop

1. **Plan** — Volg de **itworxs-plan** skill: verfijn de feature, splits ze in fases, en
   maak na één akkoord de GitHub issues (epic + issue per fase) plus
   `.claude/itworxs-plan.json`.
2. **Akkoord** — Dit is het enige plan-checkpoint: toon de fases en wacht op "go".
3. **Bouwen** — Volg daarna de **itworxs-ship** skill: bouw fase per fase
   (implementeren, testen, quality-gate, commit, PR met `Closes #...`), vink taken en
   fases af in de issues, en stop telkens kort na een fase zodat de gebruiker de PR kan
   reviewen en mergen.

## Tips

- Voor minimaal klikwerk: draai Claude Code in auto-accept (acceptEdits) modus. Het
  plan-akkoord en de PR-merge per fase blijven jouw checkpoints.
- Wil je tussen plannen en bouwen nog bijsturen, gebruik dan de twee skills apart
  (eerst itworxs-plan, daarna itworxs-ship).
