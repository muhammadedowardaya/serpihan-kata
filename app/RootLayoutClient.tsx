'use client';

import { SocketLayout } from '@/components/SocketLayout';
import { sendNotification } from '@/lib/sendNotification';
import { socket } from '@/socket-client';
import { subscriptionAtom, userAtom } from '@/jotai';
import { useAtom, useAtomValue } from 'jotai';
import { User } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';

export default function RootLayoutClient({
	children,
	userSession,
}: {
	children: React.ReactNode;
	userSession: User;
}) {
	const [, setUser] = useAtom(userAtom);
	const subscription = useAtomValue(subscriptionAtom);

	useEffect(() => {
		setUser(userSession);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userSession]);

	useEffect(() => {
		// Event listener untuk menerima notifikasi dari socket
		const handleNotification = async ({
			username,
			body,
			image,
			url,
		}: {
			username: string;
			body: string;
			image: string;
			url: string;
		}) => {
			try {
				await sendNotification({
					username,
					body,
					image,
					url,
					subscription: subscription as PushSubscription,
				});
				console.info('image sebelum dikirim ke sendNotification', image);
			} catch (error) {
				console.error('❌ Error handling notification:', error);
			}
		};

		socket.on('notification', handleNotification);

		return () => {
			socket.off('notification', handleNotification); // Bersihkan event listener saat unmount
		};
	}, [subscription]); // 🔹 Hapus socket dari dependensi agar listener tidak terpasang ulang

	return (
		<SessionProvider>
			<SocketLayout>{children}</SocketLayout>
		</SessionProvider>
	);
}
