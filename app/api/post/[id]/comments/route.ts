import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) => {
	try {
		const id = (await params).id;
		const comments = await prisma.comment.findMany({
			where: {
				postId: id,
				parentId: null,
			},
			include: {
				user: true,
				likes: true,
				replies: {
					include: {
						replyTo: {
							include: {
								user: true,
							},
						},
						user: true,
						parent: {
							include: {
								user: true,
							},
						},
					},
				},
			},
		});

		return NextResponse.json({
			comments,
			status: 200,
			success: true,
		});
	} catch (error) {
		if (error instanceof Error) {
			console.info({ error });
		}
		return NextResponse.json({
			status: 500,
			success: false,
		});
	}
};
