import axios from 'axios';
// BCV8zg3L26yg1Rk02xxuj7ndww2lpLlt7mM-mhhBsUv41ySNTO2XLWQYSrrDMssYJze4x3JE-yqYCQyY3U13sT4

export const registerServiceWorker = async () => {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker
			.register('/service-worker.js')
			.then((response) => {
				console.log('Service worker registered', response);
			})
			.catch((error) =>
				console.log('Service worker failed registration', error)
			);
	}

	if (!('serviceWorker' in navigator)) return;

	const registration = await navigator.serviceWorker.ready;
	const existingSubscription =
		await registration?.pushManager.getSubscription();

	if (!existingSubscription) {
		const newSubscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey:
				'BCV8zg3L26yg1Rk02xxuj7ndww2lpLlt7mM-mhhBsUv41ySNTO2XLWQYSrrDMssYJze4x3JE-yqYCQyY3U13sT4',
		});

		try {
			await axios.post('https://localhost:3004/push/subscribe', {
				data: JSON.stringify(newSubscription),
			});

			console.log('Subscribe successfully!', newSubscription);

			return newSubscription;
		} catch (error) {
			console.error('Failed subscribe to /push/subscribe');

			if (error instanceof Error) {
				console.error(error.message);
			}
		}
	} else {
		console.log('Already subscribe', existingSubscription);

		return existingSubscription;
	}
};
