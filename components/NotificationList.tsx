'use client';

import React, { useState } from 'react';
import { NotificationItem } from './NotificationItem';
import { NotificationType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

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

interface NotificationMutation {
	post: {
		slug: string;
	};
	commentId: string;
}

export const NotificationList = ({
	notifications,
}: {
	notifications: NotificationItemProps[];
}) => {
	const router = useRouter();

	const [selectedId, setSelectedId] = useState<string | null>(null);

	const mutation = useMutation<NotificationMutation, Error, { id: string }>({
		mutationKey: ['readNotification'],
		mutationFn: async ({ id }: { id: string }) => {
			const response = await axios.patch(`/api/notifications/${id}/read`, {
				id,
			});
			return response.data.notification;
		},
		onSuccess: (data) => {
			if (data.commentId && data.post.slug) {
				router.push(`/post/${data.post.slug}?comment=${data.commentId}`);
			} else if (data.post.slug) {
				router.push(`/post/${data.post.slug}`);
			}

			setSelectedId(null);
		},
		onError: () => {
			setSelectedId(null);
			console.error('Failed to read notification');
		},
	});

	const handleOnClick = ({ id }: { id: string }) => {
		mutation.mutate({ id });
	};

	return (
		<>
			{notifications.length > 0 ? (
				<div className="flex flex-col gap-4 justify-start">
					{notifications.map(
						({ id, type, createdAt, isRead, actor, commentId, postSlug }) => (
							<NotificationItem
								key={id}
								onClick={() => {
									setSelectedId(id);

									if (!isRead) {
										handleOnClick({
											id,
										});
									} else {
										if (commentId && postSlug) {
											router.push(`/post/${postSlug}?comment=${commentId}`);
										} else if (postSlug) {
											router.push(`/post/${postSlug}`);
										}
										setSelectedId(null);
									}
								}}
								isLoading={selectedId === id}
								isRead={isRead}
								username={actor.username}
								userImage={actor.image}
								type={type}
								createdAt={createdAt}
							/>
						)
					)}
				</div>
			) : (
				<p className="mt-6">No notifications</p>
			)}
		</>
	);
};
