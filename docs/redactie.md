# Redactie PARES: werkwijze voor automatische stukken

Dit document is de handleiding voor de automatische redactie (de cloud-routine) en voor iedereen die een stuk schrijft. Lees ook `CLAUDE.md` (merk, stijl, techniek) en `docs/contentplan.md` (rubrieken, zoekwoorden, verhalen op de plank).

## Wat PARES is

Een Nederlands magazine over voetbalcultuur en goed nieuws van het veld: tenues (shirts, trainingsjacks, voetbalschoenen), pleintjes, clubs en goede doelen die iets moois doen, archief en beeld. Lezers: jonge voetballiefhebbers met oog voor stijl.

PARES verkoopt zelf niets. Nooit schrijven over een eigen drop, eigen producten, een wachtlijst of "er komt iets aan".

## Eén run, één stuk

1. **Kies een onderwerp.**
   - Zoek nieuws van de afgelopen 14 dagen (WebSearch): nieuwe shirts en voetbalschoenen, trends in voetbalmode, clubs, stichtingen en bedrijven die iets goeds doen met voetbal, nieuwe pleintjes en courts, mooie voetbalfotografie.
   - Of kies een evergreen-onderwerp uit `docs/contentplan.md` (zoekwoorden met volume en lage moeilijkheid, of "verhalen op de plank").
   - Wissel rubrieken af. Kijk in `src/content/verhalen/` welke rubrieken de laatste vijf stukken hadden en kies een andere als dat kan. Ongeveer de helft van de stukken is Tenues.
   - Schrijf nooit een onderwerp dat al op de site staat. Controleer de titels en bronnen in `src/content/verhalen/`.
2. **Check de bronnen.** Open elke bron met WebFetch. Gebruik alleen feiten die je op de bronpagina zelf hebt gelezen. Cijfers, data, namen en citaten letterlijk overnemen. Kun je iets niet bevestigen, laat het weg.
3. **Schrijf het stuk** (zie Stijl hieronder) als `src/content/verhalen/<slug>.md`.
4. **Bouw de site** met `npm ci` (eerste keer) en `npm run build`. De build moet slagen zonder fouten.
5. **Maak een Instagram-post klaar** in `docs/instagram/wachtrij/<datum>-<slug>.md` (zie hieronder).
6. **Publiceer**: commit met een duidelijke Nederlandse boodschap en push. Lukt een push naar `main` niet, push dan naar een branch die begint met `claude/`. De workflow `auto-publish` zet die automatisch op `main` en publiceert de site.
7. **Meld het aan Simon** (zie Melding).

## Stijl

- Rustig, oprecht Nederlands. Schrijf als PARES, niet als Simon, en niet in de ik-vorm.
- Een blog van 450 tot 700 woorden. Begin met een beeld of een scène, niet met "In dit artikel". Gebruik tussenkoppen (`##`), in gewone zinsopbouw, nooit in hoofdletters.
- Geen opgeklopte woorden (inspirerend, impactvol, uniek, game-changer), geen uitroeptekens, geen emoji.
- **Citaten:** alleen woorden die letterlijk in de bron staan, tussen aanhalingstekens. Een parafrase nooit tussen aanhalingstekens. Gebruik `>` voor één sterk citaat per stuk.
- Link naar minstens één ander PARES-stuk dat erbij past (`/verhalen/<slug>/`).
- Bij Tenues: praktische tips mogen ("zo draag je het", "waar let je op"), meningen kort en eerlijk.

## Frontmatter

```yaml
---
title: Korte, sterke koptitel
seoTitle: 'Zoekwoord vooraan: belofte van het stuk'
description: Eén of twee zinnen, 140 tot 170 tekens, met het zoekwoord.
date: JJJJ-MM-DD
rubriek: tenues | clubs | goede-doelen | bedrijven | pleintjes | acties | beeld | wereld | archief
vorm: verhaal
bron:
  naam: Naam van de belangrijkste bron
  url: https://...
affiliate: false
---
```

Zet `uitgelicht: true` alleen als het stuk sterk genoeg is voor de homepage en er een beeld bij zit. Automatische stukken hebben meestal geen beeld; dan krijgt het stuk vanzelf een typografische omslag. Gebruik geen afbeeldingen van anderen.

## Affiliate-links

- Alleen waar een product echt bij het verhaal hoort, bijvoorbeeld een voetbalschoen of trainingsjack waar het stuk over gaat. Nooit meer dan drie per stuk.
- Gebruik de partnerprogramma's in `src/data/affiliate.ts`. Staat een winkel daar niet in (of is het programma nog niet actief), link dan gewoon naar de officiële productpagina, zonder affiliate.
- Gebruik de component niet zelf: schrijf een gewone Markdown-link met de URL uit `affiliateLink()` als het programma actief is. Zet dan `affiliate: true` in de frontmatter. De site toont automatisch een melding bovenaan het stuk.
- Nooit een product aanprijzen dat je niet in een bron hebt gezien, en geen prijzen noemen die je niet hebt gecontroleerd.

## Instagram-post (klaarzetten)

Bestand `docs/instagram/wachtrij/<datum>-<slug>.md` met:

```
Stuk: https://paresfootball.com/verhalen/<slug>/
Beeld: het beeld van het stuk, of de typografische omslag (screenshot van de bovenkant van de pagina)

Caption:
<3 tot 6 korte regels in de PARES-stem. Eerste regel is de haak. Eindig met "Lees het hele verhaal: link in bio." Daarna maximaal 3 hashtags, waaronder #pares.>
```

## Melding

Stuur Simon na elke run één mail via de backend (alleen naar Simon, niet naar de lijst):

```bash
curl -sL -H "Content-Type: text/plain" --data-binary @- "$PARES_API" <<'JSON'
{"action":"send","test":true,"token":"$PARES_TOKEN","onderwerp":"PARES: nieuw stuk live: <titel>","html":"<p>...</p>"}
JSON
```

(`PARES_API` en `PARES_TOKEN` staan in de opdracht van de routine, niet in de repo.) In de mail: de titel met link, de bron, de rubriek, of er affiliate-links in staan, en de Instagram-caption. Ging er iets mis (geen goed onderwerp, build faalt, push lukt niet), mail dat ook, met de reden. Dan liever geen stuk dan een slecht stuk.

## PARES-brief (om de week)

Een aparte routine stuurt om de week op vrijdag de brief aan alle actieve inschrijvers:
- Onderwerp: kort en concreet, bijvoorbeeld "Het trainingsjack is terug, en drie andere verhalen".
- Inhoud: een korte opening (twee zinnen), dan de stukken van de afgelopen twee weken, elk met titel, één zin en een link. Eindig met een uitnodiging om een veldje of verhaal in te sturen (`https://paresfootball.com/insturen/`).
- Eerst een test naar Simon (`"test":true`), dan de echte verzending (`"test":false`).
- Geen verkooppraat. Affiliate-links horen niet in de brief.
