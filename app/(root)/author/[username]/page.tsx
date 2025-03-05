import { MyProfile } from '@/components/MyProfile';
import { prisma } from '@/lib/prisma';
import React from 'react';

const AuthorDetail = async ({
	params,
}: {
	params: Promise<{ username: string }>;
}) => {
	const username = (await params).username;
	const author = await prisma.user.findFirst({
		where: {
			username,
		},
		select: {
			id: true,
		},
	});

	return (
		<div className="flex flex-col items-center gap-4 padding-content pt-6 pb-10 sm:pt-10 sm:pb-0">
			<h1 className="text-2xl font-bold">Author</h1>
			<MyProfile userId={author?.id as string} />
		</div>
	);
};

export default AuthorDetail;
