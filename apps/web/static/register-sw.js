if ('serviceWorker' in navigator) {
	navigator.serviceWorker
		.register('/service-worker.js', { scope: '/' })
		.then((registration) => {
			registration.addEventListener('updatefound', () => {
				const newWorker = registration.installing;
				if (!newWorker) return;

				newWorker.addEventListener('statechange', () => {
					if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
						console.log('New version available; reloading to update');
						newWorker.postMessage({ type: 'SKIP_WAITING' });
					}
				});
			});
		})
		.catch((err) => {
			console.error('Service worker registration failed:', err);
		});

	let refreshing = false;
	navigator.serviceWorker.addEventListener('controllerchange', () => {
		if (refreshing) return;
		refreshing = true;
		window.location.reload();
	});
}
