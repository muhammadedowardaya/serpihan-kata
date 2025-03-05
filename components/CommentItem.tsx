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
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { motion, useAnimation } from 'motion/react';

const CommentItem = ({ comment }: { comment: Comment }) => {
	const { data: session } = useSession();

	const setAlertPostComment = useSetAtom(alertPostCommentAtom);

	const [isLiked, setIsLiked] = useState(false);
	const [likesLength, setLikesLength] = useState(0);

	const { addLike, removeLike } = useLike();

	const [showAlertDelete, setShowAlertDelete] = useState(false);

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

	const [highlight, setHighlight] = useState(false);

	const searchParams = useSearchParams();
	const commentId = searchParams.get('comment');

	useEffect(() => {
		if (commentId === comment.id && likesQuery.data) {
			setHighlight(true);
		}
	}, [commentId, comment.id, likesQuery.data]);

	const controls = useAnimation();

	useEffect(() => {
		if (highlight) {
			controls.start({
				scale: [1, 0.95, 1],
				transition: {
					duration: 0.5,
					repeat: 5, // Ulangi animasi 5 kali
					repeatType: 'reverse',
					ease: 'easeInOut',
					repeatDelay: 1,
				},
			});
		}
	}, [highlight, controls]);

	if (likesQuery.isLoading) {
		return <CommentItemSkeleton />;
	}

	return (
		<article
			id={comment.id}
			role="article"
			aria-labelledby={`comment-author-${comment.user?.username}`}
		>
			<motion.div
				// initial={{
				// 	backgroundColor: '#334155',
				// }}
				animate={controls}
				className="border rounded-md p-[10px] pb-2 h-max bg-primary text-primary-foreground"
			>
				<div className="flex gap-x-4">
					{/* Avatar */}
					<Link href={`/author/${comment.user?.username}`}>
						<Avatar className="bg-secondary hover:bg-secondary-hover text-secondary-foreground border-2 border-border">
							<AvatarImage
								src={comment?.user?.image}
								alt={`${comment?.user?.username}'s avatar`}
								className="object-cover"
							/>
							<AvatarFallback>
								{comment?.user.username.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
					</Link>

					{/* Informasi pengguna dan komentar */}
					<div className="w-full flex flex-col justify-evenly">
						<h2
							id={`comment-author-${comment.user?.username}`}
							className="text-yellow-200 font-medium text-xs"
						>
							{comment?.user.username}
						</h2>
						<p className="mt-1 text-white text-xs">{comment?.message}</p>
					</div>
				</div>

				{/* Waktu komentar */}
				<div className="flex items-center justify-between gap-x-4 mt-4 pr-1">
					<span className="text-primary-foreground text-xs">
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

						{/* Tombol Reply */}
						<CommentReplyButton comment={comment} />

						{/* Tombol Hapus (hanya jika pemilik komentar) */}
						{comment?.user?.id === session?.user?.id && (
							<Button
								variant="ghost"
								className="p-0 h-max group"
								onClick={() => setShowAlertDelete(true)}
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
			</motion.div>

			{/* Komentar balasan */}
			{getReplies.data && getReplies.data.length > 0 && (
				<CommentReplyItemList parentId={comment.id} replies={getReplies.data} />
			)}

			{/* Alert Konfirmasi Hapus */}
			{showAlertDelete && (
				<MyAlert
					open={showAlertDelete}
					title="Are you sure?"
					description={<span>{`You won't be able to revert this!`}</span>}
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
