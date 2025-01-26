import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
	const { postId, commentId } = Object.fromEntries(
		new URL(request.url).searchParams
	);

	try {
		const likes = await prisma.like.findMany({
			where: {
				...(postId && { postId }),
				...(commentId && { commentId }),
			},
		});

		return NextResponse.json({ success: true, likes });
	} catch (error) {
		return NextResponse.json(
			{ success: false, message: error },
			{ status: 500 }
		);
	}
};
