<svelte:head>
	<title>Digital Menu — Главная</title>
</svelte:head>

<section class="flex flex-col items-center justify-center px-4 py-24 text-center">
	<h1
		class="max-w-3xl text-4xl font-bold leading-tight md:text-5xl"
		style="font-family: var(--font-heading); color: var(--color-heading);"
	>
		Цифровое меню, которое выглядит как ваше заведение, а не как интернет-магазин.
	</h1>
	<p class="mt-6 max-w-xl text-lg" style="color: var(--color-text-secondary);">
		Создавайте элегантные меню для гостей, управляйте позициями и получайте заказы за столом.
	</p>
	<div class="mt-8 flex flex-wrap justify-center gap-4">
		<a
			href="/register"
			class="rounded-md bg-[var(--color-primary)] px-6 py-3 font-medium text-[var(--color-bg)] transition-colors hover:bg-[var(--color-primary-light)]"
		>
			Начать бесплатно
		</a>
		<a
			href="/login"
			class="rounded-md border border-[var(--color-border-strong)] px-6 py-3 font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-primary-bg)]"
		>
			Войти
		</a>
	</div>
</section>
