import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const PATCH = async (
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) => {
	try {
		console.info('publish post');

		const id = (await params).id;
		const { isDraft } = await request.json();

		const myPost = await prisma.post.update({
			where: {
				id,
			},
			data: {
				isDraft,
			},
		});

		return NextResponse.json(
			{
				myPost,
			},
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof Error) {
			console.info(error.message);
		}
		return NextResponse.json(
			{
				error: 'Error publishing post',
			},
			{
				status: 500,
			}
		);
	}
};
