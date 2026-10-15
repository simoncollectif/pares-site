// Rubrieken van PARES. De slug staat in de frontmatter van elk verhaal (`rubriek`).
export const rubrieken = [
	{ slug: 'clubs', naam: 'Clubs', omschrijving: 'Clubs, groot en klein, die iets goeds doen voor hun buurt.' },
	{ slug: 'goede-doelen', naam: 'Goede doelen', omschrijving: 'Stichtingen en projecten die voetbal gebruiken om kinderen en buurten verder te helpen.' },
	{ slug: 'bedrijven', naam: 'Bedrijven', omschrijving: 'Bedrijven die via voetbal iets teruggeven.' },
	{ slug: 'pleintjes', naam: 'Pleintjes', omschrijving: 'Trapveldjes, kooien en courts, en de verhalen van wie er speelt.' },
	{ slug: 'acties', naam: 'Acties', omschrijving: 'Inzamelingen, toernooien en fans die samen iets op touw zetten.' },
	{ slug: 'beeld', naam: 'Beeld', omschrijving: 'Mooie voetbalfoto’s en de mensen die ze maken.' },
	{ slug: 'wereld', naam: 'Wereldvoetbal', omschrijving: 'Straatvoetbal en goed nieuws van buiten Nederland.' },
	{ slug: 'archief', naam: 'Archief', omschrijving: 'Shirts, toernooien en momenten van vroeger, en wat ze nog steeds betekenen.' },
	{ slug: 'pares', naam: 'Over PARES', omschrijving: 'Waarom PARES bestaat en hoe het groeit.' },
] as const;

export type RubriekSlug = (typeof rubrieken)[number]['slug'];

export const rubriekSlugs = rubrieken.map((r) => r.slug) as [RubriekSlug, ...RubriekSlug[]];

export function rubriekNaam(slug: string) {
	return rubrieken.find((r) => r.slug === slug)?.naam ?? slug;
}
