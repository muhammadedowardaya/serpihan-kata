'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import React, { useState } from 'react';

import { Comment } from '@/types';
import { useAtom, useSetAtom } from 'jotai';
import { loadableReplyTo, replyToAtom, showInputCommentAtom } from '@/jotai';

import { AnimatePresence, motion } from 'motion/react';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { LoaderCircle, SendHorizonal, XIcon } from 'lucide-react';
import { Toast } from '@/lib/sweetalert';

export const CommentReplyButton = ({
	comment,
	parentId,
}: {
	comment: Comment;
	parentId?: string;
}) => {
	const session = useSession();

	const queryClient = useQueryClient();

	const setReplyTo = useSetAtom(replyToAtom);
	const [replyTo] = useAtom(loadableReplyTo);

	const [commentValue, setCommentValue] = useState('');
	const [showInputComment, setShowInputComment] = useAtom(showInputCommentAtom);

	const getComment = useQuery<unknown, Error, Comment>({
		queryKey: ['comment', comment.id],
		queryFn: async () => {
			const response = await axios.get(`/api/comment/${comment.id}`);
			return response.data.comment;
		},
		enabled: !!comment.id,
		initialData: comment,
	});

	const addComment = useMutation({
		mutationKey: ['comment', comment.id],
		mutationFn: async ({
			parentId,
			replyToId,
			userId,
			message,
		}: {
			parentId?: string;
			replyToId?: string;
			userId: string;
			message: string;
		}) => {
			const response = await axios.post(`/api/comment`, {
				userId,
				parentId,
				message,
				replyToId,
			});

			return response.data.comment;
		},
		onSuccess: () => {
			Toast.fire('Comment added successfully', '', 'success');

			if (replyTo.state === 'hasData') {
				if (replyTo.data?.parentId) {
					queryClient.invalidateQueries({
						queryKey: ['replies', replyTo.data?.parentId],
					});
				} else {
					queryClient.invalidateQueries({
						queryKey: ['replies', comment.id],
					});
				}
			}

			setCommentValue(' ');
			setShowInputComment(false);
		},
		onError: (error) => {
			Swal.fire('Error', error.message, 'error');
			setCommentValue(' ');
			setShowInputComment(false);
		},
	});

	const addCommentHandler = () => {
		if (commentValue === '') {
			Swal.fire({
				title: 'Comment cannot be empty',
				text: 'Comment value is required!',
				icon: 'warning',
			});

			return;
		}

		if (replyTo.state === 'hasData') {
			addComment.mutate({
				parentId: replyTo.data?.parentId as string,
				replyToId: replyTo.data?.id,
				userId: session?.data?.user?.id as string,
				message: commentValue,
			});
		}

		// Swal.fire({
		// 	title: 'Add Comment',
		// 	input: 'textarea',
		// 	inputLabel: 'Type your comment below',
		// 	showCancelButton: true,
		// 	confirmButtonText: 'Send',
		// 	showLoaderOnConfirm: true,
		// 	inputValidator: (value) => {
		// 		if (!value) {
		// 			return 'Comment cannot be empty';
		// 		}
		// 	},
		// }).then((result) => {
		// 	if (result.isConfirmed) {
		// 		addComment.mutate({
		// 			commentId: comment.id,
		// 			userId: session?.data?.user?.id as string,
		// 			postId: comment.post.id,
		// 			message: result.value as string,
		// 		});
		// 	}
		// });
	};

	const truncateComment = (comment: string) => {
		// Periksa apakah panjang komentar lebih dari 10 karakter
		if (comment.length > 20) {
			// Potong komentar hingga 10 karakter dan tambahkan "..."
			return comment.slice(0, 20) + '...';
		}
		return comment;
	};

	return (
		<div>
			<div
				className="flex items-center gap-1 cursor-default"
				onClick={() => {
					setShowInputComment(true);
					setReplyTo({ ...getComment.data, parentId });
				}}
			>
				<span className="text-xs select-none">Reply</span>
			</div>
			<AnimatePresence initial={false}>
				{replyTo.state === 'hasData' &&
					replyTo.data?.message &&
					showInputComment && (
						<motion.div
							className="!fixed !left-[50%] !-translate-x-1/2 top-1/2 -translate-y-1/2 w-1/2 flex items-center gap-[10px] p-4 bg-slate-50 shadow-md z-20 border border-slate-800 rounded-md"
							key="comment-input"
							initial={{ opacity: 0, scale: 0 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{
								ease: 'easeIn',
							}}
							exit={{ opacity: 0, scale: 0, transition: { ease: 'easeOut' } }}
						>
							<div className="flex flex-col gap-4 w-full">
								<p>
									<span>Reply to </span>
									<span className="italic text-slate-600">{`"${truncateComment(
										replyTo.data.message
									)}"`}</span>
								</p>
								<Textarea
									className="resize-none h-[150px] w-full border border-slate-600"
									onChange={(e) => setCommentValue(e.target.value)}
									value={commentValue}
									placeholder="Type your reply here..."
								/>
								<div className="flex items-center justify-end">
									<Button
										onClick={addCommentHandler}
										disabled={addComment.isPending}
									>
										{addComment.isPending ? (
											<LoaderCircle />
										) : (
											<>
												<span className="text-xs">SEND</span>
												<SendHorizonal size={20} />
											</>
										)}
									</Button>
								</div>
							</div>
							<XIcon
								size={30}
								className="absolute top-2 right-2 z-30"
								onClick={() => setShowInputComment(false)}
							/>
						</motion.div>
					)}
			</AnimatePresence>
		</div>
	);
};
