'use client';

import React, { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Comment, Like } from '@/types';
import { useSession } from 'next-auth/react';
import { ThumbsUp, Trash } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { useLike } from '@/hooks/use-like';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Toast } from '@/lib/sweetalert';
import { CommentItemSkeleton } from './CommentItemSkeleton';
import { CommentReplyButton } from './CommentReplyButton';

import { CommentReplyItemList } from './CommentReplyItemList';
import { MyAlert } from './MyAlert';
import { socket } from '@/socket-client';
import { Button } from './ui/button';
import { useSetAtom } from 'jotai';
import { alertPostCommentAtom } from '@/jotai';

const CommentItem = ({ comment }: { comment: Comment }) => {
	const { data: session } = useSession();

	const setAlertPostComment = useSetAtom(alertPostCommentAtom);

	const [isLiked, setIsLiked] = useState(false);
	const [likesLength, setLikesLength] = useState(0);

	const { addLike, removeLike } = useLike();

	const [showAlertDelete, setShowAlertDelete] = useState(false);

	let avatarFallbackLetter = '';
	const fullNameArray = comment?.user?.name?.split(' ');

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

	const queryClient = useQueryClient();

	const getReplies = useQuery({
		queryKey: ['replies', comment.id],
		queryFn: async () => {
			const response = await axios.get(`/api/comment/${comment.id}/replies`);
			return response.data.replies;
		},
	});

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

	const deleteComment = useMutation<
		{ unreadCount: number },
		Error,
		{ commentId: string }
	>({
		mutationFn: async ({ commentId }: { commentId: string }) => {
			const response = await axios.delete(`/api/comment/${commentId}`);
			return response.data;
		},
		onSuccess: (response) => {
			if (response.unreadCount) {
				socket.emit('unreadCount', response.unreadCount);
			}
			queryClient.invalidateQueries({ queryKey: ['comments'] });
			Toast.fire('Comment deleted successfully', '', 'success');
		},
		onError: (error) => {
			setAlertPostComment({
				title: 'Error',
				description: error.message,
				type: 'error',
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
				textConfirmButton: 'OK',
				onConfirm: () => setAlertPostComment(null),
			});
			return;
		}

		if (comment?.user?.id === session?.user?.id) {
			setAlertPostComment({
				title: 'Info',
				description: 'Liking your own comment? Self-love is important! 😂',
				type: 'info',
				textConfirmButton: 'OK',
				onConfirm: () => setAlertPostComment(null),
			});
			return;
		}

		if (isLiked) {
			setIsLiked(false);
			setLikesLength(likesLength - 1);
			removeLike.mutate({
				userId: session?.user?.id as string,
				commentId: comment?.id,
			});
		} else {
			setIsLiked(true);
			setLikesLength(likesLength + 1);
			addLike.mutate({
				userId: session?.user?.id as string,
				commentId: comment?.id,
			});
		}
	};

	useEffect(() => {
		queryClient.invalidateQueries({ queryKey: ['comment', comment.id] });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [comment.id]);

	if (likesQuery.isLoading) {
		return <CommentItemSkeleton />;
	}

	return (
		<article
			id={comment.id}
			role="article"
			aria-labelledby={`comment-author-${comment.user?.username}`}
		>
			<div className="border border-slate-400 rounded-md p-2 pb-2 bg-background text-background-foreground h-max">
				<div className="flex gap-x-4">
					{/* Avatar */}
					<Avatar>
						<AvatarImage
							src={comment?.user?.image}
							alt={`${comment?.user?.username}'s avatar`}
						/>
						<AvatarFallback className="bg-accent hover:bg-accent-hover text-accent-foreground border border-white">
							{avatarFallbackLetter}
						</AvatarFallback>
					</Avatar>

					{/* Informasi pengguna dan komentar */}
					<div className="w-full flex flex-col justify-evenly">
						<h2
							id={`comment-author-${comment.user?.username}`}
							className="text-slate-500 font-medium text-xs"
						>
							{comment?.user.username}
						</h2>
						<p className="mt-1 text-slate-900 text-xs">{comment?.message}</p>
					</div>
				</div>

				{/* Waktu komentar */}
				<div className="flex items-center justify-between gap-x-4 mt-4">
					<span className="text-slate-500 text-xs">
						{formatDistance(comment?.createdAt, new Date(), {
							addSuffix: true,
						})}
					</span>

					{/* Aksi tombol */}
					<div className="flex items-center justify-end gap-x-4 w-max">
						{/* Tombol Like */}
						<Button
							variant="ghost"
							onClick={likeHandler}
							className="flex items-center gap-x-1 p-0 m-0 h-max"
							aria-pressed={isLiked}
							aria-label={isLiked ? 'Unlike this comment' : 'Like this comment'}
						>
							<ThumbsUp
								strokeWidth={1}
								size={15}
								className={`${
									isLiked ? 'fill-info' : ''
								} hover:fill-info-hover`}
								aria-hidden="true"
							/>
							<span className="text-sm" aria-live="polite">
								{likesLength}
							</span>
						</Button>

						{/* Tombol Reply */}
						<CommentReplyButton comment={comment} />

						{/* Tombol Hapus (hanya jika pemilik komentar) */}
						{comment?.user?.id === session?.user?.id && (
							<Button
								variant="ghost"
								className="p-0 h-max"
								onClick={() => setShowAlertDelete(true)}
								aria-label="Delete this comment"
							>
								<Trash
									size={15}
									strokeWidth={1}
									className="hover:fill-error"
									aria-hidden="true"
								/>
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* Komentar balasan */}
			{getReplies.data && getReplies.data.length > 0 && (
				<CommentReplyItemList parentId={comment.id} replies={getReplies.data} />
			)}

			{/* Alert Konfirmasi Hapus */}
			{showAlertDelete && (
				<MyAlert
					open={showAlertDelete}
					title="Are you sure?"
					description="You won't be able to revert this!"
					textConfirmButton="Yes, delete it!"
					textCancelButton="Cancel"
					type="warning"
					onCancel={() => setShowAlertDelete(false)}
					onConfirm={() => {
						deleteComment.mutate({ commentId: comment?.id });
					}}
					isLoadingConfirm={deleteComment.isPending}
				/>
			)}
		</article>
	);
};

export default CommentItem;
