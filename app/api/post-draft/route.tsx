import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const POST = async (request: Request) => {
	try {
		const data = await request.json();

		// Validasi bahwa data adalah objek dan memiliki properti yang diperlukan
		if (!data || typeof data !== 'object' || !data.postId || !data.userId) {
			return NextResponse.json(
				{ error: 'Invalid input data' },
				{ status: 400 }
			);
		}

		const { postId, userId } = data;

		const draft = await prisma.post.create({
			data: {
				id: postId,
				userId,
				title: 'Draft Title',
				slug: postId,
				description: 'Draft Description',
				content: 'Draft Content',
			},
		});

		return NextResponse.json({ postId: draft.id }, { status: 200 });
	} catch (error) {
		console.table(error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
};
