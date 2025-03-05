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
import { Button } from './ui/button';
import Link from 'next/link';

const CommentReplyItem = ({
	comment,
	parentId,
}: {
	comment: Comment;
	parentId: string;
}) => {
	const { data: session } = useSession();

	const [, setAlertPostComment] = useAtom(alertPostCommentAtom);

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
		<article className="border border-tertiary-forground rounded-md p-[10px] pb-2 bg-primary text-primary-foreground h-max">
			<div className="flex gap-x-4">
				<Link href={`/author/${comment.user?.username}`}>
					<Avatar className="h-8 w-8 bg-secondary hover:bg-secondary-hover text-secondary-foreground border-2 border-border">
						<AvatarImage
							src={comment?.user?.image}
							alt={`${comment?.user?.username}'s avatar`}
							className="object-cover"
						/>
						{/* Waktu komentar */}
						<AvatarFallback>
							{comment?.user?.username.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
				</Link>
				<div className="w-full flex flex-col justify-evenly">
					<div className="flex items-center gap-1 flex-wrap text-xs">
						<h2
							id={`comment-author-${comment.user?.username}`}
							className="text-yellow-200 text-xs"
						>
							{comment?.user.username}
						</h2>
						<ChevronRight size={10} className="fill-yellow-200 inline-block" />
						{comment?.replyTo ? (
							<span className="text-yellow-200">
								{comment?.replyTo?.user?.username}
							</span>
						) : (
							<span className="text-yellow-200">
								{comment?.parent?.user?.username}
							</span>
						)}
					</div>
					<div className="mt-1 text-white text-xs">{comment?.message}</div>
				</div>
			</div>

			<div className="flex items-center justify-between gap-x-4 mt-4 pr-1">
				<span className="text-xs text-primary-foreground">
					{timeAgo(new Date(comment?.createdAt).toISOString())}
				</span>
				<div className="flex items-center justify-end gap-x-4 w-max">
					<Button
						onClick={likeHandler}
						variant="ghost"
						className="flex items-center gap-x-1 p-0 m-0 h-max group"
						aria-pressed={isLiked}
						aria-label={isLiked ? 'Unlike this comment' : 'Like this comment'}
					>
						<ThumbsUp
							strokeWidth={1}
							size={15}
							className={`${
								isLiked ? 'fill-tertiary' : ''
							} group-hover:fill-tertiary`}
							aria-hidden="true"
						/>
						<span className="text-sm" aria-live="polite">
							{likesLength}
						</span>
					</Button>

					<CommentReplyButton comment={comment} parentId={parentId} />

					{comment?.user?.id === session?.user?.id && (
						<Button
							variant="ghost"
							className="p-0 h-max group"
							onClick={() => deleteCommentHandler()}
							aria-label="Delete this comment"
						>
							<Trash
								size={15}
								strokeWidth={1}
								className="group-hover:fill-tertiary"
								aria-hidden="true"
							/>
						</Button>
					)}
				</div>
			</div>
		</article>
	);
};

export default CommentReplyItem;
