import { auth } from '@/auth';
import { ActionButtonMyPosts } from '@/components/ActionButtonMyPosts';
import {
	DashboardPostList,
	DashboardPostListProps,
} from '@/components/DashboardPostList';
import { prisma } from '@/lib/prisma';
import { Heading } from '@radix-ui/themes';
import React from 'react';

const MyPostsPage = async () => {
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

	const initialData = {
		published,
		unpublished,
	};

	return (
		<div className="pb-10 pt-[20px]">
			<div className="flex justify-between items-center mb-[40px]">
				<Heading as="h1">My Posts</Heading>
				<ActionButtonMyPosts />
			</div>
			<DashboardPostList
				initialData={initialData as unknown as DashboardPostListProps}
			/>
		</div>
	);
};

export default MyPostsPage;
