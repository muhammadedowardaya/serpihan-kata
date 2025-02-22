import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) => {
	try {
		const id = (await params).id;
		const session = await auth(); // Pastikan kamu punya session
		const userId = session?.user?.id || null; // Ambil userId dari session

		const rawComments = (await prisma.$queryRaw`
            SELECT 
                c.*, 
                u.id AS userId, 
                u.name AS userName, 
                u.email AS userEmail, 
                u.image AS userImage,
                p.id AS postId,
                p.slug AS postSlug
            FROM comment c
            LEFT JOIN user u ON c.userId = u.id
            LEFT JOIN post p ON c.postId = p.id
            WHERE c.postId = ${id} AND c.parentId IS NULL
            ORDER BY (c.userId = ${userId}) DESC, c.createdAt DESC
        `) as Comment[];

		// Mapping hasil query agar user, post, dan nested data lainnya sesuai format Prisma
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const comments = rawComments.map((comment: any) => ({
			id: comment.id,
			message: comment.message,
			createdAt: comment.createdAt,
			updatedAt: comment.updatedAt,
			user: comment.userId
				? {
						id: comment.userId,
						username: comment.userName,
						email: comment.userEmail,
						image: comment.userImage,
				  }
				: null,
			post: {
				id: comment.postId,
				slug: comment.postSlug,
			}, // Harus query terpisah jika ingin replies
		}));

		return NextResponse.json({
			comments,
			status: 200,
			success: true,
		});
	} catch (error) {
		if (error instanceof Error) {
			console.info({ error });
		}
		return NextResponse.json({
			status: 500,
			success: false,
		});
	}
};
