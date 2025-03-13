'use client';

import { socket } from '@/socket-client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

export const UnreadNotification = ({ className }: { className?: string }) => {
	const [unreadCount, setUnreadCount] = useState(0);

	const getUnreadCount = useQuery<number>({
		queryKey: ['unreadNotificationsCount'],
		queryFn: async () => {
			const response = await axios.get('/api/notifications/unread-count');
			return response.data.unreadCount;
		},
		staleTime: 1000 * 60, // Mencegah refetch terlalu sering
	});

	useEffect(() => {
		if (getUnreadCount.data) {
			setUnreadCount(getUnreadCount.data);
		}
	}, [getUnreadCount.data]);

	useEffect(() => {
		socket.on('unreadCountNotification', (unread) => {
			setUnreadCount(unread);
		});

		return () => {
			socket.off('unreadCountNotification');
		};
	}, []);

	return (
		<div>
			{unreadCount > 0 && (
				<div
					className={`${className} flex items-center justify-center w-5 h-5 bg-red-500 rounded-full`}
				>
					<span className="font-bold text-xs text-white">
						{unreadCount > 9 ? '9+' : unreadCount}
					</span>
				</div>
			)}
		</div>
	);
};
