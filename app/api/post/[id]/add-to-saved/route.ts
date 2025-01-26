import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (
	request: NextRequest,
	{
		params,
	}: {
		params: Promise<{ id: string }>;
	}
) => {
	try {
		const session = await auth();

		const { id: postId } = await params;
		const userId = session?.user?.id as string;

		const savedPost = await prisma.savedPost.create({
			data: {
				postId,
				userId,
			},
		});

		return NextResponse.json({
			success: true,
			status: 200,
			savedPost,
		});
	} catch (error) {
		return NextResponse.json({
			error,
			success: false,
			status: 500,
		});
	}
};
