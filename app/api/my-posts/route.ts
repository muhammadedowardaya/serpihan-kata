import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const GET = async () => {
	try {
		const session = await auth();
		const published = await prisma.post.findMany({
			where: {
				userId: session?.user?.id,
				isDraft: false,
			},
			include: {
				user: true,
				postTag: {
					include: {
						tag: true,
					},
				},
			},
		});

		const unpublished = await prisma.post.findMany({
			where: {
				userId: session?.user?.id,
				isDraft: true,
			},
			include: {
				user: true,
				postTag: {
					include: {
						tag: true,
					},
				},
			},
		});

		return NextResponse.json({ published, unpublished }, { status: 200 });
	} catch (error) {
		if (error instanceof Error) {
			console.info(error.message);
		}

		return NextResponse.json(
			{
				error: error,
			},
			{ status: 500 }
		);
	}
};
