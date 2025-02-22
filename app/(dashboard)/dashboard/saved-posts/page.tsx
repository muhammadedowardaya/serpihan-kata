import { auth } from '@/auth';
import { SavedPostsList } from '@/components/SavedPostsList';
import { prisma } from '@/lib/prisma';
import { SavedPost } from '@/types';
import React from 'react';

const SavedPostsPage = async () => {
	const session = await auth();

	const savedPosts = await prisma.savedPost.findMany({
		where: {
			userId: session?.user?.id,
		},
		include: {
			user: true,
			post: {
				include: {
					user: true,
					postTag: {
                        include: {
                            tag:true
                        }
                    },
				},
			},
		},
	});

	return (
		<SavedPostsList
			savedPosts={savedPosts as unknown as SavedPost[]}
			userId={session?.user?.id as string}
		/>
	);
};

export default SavedPostsPage;
