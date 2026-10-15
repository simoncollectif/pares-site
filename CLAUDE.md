# PARES website

Merksite van PARES (paresfootball.com): voetbalschoenen en kleding, een deel van elke verkoop gaat naar een stichting die kinderen laat voetballen. Tagline: *Pares in campo*, gelijken op het veld.

## Hoe het werkt

- Astro, statisch. Elke push naar `main` bouwt en publiceert via GitHub Actions naar GitHub Pages.
- Domein staat bij Hostinger; DNS wijst naar GitHub Pages. `public/CNAME` moet blijven staan.
- Verhalen (blog) zijn markdown-bestanden in `src/content/verhalen/`. `draft: true` houdt een verhaal offline.
- Elk verhaal heeft een `rubriek` (zie `src/data/rubrieken.ts`), een `vorm` (`verhaal` of `kort`) en bij nieuws een `bron` (naam + url). Beelden staan in `src/assets/beeld/`; zet `imageAi: true` bij AI-beelden.
- PARES is een goednieuws-platform over voetbal. Schrijf als het merk, niet als Simon. Feiten alleen met een gecontroleerde bron. Zie `docs/contentplan.md`, `docs/shootplan.md` en `docs/midjourney-prompts.md`.
- Merkkleuren en letters staan als variabelen in `src/layouts/Base.astro`. Het logo is `src/components/Monogram.astro`.

## Community (eigen backend)

- Google Apps Script "PARES backend" op Simons Google-account (simon@lecollectif.nl), code in `backend/Code.gs`. Wijzig je de code: plak hem in de editor op script.google.com en maak een nieuwe versie van de bestaande implementatie (zelfde URL).
- Opslag: Google Sheet "PARES data" (tabs Inschrijvingen, Insturen, Reacties), foto's in Drive-map "PARES insturen". Meldingen gaan per mail naar Simon.
- Site: `src/data/community.ts` (web-app-URL), `src/scripts/api.ts`, componenten `Nieuwsbrief.astro` en `Reacties.astro`, pagina `/insturen/`.
- Nieuwsbrief met dubbele opt-in en afmeldlink. Versturen en beheren: `python3 -I scripts/brief.py stats|review|hide|test|send` (sleutels in `data-raw/backend.json`, niet in git). Altijd eerst `test`, en Simon vragen voordat je `send` doet.
- Verhalen zijn blogs van 450 tot 700 woorden met context en echte citaten. Nooit citaten verzinnen of parafrases tussen aanhalingstekens zetten.

## Pleintjeskaart

- `/pleintjes/` en `/pleintjes/[stad]/`, data in `src/data/pleintjes-<stad>.json`, logica in `src/data/pleintjes.ts`.
- Data opnieuw maken: Overpass-query in `scripts/overpass-amsterdam.ql` naar `data-raw/`, stadsdelen van api.data.amsterdam.nl, dan `python3 -I scripts/pleintjes.py ...` en `python3 -I scripts/straatnamen.py ...` (Nominatim, max 1 verzoek per seconde).
- Filter: openbaar, tussen 80 en 2.500 m², of een naam als Cruyff Court/Krajicek. Grote clubvelden vallen eruit.
- Bronvermelding OpenStreetMap (ODbL) moet op de pagina blijven staan.

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
