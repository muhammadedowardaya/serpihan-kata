import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { timeAgo } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';

import { AnimatePresence, motion } from 'motion/react';

export const NotificationItem = ({
	type,
	username,
	userImage,
	createdAt,
	className,
	isLoading,
	isRead,
	onClick,
}: {
	type: 'LIKE_POST' | 'LIKE_COMMENT' | 'COMMENT_POST' | 'REPLY_COMMENT';
	username: string;
	userImage: string;
	createdAt: Date;
	className?: string;
	isLoading?: boolean;
	isRead: boolean;
	onClick?: () => void;
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
		<article
			className={`${className} relative overflow-hidden z-10 flex gap-3 h-max p-2 pr-3 rounded min-w-fit w-fit max-w-[500px]
                    ${
											isRead
												? 'border border-primary/50'
												: 'border border-white bg-secondary'
										}
                `}
			onClick={() => {
				if (onClick) onClick();
			}}
		>
			<Avatar className="float-left object-cover rounded-full">
				<AvatarImage
					src={userImage}
					alt={`${username} image`}
					className="border-2 border-border bg-primary text-primary-foreground object-cover rounded-full"
				/>
				<AvatarFallback className="border-2 border-border bg-primary text-primary-foreground object-cover rounded-full">
					{username.slice(0, 2).toUpperCase()}
				</AvatarFallback>
			</Avatar>
			<p className="mt-[2px] text-sm overflow-auto break-words whitespace-pre-wrap">
				<span className="font-semibold text-slate-900">{username} </span>
				<span className="text-slate-700">{notificationMessage} </span>
				<span className="text-slate-400 break-keep whitespace-nowrap">
					{timeAgo(
						typeof createdAt === 'string'
							? new Date(createdAt).toISOString()
							: createdAt.toISOString()
					)}
				</span>
			</p>

			<AnimatePresence>
				{isLoading && (
					<motion.div
						className="z-20 absolute flex justify-center rounded items-center left-0 bottom-0 top-0 right-0 bg-black/40 backdrop-blur-[2px]"
						initial={{ y: -100 }}
						animate={{ y: 0 }}
						transition={{
							duration: 1,
							type: 'spring',
							bounce: 0.5,
						}}
						exit={{ y: -100 }}
					>
						<div className="flex items-center gap-2 justify-center">
							<LoaderCircle
								size={20}
								strokeWidth={3}
								className={`animate-spin shrink-0 stroke-white drop-shadow-md shadow-black`}
							/>
							<span
								className={`text-sm font-semibold text-white drop-shadow-md shadow-black`}
							>
								Loading . . .
							</span>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</article>
	);
};
