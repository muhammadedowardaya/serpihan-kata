import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const GET = async () => {
	try {
		const session = await auth();
		const userId = session?.user?.id;

		const notifications = await prisma.notification.findMany({
			where: {
				userId,
			},
            orderBy: {
                createdAt: 'desc',
            }
		});

		return NextResponse.json(
			{
				notifications,
			},
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{
				error,
			},
			{ status: 500 }
		);
	}
};
