import Swal from 'sweetalert2';

export const registerPushNotification = async () => {
	console.log('🚀 Memulai pendaftaran push notification...');

	if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
		console.warn('⚠️ Push notifications tidak didukung.');
		return;
	}

	try {
		console.log('🔹 Mendaftarkan Service Worker...');
		const registration = await navigator.serviceWorker.register(
			'/service-worker.js'
		);
		console.log('✅ Service Worker terdaftar:', registration);

		await navigator.serviceWorker.ready;
		console.log('✅ Service Worker siap');

		// 🔹 Periksa izin notifikasi
		if (
			Notification.permission === 'default' ||
			Notification.permission === 'denied'
		) {
			const result = await Swal.fire({
				title: 'Izinkan Notifikasi?',
				text: 'Kami ingin mengirimkan notifikasi tentang pembaruan penting.',
				icon: 'question',
				showCancelButton: true,
				confirmButtonText: 'Izinkan',
				cancelButtonText: 'Tolak',
			});

			if (!result.isConfirmed) {
				console.warn('❌ User menolak izin notifikasi.');
				return;
			}
		}

		// 🔹 Minta izin notifikasi
		const permission = await Notification.requestPermission();
		console.log('🔹 Status izin notifikasi:', permission);

		if (permission !== 'granted') {
			console.warn('❌ Izin push notification ditolak.');
			return;
		}

		console.log('🔹 Mengambil VAPID Key...');
		const applicationServerKey = urlBase64ToUint8Array(
			process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
		);

		console.log('🔹 Melakukan subscription...');
		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey,
		});

		console.log('✅ Subscription berhasil:', subscription);

		// await fetch('/api/subscription', {
		// 	method: 'POST',
		// 	body: JSON.stringify(subscription),
		// 	headers: { 'Content-Type': 'application/json' },
		// });
		// console.log('✅ Subscription berhasil dikirim ke server.');

		return subscription;
		// 🔹 Simpan subscription ke localStorage
		// localStorage.setItem('pushSubscription', JSON.stringify(subscription));
		// console.log('✅ Subscription berhasil disimpan ke localStorage.');
	} catch (error) {
		if (error instanceof Error) {
			console.error('❌ Error register push notification:', error);
		}
	}
};

// 🔹 Fungsi untuk mengonversi VAPID Key dari Base64 ke Uint8Array
function urlBase64ToUint8Array(base64String: string) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, '+')
		.replace(/_/g, '/');
	const rawData = atob(base64);
	return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}
