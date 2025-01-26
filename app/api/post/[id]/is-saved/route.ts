import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
	request: NextRequest,
	{
		params,
	}: {
		params: Promise<{ id: string; }>;
	}
) => {
	try {
		const session = await auth();

		const postId = (await params).id;
		const userId = session?.user?.id;

		const savedPost = await prisma.savedPost.findFirst({
			where: {
				userId,
				postId,
			},
		});

		return NextResponse.json({
			savedPost,
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
