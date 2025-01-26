import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveImage } from '@/lib/save-image';

export const POST = async (request: Request) => {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const postId = formData.get('postId') as string;

		const post = await prisma.post.findUnique({
			where: { id: postId },
		});

		if (!post) {
			return NextResponse.json(
				{ message: 'Post ID does not exist' },
				{ status: 400 }
			);
		}

		if (!file || !postId) {
			return NextResponse.json(
				{ message: 'File or postId is missing' },
				{ status: 400 }
			);
		}

		if (!file.type.startsWith('image/')) {
			return NextResponse.json(
				{ message: 'Only image files are allowed' },
				{ status: 400 }
			);
		}

		const image = await saveImage(file, postId);

		if (image.success) {
			await prisma.image.create({
				data: {
					id: image.uniqueId,
					url: image.url as string,
					postId: postId,
				},
			});

			return NextResponse.json(
				{ message: 'Image uploaded successfully', url: image.url },
				{ status: 200 }
			);
		} else {
			return NextResponse.json(
				{ message: 'Failed to upload image', error: image.error },
				{ status: 500 }
			);
		}
	} catch (error) {
		if (error instanceof Error) {
			console.log('Error saving image:', error.message);
		}

		return NextResponse.json(
			{
				message: 'Internal server error',
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
};
