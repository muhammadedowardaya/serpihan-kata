import { prisma } from '@/lib/prisma';

export const createNotification = async ({
	targetUserId,
	actorId,
	type,
	postId,
	commentId,
	likeId,
}: {
	targetUserId: string;
	actorId: string;
	type: 'LIKE_POST' | 'LIKE_COMMENT' | 'COMMENT_POST' | 'REPLY_COMMENT';
	postId?: string;
	commentId?: string;
	likeId?: string;
}) => {
	try {
		const notification = await prisma.notification.create({
			data: {
				user: { connect: { id: targetUserId } },
				actor: { connect: { id: actorId } },
				like: likeId
					? {
							connect: {
								id: likeId,
							},
					  }
					: undefined,
				type,
				post: postId ? { connect: { id: postId } } : undefined,
				comment: commentId ? { connect: { id: commentId } } : undefined,
			},
		});

		return notification;
	} catch (error) {
		console.error('Error creating notification :');

		if (error instanceof Error) {
			console.error(error.message);
		}
	}
};

export const getUnreadNotification = async (targetUserId: string) => {
	try {
		const unreadCount = await prisma.notification.count({
			where: {
				userId: targetUserId,
				isRead: false,
			},
		});

		return unreadCount;
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
		}
	}
};
