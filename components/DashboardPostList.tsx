'use client';

import { Post } from '@/types';
import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import PostCard from './PostCard';
import { LoaderCircle } from 'lucide-react';
import { useAtom } from 'jotai';
import { editPostIdAtom } from '@/jotai';
import EditFormPost from './EditFormPost';

const DashboardPostList = ({ initialData }: { initialData: Post[] }) => {
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

	useEffect(() => {
		queryClient.invalidateQueries({
			queryKey: ['my-post', editPostId],
		});
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
						size="small"
						onEdit={() => setEditPostId(post.id)}
					/>
				))
			) : (
				<p>No Post</p>
			)}
		</div>
	);
};

export default DashboardPostList;
