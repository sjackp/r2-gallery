/// <reference types="@cloudflare/workers-types" />

export interface Env {
	BUCKET_BASE_URL: string;
}

function clamp(n: number, min: number, max: number): number {
	if (Number.isNaN(n)) return min;
	return Math.max(min, Math.min(max, n));
}

function encodeKeyPath(key: string): string {
	return key.split('/').map(encodeURIComponent).join('/');
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		if (!url.pathname.startsWith('/thumb')) {
			return new Response('Not found', { status: 404 });
		}

		const keyParam = url.searchParams.get('key');
		if (!keyParam) {
			return new Response('Missing key', { status: 400 });
		}

		if (!env.BUCKET_BASE_URL) {
			return new Response('Worker not configured', { status: 500 });
		}

		const key = keyParam.replace(/^\/+/, '');
		const lower = key.toLowerCase();
		const allowedExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tif', '.tiff', '.svg'];
		if (!allowedExt.some((ext) => lower.endsWith(ext))) {
			return new Response('Unsupported type', { status: 415 });
		}

		const width = clamp(parseInt(url.searchParams.get('w') || '512', 10), 8, 4096);
		const height = clamp(parseInt(url.searchParams.get('h') || '512', 10), 8, 4096);
		const quality = clamp(parseInt(url.searchParams.get('q') || '75', 10), 1, 100);
		const fit = (url.searchParams.get('fit') || 'cover') as
			| 'scale-down'
			| 'contain'
			| 'cover'
			| 'crop'
			| 'pad';
		const format = (url.searchParams.get('fmt') || 'auto') as 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';

		const encodedKey = encodeKeyPath(key);
		const origin = env.BUCKET_BASE_URL.replace(/\/$/, '') + '/' + encodedKey;

		const cfOptions = {
			image: { width, height, quality, fit, format },
			cacheEverything: true,
			cacheTtl: 604800, // 7 days
		};

		const upstream = await fetch(origin, { cf: cfOptions } as RequestInit);
		if (!upstream.ok) {
			return new Response('Upstream error: ' + upstream.status, { status: 502 });
		}

		const headers = new Headers(upstream.headers);
		headers.set('Cache-Control', 'public, max-age=604800, s-maxage=604800, immutable');
		headers.delete('Content-Disposition'); // ensure inline for thumbnails
		headers.set('Vary', 'Accept, Accept-Encoding, DPR, Viewport-Width, Width');

		return new Response(upstream.body, { status: 200, headers });
	},
};
