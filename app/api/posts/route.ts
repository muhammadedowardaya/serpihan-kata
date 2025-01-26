import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const GET = async () => {
	try {
		const posts = await prisma.post.findMany();

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
