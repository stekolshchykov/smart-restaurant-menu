<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import Button from '$lib/components/Button.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import PasswordInput from '$lib/components/forms/PasswordInput.svelte';
	import FormError from '$lib/components/forms/FormError.svelte';

	let name = $state('');
	let email = $state('');
	let password = $state('');

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		auth.clearError();
		await auth.register(name, email, password);
	}
</script>

<svelte:head>
	<title>Создать аккаунт — Digital Menu</title>
</svelte:head>

<section class="mx-auto max-w-md px-4 py-16">
	<div class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 shadow-lg">
		<h1
			class="text-3xl font-bold"
			style="font-family: var(--font-heading); color: var(--color-heading);"
		>
			Создать аккаунт
		</h1>
		<p class="mt-2" style="color: var(--color-text-secondary);">
			Зарегистрируйтесь, чтобы начать создавать меню.
		</p>

		<form class="mt-8 flex flex-col gap-5" onsubmit={handleSubmit}>
			<TextInput
				label="Имя"
				name="name"
				placeholder="Иван Иванов"
				required
				bind:value={name}
			/>
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
				{auth.loading ? 'Создаём аккаунт...' : 'Создать аккаунт'}
			</Button>
		</form>

		<p class="mt-6 text-center text-sm" style="color: var(--color-text-secondary);">
			Уже есть аккаунт?
			<a
				href="/login"
				class="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-light)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
			>
				Войти
			</a>
		</p>
	</div>
</section>
