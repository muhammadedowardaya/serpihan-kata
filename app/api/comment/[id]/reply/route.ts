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
		const parentId = (await params).id;

		const session = await auth();
		const userId = session?.user?.id as string;

		const { replyToId, postId, message } = await request.json();

		let commentId: string | null = null;
		let targetUserId: string | null = null;
		let targetUser: TargetUser | null = null;
		let unreadCount: number = 0;

		await prisma.$transaction(async (prisma) => {
			const newComment = await prisma.comment.create({
				data: {
					user: {
						connect: {
							id: userId,
						},
					}, // userId akan mengirim sebuah pesan
					parent: {
						connect: {
							id: parentId,
						},
					}, // ke komentar orang lain (parentId berisi id komentar orang lain)
					...(replyToId
						? {
								replyTo: {
									connect: {
										id: replyToId,
									},
								},
						  }
						: {}),
					post: {
						connect: {
							id: postId,
						},
					},
					message, // komentar
				},
				select: {
					id: true,
				},
			});

			commentId = newComment.id;

			if (replyToId) {
				const comment = await prisma.comment.findUnique({
					where: {
						id: replyToId,
					},
					select: {
						userId: true,
					},
				});

				targetUserId = comment?.userId || null;
				console.info({ replyToId });
				console.info('comment.userId', comment?.userId);
			} else {
				const comment = await prisma.comment.findUnique({
					where: {
						id: parentId,
					},
					select: {
						userId: true,
					},
				});

				targetUserId = comment?.userId || null;

				console.info(
					'replyToId tidak ada, jadi ambil berdasarkan parentId',
					comment?.userId
				);
				console.info('comment.userId', comment?.userId);
			}
		});

		console.info({ commentId, targetUserId, userId });

		if (commentId && targetUserId && targetUserId !== userId) {
			console.info('createNotification');
			await createNotification({
				targetUserId,
				actorId: userId,
				postId,
				commentId,
				type: 'REPLY_COMMENT',
			});

			console.info('getTargetUser');
			targetUser = (await getTargetUser(targetUserId)) as unknown as TargetUser;

			console.info('getUnreadNotification');
			unreadCount = (await getUnreadNotification(
				targetUserId
			)) as unknown as number;

			console.info({ targetUser });
		}

		return NextResponse.json(
			{
				targetUser,
				unreadCount,
				success: true,
			},
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof Error) {
			console.log('error saat membalas komentar', error.message);
		}
		return NextResponse.json(
			{
				error,
				success: false,
			},
			{ status: 500 }
		);
	}
};
