import PostContent from '@/components/PostContent';
import { prisma } from '@/lib/prisma';
import { Post } from '@/types';
import React from 'react';

import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Detail Postingan',
	description: 'Detail postingan pada Serpihan Kata',
};

const ViewPost = async ({ params }: { params: Promise<{ slug: string }> }) => {
	const slug = (await params).slug;

	const post = await prisma.post.findFirst({
		where: {
			slug,
		},
		include: {
			comments: {
				include: {
					user: true,
					likes: true,
					replies: {
						include: {
							replyTo: {
								include: {
									user: true,
								},
							},
							user: true,
							parent: {
								include: {
									user: true,
								},
							},
						},
						orderBy: {
							createdAt: 'desc',
						},
					},
				},
				where: {
					parentId: null,
				},
				orderBy: {
					createdAt: 'desc',
				},
			},
		},
	});

	return <PostContent data={post as unknown as Post} />;
};

export default ViewPost;
