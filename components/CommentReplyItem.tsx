'use client';

import React, { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Comment, Like } from '@/types';
import { useSession } from 'next-auth/react';
import { ChevronRight, ThumbsUp, Trash } from 'lucide-react';
import { useLike } from '@/hooks/use-like';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Toast } from '@/lib/sweetalert';
import { CommentItemSkeleton } from './CommentItemSkeleton';
import { CommentReplyButton } from './CommentReplyButton';
import { useAtom } from 'jotai';
import { alertPostCommentAtom } from '@/jotai';
import { timeAgo } from '@/lib/utils';

const CommentReplyItem = ({
	comment,
	parentId,
}: {
	comment: Comment;
	parentId: string;
}) => {
	const { data: session } = useSession();

	const [, setAlertPostComment] = useAtom(alertPostCommentAtom);

	let avatarFallbackLetter = '';
	const fullNameArray = session?.user?.name?.split(' ');

	if (fullNameArray) {
		let firstLetter = '';
		let secondLetter = '';

		if (fullNameArray.length > 1) {
			firstLetter = fullNameArray[0].at(0) as string;
			secondLetter = fullNameArray[1].at(0) as string;
		} else {
			firstLetter = fullNameArray[0].at(0) as string;
			secondLetter = fullNameArray[0].at(1) as string;
		}

		avatarFallbackLetter = firstLetter + secondLetter;
	}

	const [isLiked, setIsLiked] = useState(false);
	const [likesLength, setLikesLength] = useState(0);

	const { addLike, removeLike } = useLike();

	const queryClient = useQueryClient();

	const likesQuery = useQuery<
		unknown,
		Error,
		{ isLiked: boolean; likes: Like[] }
	>({
		queryKey: ['isLiked', comment.id],
		queryFn: async () => {
			const response = await axios.get(`/api/comment/${comment.id}/isLiked`, {
				params: {
					userId: session?.user?.id,
				},
			});
			setIsLiked(response.data.isLiked);
			setLikesLength(response.data.likes.length);
			return response.data;
		},
		enabled: !!comment.id, // Hanya fetch jika ada `postId` atau `commentId`
	});

	const deleteComment = useMutation({
		mutationFn: async ({ commentId }: { commentId: string }) => {
			const response = await axios.delete(`/api/comment/${commentId}`);
			return response.data;
		},
		onSuccess: async () => {
			Promise.all([
				queryClient.invalidateQueries({
					queryKey: ['replies', parentId],
				}),
				queryClient.invalidateQueries({
					queryKey: ['post', parentId],
				}),
			]);

			Toast.fire('Comment deleted successfully', '', 'success');
			setAlertPostComment(null);
		},
		onError: (error) => {
			setAlertPostComment({
				title: 'Error',
				description: error.message,
				type: 'error',
				textConfirmButton: 'OK',
				onConfirm: () => setAlertPostComment(null),
			});
		},
	});

	const likeHandler = async () => {
		if (!session || !session.user) {
			setAlertPostComment({
				title: 'Login Required',
				description: 'You must login to like a comment',
				type: 'warning',
				textConfirmButton: 'Ok',
				onConfirm: () => setAlertPostComment(null),
			});
			return;
		}

		if (comment?.user?.id === session?.user?.id) {
			setAlertPostComment({
				title: 'Info',
				description: 'Liking your own comment? Self-love is important! 😂',
				type: 'info',
				textConfirmButton: 'OK _-',
				onConfirm: () => setAlertPostComment(null),
			});
			return;
		}

		if (isLiked) {
			setIsLiked(false);
			setLikesLength(likesLength - 1);
			removeLike.mutate({
				userId: session?.user?.id as string,
				commentId: comment.id,
			});
		} else {
			setIsLiked(true);
			setLikesLength(likesLength + 1);
			addLike.mutate({
				userId: session?.user?.id as string,
				commentId: comment.id,
			});
		}
	};

	const deleteCommentHandler = () => {
		setAlertPostComment({
			title: 'Are you sure?',
			description: "You won't be able to revert this!",
			type: 'warning',
			textCancelButton: 'Cancel',
			onCancel: () => setAlertPostComment(null),
			textConfirmButton: 'Yes, delete it!',
			onConfirm: () => {
				setAlertPostComment((prev) => ({ ...prev!, isLoadingConfirm: true }));
				setTimeout(() => {
					deleteComment.mutate({
						commentId: comment.id,
					});
				}, 100);
			},
		});
	};

	useEffect(() => {
		console.info(comment);
	}, [comment]);

	if (likesQuery.isLoading) {
		return <CommentItemSkeleton />;
	}

	return (
		<div className="border border-slate-400 rounded-md p-2 pb-2 bg-slate-100 flex-1">
			<div className="flex gap-x-4">
				<Avatar className="h-8 w-8">
					<AvatarImage src={comment?.user?.image} />
					<AvatarFallback className="bg-slate-400 text-white border border-white">
						{avatarFallbackLetter}
					</AvatarFallback>
				</Avatar>
				<div className="w-full flex flex-col justify-evenly">
					<div className="flex items-center gap-1 flex-wrap text-xs text-slate-400 font-medium">
						<span>{comment?.user?.username}</span>
						<ChevronRight size={10} className="fill-slate-900 inline-block" />
						{comment?.replyTo ? (
							<span>{comment?.replyTo?.user?.username}</span>
						) : (
							<span>{comment?.parent?.user?.username}</span>
						)}
					</div>
					<div className="mt-1 text-slate-900 text-xs">{comment?.message}</div>
				</div>
			</div>

			<div className="flex items-center justify-between gap-x-4 mt-4">
				<span className="text-xs text-slate-600">
					{timeAgo(new Date(comment?.createdAt).toISOString())}
				</span>
				<div className="flex items-center justify-end gap-x-4 w-max">
					<div className="flex items-center gap-x-1">
						<ThumbsUp
							onClick={likeHandler}
							strokeWidth={1}
							size={15}
							className={`${isLiked ? 'fill-sky-400' : ''} hover:fill-sky-400`}
						/>
						<span className="text-sm">{likesLength}</span>
					</div>

					<CommentReplyButton comment={comment} parentId={parentId} />

					{comment?.user?.id === session?.user?.id && (
						<Trash
							size={15}
							onClick={deleteCommentHandler}
							strokeWidth={1}
							className="hover:fill-red-300"
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default CommentReplyItem;
