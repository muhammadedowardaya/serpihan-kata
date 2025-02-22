'use client';

import { subscriptionAtom } from '@/jotai';
import { registerPushNotification } from '@/lib/registerPushNotification';
import { socket } from '@/socket-client';
import { useAtom } from 'jotai';
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';

export const SocketLayout = ({ children }: { children: React.ReactNode }) => {
	const { data: session } = useSession();
	const [, setSubscription] = useAtom(subscriptionAtom);

	useEffect(() => {
		if (session?.user?.id) {
			// Mendaftarkan push notification saat komponen dimuat
			registerPushNotification()
				.then((response) => {
					setSubscription(response as PushSubscription);
					console.info('setSubscription');
					console.info(response);
				})
				.catch(console.error);

			socket.emit('registerUser', session?.user?.id);

			socket.on('userJoined', (message) => {
				console.log(message);
			});

			// Hapus event listener saat komponen di-unmount
			return () => {
				socket.off('userJoined');
			};
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session?.user?.id]);

	return <div>{children}</div>;
};
