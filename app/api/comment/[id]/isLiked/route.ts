import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
	request: NextRequest,
	{
		params,
	}: {
		params: Promise<{ id: string }>;
	}
) => {
	try {
		const commentId = (await params).id;
		const { userId } = Object.fromEntries(new URL(request.url).searchParams);

		const isLiked = await prisma.like.findFirst({
			where: {
				commentId,
				userId,
			},
		});

		const comment = await prisma.comment.findFirst({
			where: {
				id: commentId,
			},
			include: {
				likes: true,
			},
		});

		return NextResponse.json({
			isLiked: userId ? !!isLiked : false,
			likes: comment?.likes,
			success: true,
			status: 200,
		});
	} catch (error) {
		return NextResponse.json({
			error,
			success: false,
			status: 500,
		});
	}
};
