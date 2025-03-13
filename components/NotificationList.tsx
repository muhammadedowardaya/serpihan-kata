'use client';

import React, { useEffect, useState } from 'react';
import { NotificationItem } from './NotificationItem';
import { NotificationType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { ScrollArea } from './ui/scroll-area';
import { LoaderCircle } from 'lucide-react';

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
	unreadNotifications,
}: {
	notifications: NotificationItemProps[];
	unreadNotifications: NotificationItemProps[];
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

	const limit = 5;

	const getReadNotifications = useInfiniteQuery({
		queryKey: ['readNotifications'],
		queryFn: async ({ pageParam = 1 }) => {
			const response = await axios.get(
				`/api/notifications/read?page=${pageParam}&limit=${limit}`
			);
			return response.data;
		},
		initialPageParam: 1,
		select: (data) => ({
			...data,
			pageParams: data.pageParams[0],
			pages: data.pages[0],
		}),
		initialData: {
			pages: [
				{
					read: notifications as unknown as NotificationItemProps[],
					page: 1,
					hasMore: false,
				},
			],
			pageParams: [1],
		},
		getNextPageParam: (data) => {
			return data.hasMore ? data.page + 1 : undefined;
		},
	});

	const getUnreadNotifications = useInfiniteQuery({
		queryKey: ['unreadNotifications'],
		queryFn: async ({ pageParam = 1 }) => {
			const response = await axios.get(
				`/api/notifications/unread?page=${pageParam}&limit=${limit}`
			);
			return response.data;
		},
		initialPageParam: 1,
		select: (data) => ({
			...data,
			pageParams: data.pageParams[0],
			pages: data.pages[0],
		}),
		initialData: {
			pages: [
				{
					unread: unreadNotifications as unknown as NotificationItemProps[],
					page: 1,
					hasMore: false,
				},
			],
			pageParams: [1],
		},
		getNextPageParam: (data) => {
			return data.hasMore ? data.page + 1 : undefined;
		},
	});

	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) return null;

	return (
		<div className="relative">
			<div>
				<h2 className="py-2 bg-background text-background-foreground sticky top-0 z-40">
					Unread Notifications
				</h2>
				{getUnreadNotifications.isPending ? (
					<div className="flex items-center justify-center">
						<div className="flex items-center justify-center gap-2">
							<LoaderCircle className="animate-spin" />
							<span>Loading...</span>
						</div>
					</div>
				) : (
					<ScrollArea className="max-h-[400px]">
						{getUnreadNotifications.data?.pages.unread &&
						getUnreadNotifications.data?.pages.unread.length > 0 ? (
							<div className="flex flex-col gap-4 justify-start">
								{getUnreadNotifications.data.pages.unread.map(
									({
										id,
										type,
										createdAt,
										isRead,
										actor,
										commentId,
										postSlug,
									}: NotificationItemProps) => (
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
														router.push(
															`/post/${postSlug}?comment=${commentId}`
														);
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
					</ScrollArea>
				)}
			</div>

			<div className="mt-4">
				<h2 className="py-2 bg-background text-background-foreground sticky top-0 z-40">
					Viewed Notifications
				</h2>
				{getReadNotifications.isPending ? (
					<div className="flex items-center justify-center">
						<div className="flex items-center justify-center gap-2">
							<LoaderCircle className="animate-spin" />
							<span>Loading...</span>
						</div>
					</div>
				) : (
					<ScrollArea className="max-h-[400px]">
						{getReadNotifications.data?.pages.read &&
						getReadNotifications.data?.pages.read.length > 0 ? (
							<div className="flex flex-col gap-4 justify-start">
								{getReadNotifications.data.pages.read.map(
									({
										id,
										type,
										createdAt,
										isRead,
										actor,
										commentId,
										postSlug,
									}: NotificationItemProps) => (
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
														router.push(
															`/post/${postSlug}?comment=${commentId}`
														);
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
					</ScrollArea>
				)}
			</div>
		</div>
	);
};
