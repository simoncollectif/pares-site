import { community } from '../data/community';

export interface Antwoord {
	ok: boolean;
	fout?: string;
	[k: string]: unknown;
}

// text/plain voorkomt een CORS-preflight; Apps Script leest de JSON uit de body.
export async function post(action: string, data: Record<string, unknown>): Promise<Antwoord> {
	try {
		const res = await fetch(community.api, {
			method: 'POST',
			headers: { 'Content-Type': 'text/plain;charset=utf-8' },
			body: JSON.stringify({ action, ...data }),
		});
		return (await res.json()) as Antwoord;
	} catch {
		return { ok: false, fout: 'Er ging iets mis met de verbinding. Probeer het zo nog eens.' };
	}
}

export async function get(params: Record<string, string>): Promise<Antwoord> {
	try {
		const res = await fetch(`${community.api}?${new URLSearchParams(params)}`);
		return (await res.json()) as Antwoord;
	} catch {
		return { ok: false };
	}
}

// Leest een formulier uit en voegt de anti-spamvelden toe (honeypot en starttijd).
export function velden(form: HTMLFormElement) {
	const data: Record<string, unknown> = Object.fromEntries(new FormData(form).entries());
	data.t = Number(form.dataset.start || 0);
	return data;
}

export function markeerStart(form: HTMLFormElement) {
	form.dataset.start = String(Date.now());
}

export function melding(form: HTMLFormElement, tekst: string, goed = false) {
	const el = form.querySelector<HTMLElement>('.melding');
	if (!el) return;
	el.textContent = tekst;
	el.classList.toggle('goed', goed);
	el.hidden = false;
}

// Maakt een foto kleiner (max 1600 px) en geeft een JPEG data-URL terug.
export async function verkleinFoto(bestand: File, max = 1600): Promise<string> {
	const bitmap = await createImageBitmap(bestand);
	const schaal = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(bitmap.width * schaal);
	canvas.height = Math.round(bitmap.height * schaal);
	canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	return canvas.toDataURL('image/jpeg', 0.82);
}
