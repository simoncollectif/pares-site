import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { rubriekSlugs } from './data/rubrieken';

const verhalen = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/verhalen' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			date: z.coerce.date(),
			draft: z.boolean().default(false),
			rubriek: z.enum(rubriekSlugs),
			// 'verhaal' is een langer stuk, 'kort' een nieuwtje van een paar alinea's.
			vorm: z.enum(['verhaal', 'kort']).default('verhaal'),
			bron: z.object({ naam: z.string(), url: z.string().url() }).optional(),
			image: image().optional(),
			imageAlt: z.string().optional(),
			// true = beeld is met AI gemaakt; dan staat er een kleine vermelding onder.
			imageAi: z.boolean().default(false),
		}),
});

export const collections = { verhalen };
