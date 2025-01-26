import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
	request: NextRequest,
	{ params }: { params: { postId: string } }
) => {
	try {
		const { postId } = params;

		if (!postId) {
			return NextResponse.json(
				{ success: false, message: 'Post ID is required' },
				{ status: 400 }
			);
		}

		// Ambil semua "like" untuk postingan tertentu
		const likes = await prisma.like.findMany({
			where: { postId },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		return NextResponse.json({ success: true, likes });
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error },
			{ status: 500 }
		);
	}
};
