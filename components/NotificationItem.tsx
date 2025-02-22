import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { timeAgo } from '@/lib/utils';

export const NotificationItem = ({
	type,
	username,
	userImage,
	createdAt,
	className,
}: {
	type: 'LIKE_POST' | 'LIKE_COMMENT' | 'COMMENT_POST' | 'REPLY_COMMENT';
	username: string;
	userImage: string;
	createdAt: Date;
	className?: string;
}) => {
	let notificationMessage: string;

	switch (type) {
		case 'COMMENT_POST':
			notificationMessage = 'commented on your post.';
			break;
		case 'LIKE_COMMENT':
			notificationMessage = 'liked your comment.';
			break;
		case 'LIKE_POST':
			notificationMessage = 'liked your post.';
			break;
		case 'REPLY_COMMENT':
			notificationMessage = 'replied to your comment.';
			break;
		default:
			notificationMessage = 'interacted with your post.';
	}

	return (
		<div className={`${className} flex items-start gap-3 p-2 pr-3 rounded`}>
			<Avatar>
				<AvatarImage src={userImage} alt={`${username} image`} />
				<AvatarFallback>{username.slice(0, 2)}</AvatarFallback>
			</Avatar>
			<p className="float-left space-x-2 break-words mt-2">
				<b className="font-semibold">{username}</b>
				<span className="text-slate-600">{notificationMessage}</span>
				<span className="text-slate-400">
					{timeAgo(createdAt.toISOString())}
				</span>
			</p>
		</div>
	);
};
