<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import Button from '$lib/components/Button.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import PasswordInput from '$lib/components/forms/PasswordInput.svelte';
	import FormError from '$lib/components/forms/FormError.svelte';

	let email = $state('');
	let password = $state('');

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		auth.clearError();
		await auth.login(email, password);
	}
</script>

<svelte:head>
	<title>Войти в кабинет — Digital Menu</title>
</svelte:head>

<section class="mx-auto max-w-md px-4 py-16">
	<div class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 shadow-lg">
		<h1
			class="text-3xl font-bold"
			style="font-family: var(--font-heading); color: var(--color-heading);"
		>
			Войти в кабинет
		</h1>
		<p class="mt-2" style="color: var(--color-text-secondary);">
			Введите email и пароль, чтобы продолжить.
		</p>

		<form class="mt-8 flex flex-col gap-5" onsubmit={handleSubmit}>
			<TextInput
				label="Email"
				type="email"
				name="email"
				placeholder="you@example.com"
				required
				bind:value={email}
			/>
			<PasswordInput
				label="Пароль"
				name="password"
				placeholder="••••••••"
				required
				bind:value={password}
			/>

			<FormError message={auth.error} />

			<Button type="submit" class="w-full" disabled={auth.loading}>
				{auth.loading ? 'Вход...' : 'Войти'}
			</Button>
		</form>

		<p class="mt-6 text-center text-sm" style="color: var(--color-text-secondary);">
			Нет аккаунта?
			<a
				href="/register"
				class="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-light)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
			>
				Создать аккаунт
			</a>
		</p>
	</div>
</section>
