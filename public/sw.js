const staticCacheName = 'site-static-v3';
const dynamicCacheName = 'site-dynamic-v3';

const assets = [
	'/',
	'/index.html',
	'/404.html',
	'/js/app.js',
	'/js/ui.js',
	'/js/materialize.min.js',
	'/css/icon.css',
	'/css/styles.css',
	'/css/materialize.min.css',
	'https://fonts.gstatic.com/s/materialicons/v48/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
];

const limitSize = (name, size) => {
	caches.open(name).then((caches) => {
		caches.keys().then((keys) => {
			if (keys.length > size) {
				caches.delete(keys[0]).then(limitSize(name, size));
			}
		});
	});
};

// install event
self.addEventListener('install', (evt) => {
	//console.log('service worker installed');
	evt.waitUntil(
		caches.open(staticCacheName).then((cache) => {
			console.log('caching shell assets');
			cache.addAll(assets);
		}),
	);
});

// activate event
self.addEventListener('activate', (evt) => {
	//console.log('service worker activated');
	evt.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys
					.filter(
						(key) =>
							key !== staticCacheName && key !== dynamicCacheName,
					)
					.map((key) => caches.delete(key)),
			);
		}),
	);
});

// fetch events
self.addEventListener('fetch', (evt) => {
	if (evt.request.url.indexOf('firestore.googleapis.com') === -1) {
		evt.respondWith(
			caches
				.match(evt.request)
				.then((cacheRes) => {
					return (
						cacheRes ||
						fetch(evt.request).then((fetchRes) => {
							return caches
								.open(dynamicCacheName)
								.then((cache) => {
									cache.put(
										evt.request.url,
										fetchRes.clone(),
									);
									return fetchRes;
								});
						})
					);
				})
				.catch(() => {
					console.log('Unknown URL');

					if (evt.request.url.indexOf('.html') > -1) {
						return caches.match('/404.html');
					}
				}),
		);
	}
});
