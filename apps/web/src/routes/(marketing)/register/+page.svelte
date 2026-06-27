<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte';
	import Button from '$lib/components/Button.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import PasswordInput from '$lib/components/forms/PasswordInput.svelte';
	import FormError from '$lib/components/forms/FormError.svelte';

	let name = $state('');
	let email = $state('');
	let password = $state('');

	function hasMinLength(value: string) {
		return value.length >= 8;
	}

	function hasUppercase(value: string) {
		return /[A-Z]/.test(value);
	}

	function hasLowercase(value: string) {
		return /[a-z]/.test(value);
	}

	function hasDigit(value: string) {
		return /\d/.test(value);
	}

	function hasSpecialChar(value: string) {
		return /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(value);
	}

	const requirements = $derived([
		{ label: 'Не менее 8 символов', met: hasMinLength(password) },
		{ label: 'Заглавная буква', met: hasUppercase(password) },
		{ label: 'Строчная буква', met: hasLowercase(password) },
		{ label: 'Цифра', met: hasDigit(password) },
		{ label: 'Специальный символ', met: hasSpecialChar(password) }
	]);

	const passwordValid = $derived(requirements.every((r) => r.met));
	let clientError = $state<string | null>(null);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		auth.clearError();
		clientError = null;
		if (!passwordValid) {
			clientError = 'Пароль не соответствует требованиям безопасности';
			return;
		}
		await auth.register(name, email, password);
	}
</script>

<svelte:head>
	<title>Создать аккаунт — Digital Menu</title>
</svelte:head>

<section class="mx-auto max-w-md px-4 py-16">
	<div
		class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 shadow-lg"
	>
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
				autocomplete="name"
				bind:value={name}
			/>
			<TextInput
				label="Email"
				type="email"
				name="email"
				placeholder="you@example.com"
				required
				autocomplete="email"
				bind:value={email}
			/>
			<PasswordInput
				label="Пароль"
				name="password"
				placeholder="••••••••"
				required
				autocomplete="new-password"
				bind:value={password}
			/>

			<div class="flex flex-col gap-1.5 text-sm" aria-label="Требования к паролю">
				{#each requirements as requirement}
					<div class="flex items-center gap-2">
						<span
							class="h-2 w-2 rounded-full"
							class:bg-[var(--color-success)]={requirement.met}
							class:bg-[var(--color-text-on-surface-muted)]={!requirement.met}
							aria-hidden="true"
						></span>
						<span
							class:text-[var(--color-text)]={requirement.met}
							class:text-[var(--color-text-on-surface-muted)]={!requirement.met}
						>
							{requirement.label}
						</span>
					</div>
				{/each}
			</div>

			<FormError message={clientError ?? auth.error} />

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
