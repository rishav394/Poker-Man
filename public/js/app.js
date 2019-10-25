var toastHTML =
	'<span>New Update Available</span><button onClick="reload()" class="btn-flat toast-action">Reload</button>';

function reload() {
	newWorker.postMessage({ action: 'skipWaiting' });
}

let newWorker;

if ('serviceWorker' in navigator) {
	navigator.serviceWorker
		.register('/sw.js')
		.then((reg) => {
			reg.addEventListener('updatefound', () => {
				newWorker = reg.installing;

				newWorker.addEventListener('statechange', () => {
					switch (newWorker.state) {
						case 'installed':
							if (navigator.serviceWorker.controller) {
								M.toast({
									html: toastHTML,
									displayLength: 100 * 1000,
									classes: 'red rounded center',
								});
							}
							break;
						default:
							console.log(newWorker.state);
					}
				});
			});
			console.log('Service worker registered', reg);
		})
		.catch((err) => console.log('Service worker not registered', err));

	let refreshing;
	navigator.serviceWorker.addEventListener('controllerchange', function() {
		if (refreshing) return;
		window.location.reload();
		refreshing = true;
	});
}
