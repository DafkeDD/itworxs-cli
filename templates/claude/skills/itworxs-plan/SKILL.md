---
name: itworxs-plan
description: Maak een implementatieplan, splits in fases en maak GitHub issues (epic + issue per fase). Gebruik om een feature te plannen vóór het bouwen.
---

# ItWorXs Plan

Zet een feature om in een gefaseerd plan en GitHub issues. Vereist de GitHub CLI
(`gh`), ingelogd via `gh auth login`. Is `gh` er niet of niet ingelogd, stop dan en
vraag de gebruiker dat eerst te regelen.

## Stappen

1. **Verfijn de feature** — Stel gerichte vragen tot je een korte, duidelijke spec hebt:
   doel, scope, niet-doelen, acceptatiecriteria. Houd het bondig.
2. **Verken de codebase** — Gebruik de itworxs-explorer agent (of de gitnexus-MCP) om de
   relevante mappen, patronen en afhankelijkheden in kaart te brengen.
3. **Splits in fases** — Verdeel het werk in 2 tot 5 **fases**. Elke fase is een
   samenhangend, apart opleverbaar geheel, in logische volgorde (afhankelijkheden eerst).
   Geef elke fase een korte titel en een lijstje concrete taken.
4. **Schrijf het plan** — Naar `docs/plans/<slug>.md`: samenvatting, fases met taken,
   geraakte bestanden, en acceptatiecriteria.
5. **Toon het plan en vraag één keer akkoord** — Laat de fases zien en wacht op
   bevestiging voordat je issues aanmaakt.

## GitHub issues aanmaken (na akkoord)

Maak **eerst een issue per fase**, noteer hun nummers, en daarna de **epic** die ernaar
verwijst.

1. Per fase:
   ```bash
   gh issue create --title "Fase N: <titel>" \
     --label itworxs-plan \
     --body "$(printf '## Taken\n- [ ] taak 1\n- [ ] taak 2\n\nDeel van plan: <slug>')"
   ```
   Onthoud het issuenummer dat `gh` teruggeeft.
2. De epic met de fase-checklist die naar de fase-issues verwijst:
   ```bash
   gh issue create --title "<Feature>" \
     --label itworxs-plan,epic \
     --body "$(printf '## Fases\n- [ ] Fase 1: <titel> (#11)\n- [ ] Fase 2: <titel> (#12)')"
   ```
3. Sla de mapping op in `.claude/itworxs-plan.json`:
   ```json
   {
     "slug": "<slug>",
     "epic": 10,
     "phases": [
       { "n": 1, "title": "...", "issue": 11, "done": false },
       { "n": 2, "title": "...", "issue": 12, "done": false }
     ]
   }
   ```

Rond af met een overzicht: het epicnummer, de fase-issues, en de hint dat de gebruiker
de **itworxs-ship** skill kan gebruiken om fase per fase te bouwen.
