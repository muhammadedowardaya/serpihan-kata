'use client';

import { Post } from '@/types';
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import PostCard from './PostCard';
import { LoaderCircle } from 'lucide-react';
import { useAtom } from 'jotai';
import { editPostIdAtom } from '@/jotai';
import EditFormPost from './FormPost';
import { Toast } from '@/lib/sweetalert';
import Swal from 'sweetalert2';

export interface DashboardPostListProps {
	initialData: {
		published: Post[];
		unpublished: Post[];
	};
}

export const DashboardPostList = ({
	initialData,
}: {
	initialData: DashboardPostListProps;
}) => {
	const [editPostId, setEditPostId] = useAtom(editPostIdAtom);
	const [selectedPost, setSelectedPost] = useState<{
		id: string;
		isDraft: boolean;
	} | null>(null);

	const queryClient = useQueryClient();

	const getMyPosts = useQuery({
		queryKey: ['my-posts'],
		queryFn: async () => {
			const response = await axios.get('/api/my-posts');
			return response.data;
		},
		placeholderData: initialData,
	});

	const getMyPost = useQuery<unknown, Error, Post>({
		queryKey: ['my-post', editPostId],
		queryFn: async () => {
			const response = await axios.get(`/api/post/${editPostId}`);
			return response.data.post;
		},
		enabled: !!editPostId,
	});

	const publishMyPost = useMutation<unknown, Error, { isDraft: boolean }>({
		mutationKey: ['publish-my-post', selectedPost?.id],
		mutationFn: async ({ isDraft }: { isDraft: boolean }) => {
			const response = await axios.patch(
				`/api/post/${selectedPost?.id}/publish`,
				{
					isDraft,
				}
			);
			return response.data.post;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['my-posts'],
			});
			setSelectedPost(null);
		},
		onError: (error) => {
			setSelectedPost(null);
			Swal.fire({
				title: 'Error',
				text: error.message,
				icon: 'error',
			});
		},
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
			text: "You won't be able to revert this!",
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
		if (selectedPost) {
			publishMyPost.mutate({ isDraft: !selectedPost.isDraft });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedPost]);

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
		<div>
			<fieldset className="border">
				<legend className="ml-10 p-2 font-bold text-primary">Published</legend>
				<div className="flex gap-4 items-center flex-wrap m-4">
					{getMyPosts.data.published.length > 0 ? (
						getMyPosts.data.published.map((post: Post) => (
							<PostCard
								key={post.id}
								post={post}
								mode="my-post"
								onEdit={() => setEditPostId(post.id)}
								onDelete={() => handleDelete(post.id)}
								toggleDraft={() => {
									setSelectedPost({ id: post.id, isDraft: post.isDraft });
								}}
								isLoading={publishMyPost.isPending}
							/>
						))
					) : (
						<p className="text-center w-full bg-primary text-primary-foreground rounded font-bold p-2">
							No Post Published
						</p>
					)}
				</div>
			</fieldset>
			<fieldset className="mt-6 border">
				<legend className="ml-10 p-2 font-bold text-primary">
					Unpublished
				</legend>
				<div className="flex gap-4 items-center flex-wrap m-4">
					{getMyPosts.data.unpublished.length > 0 ? (
						getMyPosts.data.unpublished.map((post: Post) => (
							<PostCard
								key={post.id}
								post={post}
								mode="my-post"
								onEdit={() => setEditPostId(post.id)}
								onDelete={() => handleDelete(post.id)}
								toggleDraft={() => {
									setSelectedPost({ id: post.id, isDraft: post.isDraft });
								}}
								isLoading={publishMyPost.isPending}
							/>
						))
					) : (
						<p className="text-center w-full bg-primary text-primary-foreground rounded font-bold p-2">
							No Unpublished Post
						</p>
					)}
				</div>
			</fieldset>
		</div>
	);
};
