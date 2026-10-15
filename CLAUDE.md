# PARES website

Merksite van PARES (paresfootball.com): voetbalschoenen en kleding, een deel van elke verkoop gaat naar een stichting die kinderen laat voetballen. Tagline: *Pares in campo*, gelijken op het veld.

## Hoe het werkt

- Astro, statisch. Elke push naar `main` bouwt en publiceert via GitHub Actions naar GitHub Pages.
- Domein staat bij Hostinger; DNS wijst naar GitHub Pages. `public/CNAME` moet blijven staan.
- Verhalen (blog) zijn markdown-bestanden in `src/content/verhalen/`. `draft: true` houdt een verhaal offline.
- Merkkleuren en letters staan als variabelen in `src/layouts/Base.astro`. Accent is voorlopig terracotta; zongeel is het alternatief.

## Branding

Cinematisch, Braziliaans en Afrikaans straatvoetbal, korrelige filmfoto's (gouden uur, 's nachts harde flits). Verder rustig en minimaal: één accentkleur, strakke dunne kaders. Niet AI-achtig. Schrijf in rustig, oprecht Nederlands.

## Later naar Shopify

Als er verkocht gaat worden, verhuist de winkel naar Shopify. Twee opties:
1. paresfootball.com naar Shopify laten wijzen en de verhalen meenemen als Shopify-blog.
2. Shopify op `shop.paresfootball.com` en deze site laten staan.
Houd content daarom in markdown, zodat hij makkelijk mee kan.

## Development

Start de dev server op de achtergrond: `npx astro dev --background` (beheer met `npx astro dev stop|status|logs`).
Docs: https://docs.astro.build
