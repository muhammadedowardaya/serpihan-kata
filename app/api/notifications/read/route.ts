import { auth } from '@/auth';
import { NotificationItemProps } from '@/components/NotificationList';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
	try {
		const { searchParams } = new URL(request.url);
		const page = Number(searchParams.get('page')) || 1;
		const limit = Number(searchParams.get('limit')) || 5;
		const offset = (page - 1) * limit;

		const session = await auth();
		const userId = session?.user.id;

		const readNotifications = await prisma.notification.findMany({
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
			skip: offset,
			take: limit,
			orderBy: { createdAt: 'desc' },
		});

		const totalReadNotifications = await prisma.notification.count({
			where: {
				userId,
				isRead: true,
			},
		});

		const hasMore = offset + limit < totalReadNotifications;

		const read: NotificationItemProps[] = readNotifications.map((n) => ({
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

		return NextResponse.json(
			{
				read,
				hasMore,
				page,
			},
			{
				status: 200,
			}
		);
	} catch (error) {
		return NextResponse.json(
			{
				error,
			},
			{
				status: 500,
			}
		);
	}
};
