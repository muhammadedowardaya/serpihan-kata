import { auth } from '@/auth';
import { CreateNewPostButton } from '@/components/CreateNewPostButton';
import PostList from '@/components/DashboardPostList';
import { prisma } from '@/lib/prisma';
import { Post } from '@/types';
import { Heading } from '@radix-ui/themes';
import React from 'react';

const MyPostsPage = async () => {
	const session = await auth();

	const data = await prisma.post.findMany({
		where: {
			userId: session?.user?.id,
		},
		include: {
			user: true,
			category: true,
		},
	});

	return (
		<div className="space-y-4 pt-[20px]">
			<div className="flex justify-between items-center mb-[40px]">
				<Heading as="h1">My Posts</Heading>
				<CreateNewPostButton />
			</div>
			<PostList initialData={data as unknown as Post[]} />
		</div>
	);
};

export default MyPostsPage;
