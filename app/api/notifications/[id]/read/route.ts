import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const PATCH = async (
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) => {
	try {
		const id = (await params).id;
		const notification = await prisma.notification.update({
			where: {
				id,
			},
			data: {
				isRead: true,
			},
			select: {
				post: {
					select: {
						slug: true,
					},
				},
				commentId: true,
			},
		});

		return NextResponse.json(
			{
				notification,
			},
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof Error) {
			console.dir(error);
		}
		return NextResponse.json(
			{
				error: 'Internal server error',
			},
			{
				status: 500,
			}
		);
	}
};
