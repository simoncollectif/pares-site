import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const verhalen = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/verhalen' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			date: z.coerce.date(),
			draft: z.boolean().default(false),
			image: image().optional(),
			imageAlt: z.string().optional(),
			// true = beeld is met AI gemaakt; dan staat er een kleine vermelding onder.
			imageAi: z.boolean().default(false),
		}),
});

export const collections = { verhalen };
