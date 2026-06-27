import { browser } from '$app/environment';
import type { ProjectThemeResponse } from '@digital-menu/api-client';

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const normalized = hex.replace('#', '');
	if (!/^([0-9a-fA-F]{3}){1,2}$/.test(normalized)) return null;

	const full = normalized.length === 3
		? normalized.split('').map((c) => c + c).join('')
		: normalized;

	const value = Number.parseInt(full, 16);
	return {
		r: (value >> 16) & 255,
		g: (value >> 8) & 255,
		b: value & 255,
	};
}

export function accentPalette(accent: string) {
	const rgb = hexToRgb(accent) ?? { r: 201, g: 162, b: 39 };
	const base = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

	return {
		primary: base,
		primaryDark: `color-mix(in srgb, ${base}, black 20%)`,
		primaryLight: `color-mix(in srgb, ${base}, white 20%)`,
		primaryBg: `color-mix(in srgb, ${base}, transparent 86%)`,
		focusRing: `color-mix(in srgb, ${base}, transparent 65%)`,
		glow: `0 0 24px color-mix(in srgb, ${base}, transparent 78%)`,
	};
}

export function buttonShapeRadius(shape?: string): string {
	switch (shape) {
		case 'pill':
			return '9999px';
		case 'square':
			return '0.375rem';
		case 'rounded':
		default:
			return '1rem';
	}
}

export function resolveAppearance(theme?: ProjectThemeResponse): 'light' | 'dark' {
	const appearance = theme?.appearance ?? 'dark';
	if (appearance === 'auto' && browser) {
		return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
	}
	return appearance === 'light' ? 'light' : 'dark';
}

export function themeToStyle(theme?: ProjectThemeResponse): string {
	const accent = accentPalette(theme?.accentColor ?? '#c9a227');
	const appearance = resolveAppearance(theme);
	const radiusButton = buttonShapeRadius(theme?.buttonShape);

	const variables: Record<string, string> = {
		'--color-primary': accent.primary,
		'--color-primary-dark': accent.primaryDark,
		'--color-primary-light': accent.primaryLight,
		'--color-primary-bg': accent.primaryBg,
		'--color-accent': accent.primary,
		'--color-accent-dark': accent.primaryDark,
		'--color-accent-light': accent.primaryLight,
		'--color-accent-bg': accent.primaryBg,
		'--color-focus-ring': accent.focusRing,
		'--shadow-glow': accent.glow,
		'--radius-button': radiusButton,
	};

	if (appearance === 'light') {
		Object.assign(variables, {
			'--color-bg': '#f5f1ea',
			'--color-bg-elevated': '#ffffff',
			'--color-bg-overlay': 'rgba(0, 0, 0, 0.5)',
			'--color-text': '#1c1c1c',
			'--color-text-secondary': '#5c5751',
			'--color-text-muted': '#918a81',
			'--color-heading': '#1c1c1c',
			'--color-border': 'rgba(28, 24, 18, 0.1)',
			'--color-border-subtle': 'rgba(28, 24, 18, 0.06)',
			'--color-border-strong': 'rgba(28, 24, 18, 0.2)',
		});
	}

	return Object.entries(variables)
		.map(([key, value]) => `${key}: ${value}`)
		.join('; ');
}
