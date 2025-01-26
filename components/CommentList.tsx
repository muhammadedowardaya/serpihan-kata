import { Comment } from '@/types';
import React from 'react';
import CommentItem from './CommentItem';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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

	return (
		<div className="flex flex-col gap-y-4 pb-[20px]">
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
