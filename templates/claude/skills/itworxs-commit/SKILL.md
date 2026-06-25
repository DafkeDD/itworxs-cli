---
name: itworxs-commit
description: Maak een nette commit en pull request voor een ItWorXs-project. Draait eerst de quality-gate, schrijft een conventional commit-bericht en opent een PR via de GitHub CLI. Gebruik wanneer werk klaar is om in te dienen.
---

# ItWorXs Commit & PR

Bereid wijzigingen voor op een pull request, in lijn met de GitHub Actions CI van het project.

## Stappen

1. **Controleer** eerst de status met `git status` en `git diff`.
2. **Kwaliteit**: draai de itworxs-quality skill (lint, type-check, prettier, build). Los blokkers op of meld ze; commit geen falende build.
3. **Branch**: werk op een feature-branch (`feat/...`, `fix/...`), niet rechtstreeks op `main`.
4. **Commit**: gebruik conventional commits — `type(scope): beschrijving` (types: feat, fix, refactor, docs, test, chore). Eén logische wijziging per commit.
5. **Push & PR**: push de branch en open een PR met `gh pr create`, met een duidelijke titel en een korte omschrijving (wat + waarom). Vermeld of de CI groen is.

## Regels

- Commit nooit secrets; `.env` blijft buiten git.
- Bump geen versies of dependencies zonder reden.
- Vraag bevestiging voordat je daadwerkelijk pusht of een PR opent.
