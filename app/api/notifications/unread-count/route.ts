import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const GET = async () => {
	try {
		const session = await auth();
		const userId = session?.user.id;

		const unreadCount = await prisma.notification.count({
			where: {
				userId,
			},
		});

		return NextResponse.json(
			{
				unreadCount,
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
