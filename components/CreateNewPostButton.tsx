'use client';

import React from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { useSession } from 'next-auth/react';
import { useAtom } from 'jotai';
import { editPostIdAtom, postIdAtom } from '@/jotai';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { LoaderCircle } from 'lucide-react';

export const CreateNewPostButton = () => {
	const router = useRouter();

	const [editPostId, setEditPostId] = useAtom(editPostIdAtom);
	const [, setPostId] = useAtom(postIdAtom);
	const { data } = useSession();

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

	if (editPostId) {
		return <Button onClick={() => setEditPostId('')} variant="outline">Close Edit</Button>;
	}

	return (
		<Button onClick={onClickHandler}>
			{mutation.isPending ? (
				<div className="flex items-center gap-2">
					<LoaderCircle size={20} className="animate-spin" />
					Loading...
				</div>
			) : (
				<span>Create New Post</span>
			)}
		</Button>
	);
};
