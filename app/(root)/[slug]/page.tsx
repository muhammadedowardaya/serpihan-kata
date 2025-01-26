import PostContent from '@/components/PostContent';
import { prisma } from '@/lib/prisma';
import { Post } from '@/types';
import React from 'react';

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
					},
				},
				where: {
					parentId: null,
				},
			},
		},
	});

	return <PostContent data={post as unknown as Post} />;
};

export default ViewPost;
