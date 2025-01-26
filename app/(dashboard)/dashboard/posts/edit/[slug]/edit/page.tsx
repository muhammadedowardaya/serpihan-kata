import EditFormPost from '@/components/EditFormPost';
import { prisma } from '@/lib/prisma';
import { Post } from '@/types';
import React from 'react';

const EditPostPage = async ({
	params,
}: {
	params: Promise<{
		slug: string;
	}>;
}) => {
	const slug = (await params).slug;
	const defaultValues = await prisma.post.findFirst({
		where: {
			slug,
		},
	});

	if (!defaultValues) {
		return <div>Post not found</div>;
	}

	return <EditFormPost defaultValues={defaultValues as unknown as Post} />;
};

export default EditPostPage;
