<div class="flex min-h-screen flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
	<header
		class="border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-6 py-4"
		style="font-family: var(--font-heading);"
	>
		<span class="text-lg font-semibold" style="color: var(--color-heading);">Admin</span>
	</header>
	<main class="flex-1 p-6">
		<slot />
	</main>
</div>
