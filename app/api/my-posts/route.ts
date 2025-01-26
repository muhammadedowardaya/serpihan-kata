import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const GET = async () => {
	try {
		const session = await auth();
		const posts = await prisma.post.findMany({
			where: {
				userId: session?.user?.id,
			},
			include: {
				user: true,
				category: true,
			},
		});

		return NextResponse.json({ posts, status: 200 });
	} catch (error) {
		if (error instanceof Error) {
			console.info(error.message);
		}

		return NextResponse.json({
			error: error,
			status: 500,
		});
	}
};
