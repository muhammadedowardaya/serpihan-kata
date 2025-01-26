import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
	try {
		const { userId, commentId, postId } = await request.json();

		if (!userId || (!postId && !commentId)) {
			console.info('Invalid data pada api/like | POST');
			return NextResponse.json(
				{ success: false, message: 'Invalid data' },
				{ status: 400 }
			);
		}

		await prisma.like.create({
			data: {
				userId,
				commentId: commentId || undefined,
				postId: postId || undefined,
			},
		});

		console.info('postId pada /api/like | POST :', postId);
		console.info('userId pada /api/like | POST :', userId);
		console.info('commentId pada /api/like | POST :', commentId);

		return NextResponse.json({
			// like,
			success: true,
			status: 200,
		});
	} catch (error) {
		if (error instanceof Error) {
			console.info(error.message);
		}

		return NextResponse.json({
			success: false,
			status: 500,
		});
	}
};

export const DELETE = async (request: NextRequest) => {
	try {
		const { userId, postId, commentId } = await request.json();

		if (!userId || (!postId && !commentId)) {
			return NextResponse.json(
				{ success: false, message: 'Invalid data' },
				{ status: 400 }
			);
		}

		// Hapus "like" dari post atau comment
		await prisma.like.deleteMany({
			where: {
				userId,
				postId: postId || undefined,
				commentId: commentId || undefined,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json({ success: false, error: error }, { status: 500 });
	}
};
