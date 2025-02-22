import { auth } from '@/auth';
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
		// 1️⃣ Autentikasi User
		const session = await auth();
		const userId = session?.user?.id;

		// if (!userId) {
		// 	return NextResponse.json(
		// 		{
		// 			success: false,
		// 			message: 'You must be logged in to check likes.',
		// 		},
		// 		{
		// 			status: 401, // Unauthorized
		// 		}
		// 	);
		// }

		// 2️⃣ Validasi Parameter
		const postId = (await params).id;

		if (!postId) {
			return NextResponse.json(
				{
					success: false,
					message: 'Post ID is required.',
				},
				{
					status: 400, // Bad Request
				}
			);
		}

		// 3️⃣ Cek Apakah Sudah Like
		let isLiked;

		if (userId) {
			isLiked = await prisma.like.findFirst({
				where: {
					postId,
					userId,
				},
			});
		} else {
			isLiked = false;
		}

		return NextResponse.json(
			{
				success: true,
				isLiked: !!isLiked,
			},
			{
				status: 200,
			}
		);
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: 'Something went wrong while checking like status.',
				error: error instanceof Error ? error.message : String(error),
			},
			{
				status: 500,
			}
		);
	}
};
