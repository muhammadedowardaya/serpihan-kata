import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) => {
	try {
		const postId = (await params).id;

		// Hitung jumlah komentar utama (parentId = null)
		const commentCount = await prisma.comment.count({
			where: {
				postId: postId,
			},
		});

		return NextResponse.json(
			{
				commentCount,
			},
			{
				status: 200,
			}
		);
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
		}

		return NextResponse.json(
			{
				error: 'Internal Server Error',
			},
			{
				status: 500,
			}
		);
	}
};
