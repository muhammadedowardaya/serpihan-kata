'use client';

import { Comment } from '@/types';
import React, { useEffect } from 'react';
import CommentItem from './CommentItem';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

export const CommentList = ({
	comments,
	postId,
}: {
	comments: Comment[];
	postId: string;
}) => {
	const getComments = useQuery<unknown, Error, Comment[]>({
		queryKey: ['comments', postId],
		queryFn: async () => {
			const response = await axios.get(`/api/post/${postId}/comments`);
			return response.data.comments;
		},
		initialData: comments,
		enabled: !!postId,
	});

	const searchParams = useSearchParams();
	const commentId = searchParams.get('comment');

	useEffect(() => {
		if (commentId) {
			const element = document.getElementById(commentId);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth' });
			}
		}
	}, [commentId, getComments.data]);

	return (
		<div className="flex flex-col gap-y-4 py-[10px] relative">
			{getComments.data && getComments.data?.length > 0 ? (
				getComments.data?.map((comment) => {
					return <CommentItem key={comment.id} comment={comment} />;
				})
			) : (
				<div className="text-center text-slate-400">No comments yet</div>
			)}
		</div>
	);
};
