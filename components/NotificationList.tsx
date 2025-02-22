'use client';

import React from 'react';
import { NotificationItem } from './NotificationItem';
import { NotificationType } from '@prisma/client';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

export interface NotificationItemProps {
	id: string;
	type: NotificationType;
	createdAt: Date;
	isRead: boolean;
	actor: {
		username: string;
		image: string;
	};
	commentId?: string | null;
	postSlug?: string | null;
}

export const NotificationList = ({
	notifications,
}: {
	notifications: NotificationItemProps[];
}) => {
	const router = useRouter();

	const handleOnClick = ({
		postSlug,
		commentId,
	}: {
		postSlug: string | undefined | null;
		commentId: string | undefined | null;
	}) => {
		if (commentId && postSlug) {
			router.push(`/post/${postSlug}?comment=${commentId}`);
		} else if (postSlug) {
			router.push(`/post/${postSlug}`);
		}
	};

	return (
		<div>
			{notifications.length > 0 ? (
				<div className="flex flex-col gap-2">
					{notifications.map(
						({ id, type, createdAt, isRead, actor, postSlug, commentId }) => (
							<Button
								key={id}
								variant="ghost"
								onClick={() => {
									handleOnClick({
										postSlug,
										commentId,
									});
									console.info(postSlug);
									console.info(commentId);
								}}
								className="h-max w-max p-0"
							>
								<NotificationItem
									username={actor.username}
									userImage={actor.image}
									type={type}
									createdAt={createdAt}
									className={
										isRead
											? 'bg-gray-100 dark:bg-gray-800'
											: 'bg-blue-100 dark:bg-blue-900'
									}
								/>
							</Button>
						)
					)}
				</div>
			) : (
				<p>No notifications</p>
			)}
		</div>
	);
};
