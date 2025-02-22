import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) => {
	try {
		const id = (await params).id;
		const replies = await prisma.comment.findMany({
			where: {
				parentId: id,
			},
			include: {
				user: true,
				likes: true,
				parent: {
					include: {
						user: true,
						likes: true,
					},
				},
				replyTo: {
					include: {
						user: true,
						likes: true,
					},
				},
				post: {
					select: {
						id: true,
						slug: true,
					},
				},
			},
		});

		return NextResponse.json(
			{
				replies,
				success: true,
			},
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{
				error,
				success: false,
			},
			{ status: 500 }
		);
	}
};
