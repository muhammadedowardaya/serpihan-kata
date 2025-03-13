import React from 'react';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import {
	NotificationItemProps,
	NotificationList,
} from '@/components/NotificationList';

const NotificationsPage = async () => {
	const session = await auth();
	const userId = session?.user.id;

	const notifications = await prisma.notification.findMany({
		where: { userId, isRead: true },
		include: {
			comment: {
				select: {
					id: true,
					message: true,
				},
			},
			actor: {
				select: {
					username: true,
					image: true,
				},
			},
			post: {
				select: {
					slug: true,
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	const mappedNotifications: NotificationItemProps[] = notifications.map(
		(n) => ({
			id: n.id,
			type: n.type as NotificationItemProps['type'],
			createdAt: n.createdAt,
			isRead: n.isRead,
			actor: {
				username: n.actor.username || 'Unknown',
				image: n.actor.image || 'https://github.com/shadcn.png',
			},
			postSlug: n.post?.slug || null,
			commentId: n.comment?.id || null,
		})
	);

	const unreadNotifications = await prisma.notification.findMany({
		where: { userId, isRead: false },
		include: {
			comment: {
				select: {
					id: true,
					message: true,
				},
			},
			actor: {
				select: {
					username: true,
					image: true,
				},
			},
			post: {
				select: {
					slug: true,
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	const mappedUnreadNotifications: NotificationItemProps[] =
		unreadNotifications.map((n) => ({
			id: n.id,
			type: n.type as NotificationItemProps['type'],
			createdAt: n.createdAt,
			isRead: n.isRead,
			actor: {
				username: n.actor.username || 'Unknown',
				image: n.actor.image || 'https://github.com/shadcn.png',
			},
			postSlug: n.post?.slug || null,
			commentId: n.comment?.id || null,
		}));

	return (
		<div className="py-4">
			<NotificationList
				notifications={mappedNotifications}
				unreadNotifications={mappedUnreadNotifications}
			/>
		</div>
	);
};

export default NotificationsPage;
