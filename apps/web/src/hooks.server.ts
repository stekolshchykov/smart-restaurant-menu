import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';

const API_ORIGIN = (env.PUBLIC_API_ORIGIN || 'http://localhost:3001').replace(/\/$/, '');

const preconnectLinks =
	`<link rel="preconnect" href="${API_ORIGIN}">` +
	`<link rel="dns-prefetch" href="${API_ORIGIN}">`;

const contentSecurityPolicy = [
	"default-src 'self'",
	`connect-src 'self' ${API_ORIGIN}`,
	"script-src 'self' 'unsafe-inline'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: blob: *",
	"font-src 'self'",
	"frame-ancestors 'none'",
	"base-uri 'self'",
	"form-action 'self'"
].join('; ');

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace(/<head([^>]*)>/i, `<head$1>${preconnectLinks}`)
	});

	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set(
		'Permissions-Policy',
		'geolocation=(), microphone=(), camera=(), payment=()'
	);

	if (!dev) {
		response.headers.set(
			'Strict-Transport-Security',
			'max-age=63072000; includeSubDomains; preload'
		);
		response.headers.set('Content-Security-Policy', contentSecurityPolicy);
	}

	return response;
};
