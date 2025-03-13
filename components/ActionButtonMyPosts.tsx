'use client';

import React from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { useSession } from 'next-auth/react';
import { useAtom, useSetAtom } from 'jotai';
import { editPostIdAtom, postIdAtom, resetPostDataAtom } from '@/jotai';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { LoaderCircle, Plus } from 'lucide-react';

export const ActionButtonMyPosts = () => {
	const router = useRouter();

	const [editPostId, setEditPostId] = useAtom(editPostIdAtom);
	const resetPostData = useSetAtom(resetPostDataAtom);
	const [, setPostId] = useAtom(postIdAtom);
	const { data } = useSession();

	const pathname = usePathname();

	const mutation = useMutation<
		{ postId: string; userId: string }, // Success response
		Error, // Error type
		{ postId: string; userId: string } // Input type
	>({
		mutationFn: async (data) => {
			const response = await axios.post('/api/post-draft', data, {
				headers: {
					'Content-Type': 'application/json',
				},
			});
			return response.data; // Mengembalikan data respons
		},
		onSuccess: (response) => {
			console.info('Post created:', response.postId);
			setPostId(response.postId);
			router.push('/dashboard/posts/create');
		},
		onError: (error) => {
			console.error('Failed to create post:', error.message);
		},
	});

	const onClickHandler = () => {
		if (!data?.user?.id) {
			console.warn('User is not authenticated');
			return;
		}

		const postId = nanoid();
		const userId = data.user.id;

		if (!postId || !userId) {
			console.error('postId or userId is null');
			return;
		}

		mutation.mutate({ postId, userId });
	};

	if (editPostId && pathname.startsWith('/dashboard/posts')) {
		return (
			<Button
				onClick={() => {
					setEditPostId('');
					resetPostData();
				}}
				variant="outline"
			>
				Close Edit
			</Button>
		);
	}

	return (
		<Button onClick={onClickHandler}>
			{mutation.isPending ? (
				<div className="flex items-center gap-2">
					<LoaderCircle size={20} className="animate-spin" />
					Loading...
				</div>
			) : (
				<span>
					<Plus />
				</span>
			)}
		</Button>
	);
};
