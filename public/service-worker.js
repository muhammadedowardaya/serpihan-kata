const STATIC_ASSETS = ['/offline.html'];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open('static_cache').then((cache) => {
			return cache.addAll(STATIC_ASSETS);
		})
	);
});

self.addEventListener('fetch', (event) => {
	if (event.request.url.includes('localhost')) return;

	const { request } = event;

	if (
		request.destination === 'style' ||
		request.destination === 'script' ||
		request.destination === 'image'
	) {
		event.respondWith(
			caches.match(request).then((cachedResponse) => {
				return (
					cachedResponse ||
					fetch(request).then((networkResponse) => {
						caches.open('static_cache').then((cache) => {
							cache.put(request, networkResponse);
							return networkResponse;
						});
					})
				);
			})
		);
	} else {
		event.respondWith(
			fetch(request).catch(() => caches.match('/offline.html'))
		);
	}
});

self.addEventListener('push', (event) => {
	if (event.data) {
		const data = event.data.json();

		const title = `New 🔔 from ${data.username}`;

		event.waitUntil(
			self.registration.showNotification(title, {
				body: data.body,
				icon: '/logo_4x.png',
				badge: '/logo_4x.png',
				vibrate: [200, 400, 200],
				data: {
					url: data.url || '/',
				},
				actions: [
					{
						action: 'open',
						title: 'Buka Aplikasi',
					},
					{
						action: 'dismiss',
						title: 'Tutup',
					},
				],
			})
		);
	}
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	if (event.action === 'open') {
		event.waitUntil(
			clients
				.matchAll({
					type: 'window',
					includeUncontrolled: true,
				})
				.then((windowClient) => {
					if (windowClient.length > 0) {
						windowClient[0].focus();
					} else {
						clients.openWindow('/');
					}
				})
		);
	}
});
