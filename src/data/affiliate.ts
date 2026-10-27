// Partnerprogramma's (affiliate). Zet `actief: true` en vul `sjabloon` zodra Simon is goedgekeurd.
// In het sjabloon wordt {url} vervangen door de (URL-gecodeerde) productpagina.
// Netwerken waar sportwinkels in Nederland vaak zitten: Awin, TradeTracker, Daisycon, en het bol.com partnerprogramma.
export interface Programma {
	winkel: string;
	domeinen: string[];
	netwerk: string;
	actief: boolean;
	sjabloon: string;
}

export const programmas: Programma[] = [
	// Voorbeeld (nog niet actief):
	// { winkel: 'bol.com', domeinen: ['bol.com'], netwerk: 'bol.com partnerprogramma', actief: false, sjabloon: 'https://partner.bol.com/click/click?p=2&t=url&s=SITEID&f=TXL&url={url}&name=PARES' },
];

export function affiliateLink(productUrl: string): string {
	const host = new URL(productUrl).hostname.replace(/^www\./, '');
	const p = programmas.find((x) => x.actief && x.domeinen.some((d) => host === d || host.endsWith('.' + d)));
	return p ? p.sjabloon.replace('{url}', encodeURIComponent(productUrl)) : productUrl;
}
