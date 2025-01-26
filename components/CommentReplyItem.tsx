'use client';

import React, {  useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Comment, Like } from '@/types';
import { useSession } from 'next-auth/react';
import { ChevronRight, ThumbsUp, Trash } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { useLike } from '@/hooks/use-like';
import Swal from 'sweetalert2';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Toast } from '@/lib/sweetalert';
import { CommentItemSkeleton } from './CommentItemSkeleton';
import { CommentReplyButton } from './CommentReplyButton';

const CommentReplyItem = ({
	comment,
	parentId,
}: {
	comment: Comment;
	parentId: string;
}) => {
	const { data: session } = useSession();

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
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['replies', parentId],
			});
			Toast.fire('Comment deleted successfully', '', 'success');
		},
		onError: (error) => {
			Swal.fire('Error', error.message, 'error');
		},
	});

	const likeHandler = async () => {
		if (!session || !session.user) {
			Swal.fire({
				title: 'Login Required',
				text: 'You must login to like a comment',
				icon: 'warning',
			});
			return;
		}

		if (comment?.user?.id === session?.user?.id) {
			Swal.fire({
				title: 'Info',
				text: 'Anda tidak bisa "like" komentar anda sendiri :)',
				icon: 'info',
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
		Swal.fire({
			title: 'Are you sure?',
			text: "You won't be able to revert this!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete it!',
		}).then((result) => {
			if (result.isConfirmed) {
				deleteComment.mutate({
					commentId: comment?.id,
				});
			}
		});
	};

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
				<div className="w-full flex flex-col justify-evenly ">
					<div className="flex items-center flex-wrap text-xs text-slate-400 font-medium">
						<span>{comment?.user?.username}</span>
						{comment?.parent && !comment?.replyTo && (
							<div>
								<ChevronRight
									size={10}
									className="fill-slate-900 inline-block"
								/>
								<span>{comment?.parent?.user.username}</span>
							</div>
						)}
						{comment?.parent && comment?.replyTo && (
							<div>
								<ChevronRight
									size={10}
									className="fill-slate-900 inline-block"
								/>
								<span>{comment?.replyTo?.user.username}</span>
							</div>
						)}
					</div>
					<div className="mt-1 text-slate-900 text-xs">{comment?.message}</div>
				</div>
			</div>

			<div className="flex items-center justify-between gap-x-4 mt-4">
				<span className="text-xs text-slate-600">
					{formatDistance(comment?.createdAt, new Date(), {
						addSuffix: true,
					})}
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
