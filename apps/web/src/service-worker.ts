/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

const STATIC_CACHE = `static-${version}`;
const RUNTIME_CACHE = `runtime-${version}`;
const OFFLINE_PAGE = '/offline';

const staticAssets = [...build, ...files, OFFLINE_PAGE];

const sw = self as unknown as ServiceWorkerGlobalScope;

function isApiRequest(url: URL): boolean {
	// The API runs on a separate origin; bypass any cross-origin request.
	return url.origin !== self.location.origin;
}

function isRuntimeCacheable(request: Request, url: URL): boolean {
	if (request.method !== 'GET') return false;
	if (url.pathname.startsWith('/public/')) return true;
	if (url.pathname.startsWith('/venue/')) return true;
	if (url.pathname.startsWith('/table/')) return true;
	return false;
}

function isVenueNavigation(request: Request, url: URL): boolean {
	return request.mode === 'navigate' && (url.pathname.startsWith('/venue/') || url.pathname.startsWith('/table/'));
}

sw.addEventListener('message', (event: ExtendableMessageEvent) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		sw.skipWaiting();
	}
});

sw.addEventListener('install', (event: ExtendableEvent) => {
	event.waitUntil(
		caches
			.open(STATIC_CACHE)
			.then(async (cache) => {
				for (const asset of staticAssets) {
					try {
						await cache.add(asset);
					} catch (err) {
						console.warn('[SW] Failed to cache asset:', asset, err);
					}
				}
			})
			.then(() => sw.skipWaiting())
	);
});

sw.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => keys.filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE))
			.then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
			.then(() => sw.clients.claim())
	);
});

sw.addEventListener('fetch', (event: FetchEvent) => {
	const { request } = event;
	const url = new URL(request.url);

	if (isApiRequest(url) || request.method !== 'GET') {
		return;
	}

	async function offlineFallback(): Promise<Response> {
		return (await caches.match(OFFLINE_PAGE)) ?? new Response('Offline', { status: 503 });
	}

	// Venue/table navigations: stale-while-revalidate with offline fallback.
	if (isVenueNavigation(request, url)) {
		event.respondWith(
			caches.open(RUNTIME_CACHE).then((cache) =>
				cache.match(request).then(async (cached) => {
					const network = fetch(request)
						.then((response) => {
							if (response.ok) {
								cache.put(request, response.clone());
							}
							return response;
						})
						.catch(() => cached ?? offlineFallback());
					return cached || network;
				})
			)
		);
		return;
	}

	// Other navigation requests: network-first with offline fallback.
	if (request.mode === 'navigate') {
		event.respondWith(
			fetch(request)
				.then((response) => response)
				.catch(() => offlineFallback())
		);
		return;
	}

	// Public venue/menu/table GET responses: stale-while-revalidate.
	// Do NOT serve the offline HTML fallback here — returning HTML for a JS/CSS
	// request causes recursive relative-path fetches under /venue/* and /table/*.
	if (isRuntimeCacheable(request, url)) {
		event.respondWith(
			caches.open(RUNTIME_CACHE).then((cache) =>
				cache.match(request).then(async (cached) => {
					const network = fetch(request)
						.then((response) => {
							if (response.ok) {
								cache.put(request, response.clone());
							}
							return response;
						})
						.catch(() => cached ?? new Response('Offline', { status: 503 }));
					return cached || network;
				})
			)
		);
		return;
	}

	// Static assets: cache-first.
	if (staticAssets.some((asset) => url.pathname === asset)) {
		event.respondWith(
			caches.match(request).then((cached) => cached ?? fetch(request).then((response) => response))
		);
		return;
	}

	// Everything else: network-first, fallback to cache, then a plain 503.
	// Again, never return the offline HTML page for a non-navigation request.
	event.respondWith(
		fetch(request)
			.then((response) => response)
			.catch(() => caches.match(request).then((cached) => cached || new Response('Offline', { status: 503 })))
	);
});
