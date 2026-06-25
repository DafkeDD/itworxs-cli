---
name: itworxs-component
description: Maak een nieuw React/Next.js-component in een ItWorXs-frontend. Bouwt het component met TailwindCSS, react-icons, next-intl-teksten en aandacht voor toegankelijkheid en de client/server-grens. Gebruik wanneer de gebruiker een UI-component wil bouwen.
---

# ItWorXs Component

Maak een herbruikbaar component in `frontend/src/components/` dat past bij de
projectconventies.

## Werkwijze

1. **Bepaal de aard** — puur presentatie (server component) of met interactie/hooks
   (client component met `'use client'` bovenaan). Houd componenten klein en gefocust.
2. **Props** — getypte props (geen `any`), zinvolle defaults, named export. Definieer een
   duidelijke `Props`-interface.
3. **Styling** — TailwindCSS-klassen die het thema respecteren (kleuren die met
   `data-theme` meekleuren, of `dark:`-varianten). Iconen via `react-icons`.
4. **Teksten** — geen hardcoded UI-strings: gebruik next-intl (`useTranslations`) en voeg
   de sleutels toe aan `messages/*.json` (in alle talen).
5. **Varianten & states** — dek waar zinvol varianten af (bv. size, variant) en states
   (hover, focus, disabled, loading, leeg).
6. **Toegankelijkheid** — semantische elementen, een toegankelijke naam voor icoon-knoppen,
   zichtbare focus en toetsenbordbediening. Bij twijfel: draai de itworxs-a11y skill.

## Afronden

- Toon een klein gebruiksvoorbeeld van het component.
- Draai de itworxs-quality skill op de frontend.
