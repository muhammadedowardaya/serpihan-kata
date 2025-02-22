import axios from 'axios';

export const sendNotification = async ({
	username,
	body,
	image,
	url,
	subscription,
}: {
	username: string;
	body: string;
	image: string;
	url: string;
	subscription: PushSubscription;
}) => {
	try {
		const response = await axios.post('/api/notification', {
			username,
			body,
			image,
			url,
			subscription,
		});

		console.log('✅ Notification sent:', response.data);
		return response.data;
	} catch (error) {
		console.error('❌ Error sending notification:', error);

		// Bisa melempar error agar bisa ditangani di tempat lain jika diperlukan
		throw new Error('Failed to send notification');
	}
};
