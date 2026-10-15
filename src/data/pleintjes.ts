import amsterdam from './pleintjes-amsterdam.json';

// Data: OpenStreetMap-bijdragers (ODbL). Opnieuw maken met scripts/pleintjes.py en scripts/straatnamen.py.
export interface Pleintje {
	id: string;
	naam: string;
	surface: string;
	area: number;
	lat: number;
	lon: number;
	speciaal: boolean;
	stadsdeel: string;
	straat?: string;
	buurt?: string;
}

export const steden = [
	{ slug: 'amsterdam', naam: 'Amsterdam', pleintjes: amsterdam.pleintjes as Pleintje[] },
];

const ondergrond: Record<string, string> = {
	artificial_turf: 'kunstgras',
	grass: 'gras',
	asphalt: 'asfalt',
	paving_stones: 'tegels',
	concrete: 'beton',
	tartan: 'rubber',
	acrylic: 'kunststof',
	paved: 'verhard',
	grass_paver: 'grastegels',
};

export function soort(p: Pleintje) {
	if (/cruyff/i.test(p.naam)) return 'Cruyff Court';
	if (/krajicek/i.test(p.naam)) return 'Krajicek Playground';
	return 'Trapveldje';
}

export function titel(p: Pleintje) {
	if (p.naam) return p.naam;
	if (p.straat) return `${soort(p)} ${aan(p.straat)}`;
	if (p.buurt) return `${soort(p)} in ${p.buurt}`;
	return soort(p);
}

// Het-woorden: plein, plantsoen, park, veld, eiland, terrein, hof, erf. De rest krijgt 'de'.
function aan(straat: string) {
	return /(plein|plantsoen|park|veld|eiland|terrein|hof|erf|pad)$/i.test(straat) ? `aan het ${straat}` : `aan de ${straat}`;
}

export function details(p: Pleintje) {
	const delen = [];
	if (p.naam && p.straat) delen.push(p.straat);
	if (p.buurt && p.buurt !== p.stadsdeel) delen.push(p.buurt);
	if (p.surface && ondergrond[p.surface]) delen.push(ondergrond[p.surface]);
	return delen.join(' · ');
}

export function kaartLink(p: Pleintje) {
	return `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=18/${p.lat}/${p.lon}`;
}
