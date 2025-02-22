import {
	createNotification,
	getUnreadNotification,
} from '@/actions/notification';
import { getTargetUser } from '@/actions/user';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { TargetUser } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (
	request: NextRequest,
	{
		params,
	}: {
		params: Promise<{ id: string }>;
	}
) => {
	try {
		const session = await auth();
		const userId = session?.user.id as string;
		const postId = (await params).id;
		const { message } = await request.json();

		let unreadCount: number = 0;
		let targetUserId: string | null = null;
		let targetUser: TargetUser | null = null;
		let commentId: string | null = null;

		await prisma.$transaction(async (prisma) => {
			const comment = await prisma.comment.create({
				data: {
					message,
					post: {
						connect: {
							id: postId,
						},
					},
					user: {
						connect: {
							id: userId,
						},
					},
				},
				select: {
					id: true,
				},
			});

			commentId = comment.id;

			if (postId) {
				const post = await prisma.post.findUnique({
					where: {
						id: postId,
					},
					select: {
						userId: true,
					},
				});

				targetUserId = post?.userId || null;
			}
		});

		if (targetUserId && commentId && targetUserId !== userId) {
			await createNotification({
				targetUserId,
				actorId: userId,
				type: 'COMMENT_POST',
				postId,
				commentId,
			});

			unreadCount = (await getUnreadNotification(
				targetUserId
			)) as unknown as number;

			targetUser = (await getTargetUser(targetUserId)) as unknown as TargetUser;
		}

		return NextResponse.json(
			{
				targetUser,
				unreadCount,
				commentId,
				success: true,
			},
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof Error) {
			console.info('failed to add comment to post ', error);
		}

		return NextResponse.json(
			{
				success: false,
			},
			{ status: 500 }
		);
	}
};
