---
name: itworxs-a11y
description: WCAG-toegankelijkheidscheck van de Next.js-frontend (contrast, focus, labels, semantiek, toetsenbord). Gebruik bij oplevering of een a11y-vraag.
---

# ItWorXs Accessibility (a11y)

Controleer de frontend op toegankelijkheid volgens WCAG 2.1 AA. Wijzig niets zonder
te vragen; rapporteer bevindingen met locatie en een concrete fix.

## Checklist

- **Contrast**: tekst t.o.v. achtergrond minstens 4.5:1 (3:1 voor grote tekst). Controleer beide thema's (light én dark via `data-theme`).
- **Semantiek**: correcte elementen (`button`, `nav`, `main`, headings in volgorde h1 → h2). Geen `div` met onClick voor knoppen.
- **Labels**: elk formulierveld heeft een `label` of `aria-label`; icoon-knoppen hebben een toegankelijke naam.
- **Focus**: zichtbare focus-states op alle interactieve elementen; logische tab-volgorde.
- **Toetsenbord**: alles bedienbaar zonder muis (menu's, modals, de Locale- en Theme-switcher).
- **Afbeeldingen**: betekenisvolle `alt`-tekst; decoratief = lege `alt`.
- **Beweging**: respecteer `prefers-reduced-motion` voor animaties en transitions.
- **Taal**: het `lang`-attribuut op `<html>` volgt de locale (al geregeld in de layout).

## Aanpak

- Loop de pagina's en componenten na onder `frontend/src/app/[locale]/` en `frontend/src/components/`.
- Gebruik waar mogelijk de Playwright-MCP om met het toetsenbord te navigeren en focus te controleren.
- Rapporteer per bevinding: bestand + element, het WCAG-criterium, en een voorgestelde oplossing.
