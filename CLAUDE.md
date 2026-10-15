# PARES website

Merksite van PARES (paresfootball.com): voetbalschoenen en kleding, een deel van elke verkoop gaat naar een stichting die kinderen laat voetballen. Tagline: *Pares in campo*, gelijken op het veld.

## Hoe het werkt

- Astro, statisch. Elke push naar `main` bouwt en publiceert via GitHub Actions naar GitHub Pages.
- Domein staat bij Hostinger; DNS wijst naar GitHub Pages. `public/CNAME` moet blijven staan.
- Verhalen (blog) zijn markdown-bestanden in `src/content/verhalen/`. `draft: true` houdt een verhaal offline.
- Merkkleuren en letters staan als variabelen in `src/layouts/Base.astro`. Het logo is `src/components/Monogram.astro`.

## Branding (gekozen 15 oktober 2026)

- **Basis:** clean zwart-wit (#0b0b0b / #ffffff) met strakke 1px-lijnen.
- **Accent:** wijnrood/bordeaux #7a1f2e, op zwart #c0394f. Alleen als accent, nooit als vlak. Geen paars.
- **Letters:** kopjes in Schibsted Grotesk 700, tekst in Plus Jakarta Sans.
- **Geen hoofdletters** in kopjes, subkopjes of labels. Altijd gewone zinsopbouw.
- **Logo:** monogram P in een cirkel. Chroomversie alleen op zwarte vlakken op de site; in het echt komen de vette details op de producten.
- **Beeld:** lookbook-foto's op film, met een 90s retro-voetbalgevoel (shirts, trainingspakken, pleintjes). Geen AI-achtige beelden.
- **Toon:** rustig, oprecht Nederlands.

## Later naar Shopify

Als er verkocht gaat worden, verhuist de winkel naar Shopify. Twee opties:
1. paresfootball.com naar Shopify laten wijzen en de verhalen meenemen als Shopify-blog.
2. Shopify op `shop.paresfootball.com` en deze site laten staan.
Houd content daarom in markdown, zodat hij makkelijk mee kan.

## Development

Start de dev server op de achtergrond: `npx astro dev --background` (beheer met `npx astro dev stop|status|logs`).
Docs: https://docs.astro.build
