const CACHE_VERSION = 'v1';

self.addEventListener('install', (event) => {
	console.log(`✅ Service Worker Installed - ${CACHE_VERSION}`);
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	console.log(`✅ Service Worker Activated - ${CACHE_VERSION}`);
	event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
	const data = event.data.json();
	console.log('data pada sw.js', data);

	const options = {
		body: `${data.username} ${data.body}`,
		icon: data.image || '/logo.png',
		data: { url: data.url || '/' }, // 🔗 URL tujuan saat notifikasi diklik
	};

	event.waitUntil(
		self.registration.showNotification(`New 🔔 from ${data.username}`, options)
	);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close(); // 🔒 Tutup notifikasi saat diklik

	// 🔗 Buka URL yang diberikan dalam notifikasi
	event.waitUntil(
		clients
			.matchAll({ type: 'window', includeUncontrolled: true })
			.then((clientList) => {
				for (let client of clientList) {
					if (client.url === event.notification.data.url && 'focus' in client) {
						return client.focus();
					}
				}
				if (clients.openWindow) {
					return clients.openWindow(event.notification.data.url);
				}
			})
	);
});
