import webpush from 'web-push';
import { NextResponse } from 'next/server';

webpush.setVapidDetails(
	process.env.VAPID_SUBJECT!,
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
	process.env.VAPID_PRIVATE_KEY!
);

export const POST = async (req: Request) => {
	try {
		const { username, body, image, url, subscription } = await req.json();
		if (!username || !body) {
			return NextResponse.json(
				{ error: 'username and body are required' },
				{ status: 400 }
			);
		}

		// const pushSubscription = JSON.parse(subscription);

		// 🔹 Kirim notifikasi ke subscription
		const payload = JSON.stringify({ username, body, image, url });
		console.info('subscription', subscription);

		try {
			await webpush.sendNotification(subscription, payload);
		} catch (error) {
			console.error('Push error:', error);
		}

		return NextResponse.json({ message: 'Notification sent' }, { status: 200 });
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error sending notification:', error.message);
		}
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
};
