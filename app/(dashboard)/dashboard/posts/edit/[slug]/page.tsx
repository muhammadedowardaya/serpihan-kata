import PostContent from '@/components/PostContent';
import { prisma } from '@/lib/prisma';
import { Post } from '@/types';
import React from 'react';

const PostDetailPage = async ({
	params,
}: {
	params: Promise<{ id: string }>;
}) => {
	const id = (await params).id;

	const post = await prisma.post.findFirst({
		where: {
			id,
		},
		include: {
			comments: true,
			user: true,
		},
	});

	return <PostContent data={post as unknown as Post} hideBreadcrumb />;
};

export default PostDetailPage;
