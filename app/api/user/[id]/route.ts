import { prisma } from '@/lib/prisma';
import redis from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) => {
	try {
		const userId = (await params).id;

		const cacheKey = `session:${userId}`;
		const cachedUser = await redis.get(cacheKey);

		if (cachedUser) {
			return NextResponse.json(JSON.parse(cachedUser), { status: 200 });
		}

		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
			include: {
				socialMedia: {
					select: {
						facebook: true,
						instagram: true,
						tiktok: true,
						github: true,
						linkedin: true,
						youtube: true,
						other: true,
					},
				},
			},
		});

		return NextResponse.json(
			{
				user,
			},
			{ status: 200 }
		);
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
		}

		return NextResponse.json(
			{
				error,
			},
			{ status: 500 }
		);
	}
};
