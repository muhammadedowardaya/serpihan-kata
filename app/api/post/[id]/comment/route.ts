import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
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
		const id = nanoid();
		const postId = (await params).id;
		const { message, userId } = await request.json();
		const comment = await prisma.comment.create({
			data: {
				id,
				message,
				postId,
				userId,
			},
		});

		return NextResponse.json({
			comment,
			success: true,
			status: 200,
		});
	} catch (error) {
		if (error instanceof Error) {
			console.info('failed to add comment to post ', error);
		}

		return NextResponse.json({
			success: false,
			status: 500,
		});
	}
};
