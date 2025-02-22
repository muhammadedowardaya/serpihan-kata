'use client';

import { Post } from '@/types';
import React, { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import PostCard from './PostCard';
import { LoaderCircle } from 'lucide-react';
import { useAtom } from 'jotai';
import { editPostIdAtom } from '@/jotai';
import EditFormPost from './EditFormPost';
import { Toast } from '@/lib/sweetalert';
import Swal from 'sweetalert2';

export const DashboardPostList = ({ initialData }: { initialData: Post[] }) => {
	const [editPostId, setEditPostId] = useAtom(editPostIdAtom);

	const queryClient = useQueryClient();

	const getMyPosts = useQuery({
		queryKey: ['my-posts'],
		queryFn: async () => {
			const response = await axios.get('/api/my-posts');
			return response.data.posts;
		},
		initialData,
	});

	const getMyPost = useQuery<unknown, Error, Post>({
		queryKey: ['my-post', editPostId],
		queryFn: async () => {
			const response = await axios.get(`/api/post/${editPostId}`);
			return response.data.post;
		},
		enabled: !!editPostId,
	});

	const deleteMyPost = useMutation<unknown, Error, { id: string }>({
		mutationKey: ['my-post', editPostId],
		mutationFn: async ({ id }: { id: string }) => {
			const response = await axios.delete(`/api/post/${id}`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['my-posts'],
			});
			Toast.fire('Post has been deleted!', '', 'success');
		},
		onError: () => {
			Swal.fire('Error', 'Failed to delete post', 'error');
		},
	});

	const handleDelete = (id: string) => {
		Swal.fire({
			title: 'Are you sure?',
			text: 'You won\'t be able to revert this!',
			icon: 'warning',
			showConfirmButton: true,
			confirmButtonText: 'Delete',
            confirmButtonColor: '#d33',
			showCancelButton: true,
		}).then((result) => {
			if (result.isConfirmed) {
				deleteMyPost.mutate({ id });
			}
		});
	};

	useEffect(() => {
		if (editPostId) {
			queryClient.invalidateQueries({
				queryKey: ['my-post', editPostId],
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editPostId]);

	if (editPostId) {
		if (getMyPost.isPending) {
			return (
				<div className="flex items-center gap-2">
					<LoaderCircle size={20} className="animate-spin" />
					<span>Loading...</span>
				</div>
			);
		}
		return <EditFormPost defaultValues={getMyPost.data as unknown as Post} />;
	}

	if (getMyPosts.isPending) {
		return (
			<div className="flex items-center gap-2">
				<LoaderCircle size={20} className="animate-spin" />
				<span>Loading...</span>
			</div>
		);
	}

	return (
		<div className="columns-1 sm:columns-2 lg:columns-3">
			{getMyPosts.data.length > 0 ? (
				getMyPosts.data.map((post: Post) => (
					<PostCard
						key={post.id}
						post={post}
						mode="my-post"
						onEdit={() => setEditPostId(post.id)}
						onDelete={() => handleDelete(post.id)}
					/>
				))
			) : (
				<p>No Post</p>
			)}
		</div>
	);
};

