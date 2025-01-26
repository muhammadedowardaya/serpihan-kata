import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const GET = async () => {
	try {
		const session = await auth();
		const userId = session?.user?.id;

		const savedPosts = await prisma.savedPost.findMany({
			where: {
				userId,
			},
			include: {
				user: true,
				post: {
					include: {
						user: true,
						category: true,
					},
				},
			},
		});

		return NextResponse.json({
			savedPosts,
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
