import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
	try {
		const searchParams = request.nextUrl.searchParams;

		const filterByTags = searchParams.get('filterByTags') || '';
		const tagsValue = filterByTags ? filterByTags.split(',') : [];

		const query = searchParams.get('query') || '';
		const sortBy = searchParams.get('sort') || 'latest';

		// Sorting logic di server
		let orderBy;
		if (sortBy === 'popular') {
			orderBy = { views: 'desc' as const };
		} else if (sortBy === 'most_commented') {
			orderBy = { comments: { _count: 'desc' as const } }; // Pastikan ini sesuai dengan model relasi
		} else {
			orderBy = { createdAt: 'desc' as const };
		}

		// Query posts dengan Prisma
		const posts = await prisma.post.findMany({
			where: {
				...(tagsValue.length > 0 && {
					postTag: {
						some: {
							tag: {
								value: { in: tagsValue },
							},
						},
					},
				}),
				...(query && {
					OR: [
						{ title: { contains: query } },
						{ description: { contains: query } },
						{ content: { contains: query } },
					],
				}),
			},
			include: {
				user: true,
				postTag: {
					include: {
						tag: true,
					},
				},
			},
			orderBy,
		});

		return NextResponse.json({ posts, success: true });
	} catch (error) {
		console.error('Error fetching posts:', error);
		return NextResponse.json(
			{ success: false, error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
};
