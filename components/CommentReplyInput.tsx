'use client';

import React, { useState } from 'react';

import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { LoaderCircle, SendHorizonal, XIcon } from 'lucide-react';

import { Comment, TargetUser } from '@/types';
import { useAtom, useSetAtom } from 'jotai';
import { replyToAtom, showReplyInputAtom } from '@/jotai';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import axios from 'axios';
import { socket } from '@/socket-client';
import { Toast } from '@/lib/sweetalert';
import { MyAlert } from './MyAlert';

export const CommentReplyInput = ({ comment }: { comment: Comment }) => {
	const queryClient = useQueryClient();

	const [replyTo, setReplyTo] = useAtom(replyToAtom);

	const setShowInputComment = useSetAtom(showReplyInputAtom);

	const [alert, setAlert] = useState<{
		title: string;
		description: string;
		type: 'error' | 'success' | 'warning' | 'info';
	} | null>(null);

	const [commentValue, setCommentValue] = useState('');

	const addComment = useMutation<
		{ unreadCount: number; targetUser: TargetUser },
		Error,
		{ parentId?: string; replyToId?: string; postId: string; message: string }
	>({
		mutationKey: ['comment', comment.id],
		mutationFn: async ({ parentId, replyToId, postId, message }) => {
			const response = await axios.post(`/api/comment/${parentId}/reply`, {
				message,
				replyToId,
				postId,
			});
			return response.data;
		},
		onSuccess: (response) => {
			if (response.targetUser && response.unreadCount) {
				socket.emit('unreadCount', {
					unreadCount: response.unreadCount,
					userId: response.targetUser.id,
				});
				socket.emit('sendNotification', {
					targetUser: response.targetUser,
					message: 'replied on your comment',
					url: `/${comment.post.slug}?comment=${comment.id}`,
				});
			}

			Promise.all([
				queryClient.invalidateQueries({
					queryKey: ['commentCount', comment.post.id],
				}),
				queryClient.invalidateQueries({
					queryKey: ['replies', comment.parentId],
				}),
				queryClient.invalidateQueries({
					queryKey: ['post', response.targetUser.id],
				}),
			]);

			console.info(
				'invalidateQueries replies dengan isi key',
				comment.parentId
			);

			Toast.fire('Reply added successfully', '', 'success');

			setReplyTo(null);
			setCommentValue('');
			setShowInputComment((prev) => ({ ...prev, [comment.id]: false }));
		},
		onError: (error) => {
			console.log(error);
			setAlert({
				title: 'Error',
				description: error.message,
				type: 'error',
			});
			setCommentValue('');
			setShowInputComment((prev) => ({ ...prev, [comment.id]: false }));
		},
	});

	const addCommentHandler = () => {
		if (!commentValue.trim()) {
			setAlert({
				title: 'Reply cannot be empty',
				description: 'Please enter a comment before submitting your reply.',
				type: 'warning',
			});
			return;
		}

		if (replyTo?.id) {
			addComment.mutate({
				parentId: replyTo.parentId ? replyTo.parentId : replyTo.id,
				replyToId: replyTo.parentId ? replyTo.id : undefined,
				message: commentValue,
				postId: replyTo.postId as string,
			});
		}
	};

	const truncateComment = (text: string) =>
		text && text.length > 20 ? `${text.slice(0, 20)}...` : text;

	if (!replyTo) return;

	return (
		<div className="flex flex-col gap-4 w-full h-[300px] border p-4 pt-2 rounded shadow-xs">
			<span
				className="text-gray-500 mt-2 ml-2 text-sm"
				aria-label={`Reply to ${replyTo?.message}`}
			>
				Reply to
				<i className="ml-1 text-slate-900 font-bold">
					<q>{truncateComment(replyTo?.message as string)}</q>
				</i>
			</span>

			<Textarea
				className="resize-none h-[100px] w-full border border-gray-400 rounded p-2 flex-1"
				onChange={(e) => setCommentValue(e.target.value)}
				value={commentValue}
				placeholder="Type your reply here..."
				aria-label="Type your reply here..."
				disabled={addComment.isPending}
			/>
			<div className="flex justify-end items-center gap-4">
				<Button
					variant="outline"
					onClick={() => setReplyTo(null)}
					aria-label="Cancel reply"
					disabled={addComment.isPending}
				>
					<XIcon size={16} className="mr-2" aria-hidden="true" />
					Cancel
				</Button>
				<Button
					onClick={addCommentHandler}
					disabled={addComment.isPending}
					aria-pressed={addComment.isPending}
					aria-label="Send reply"
				>
					{addComment.isPending ? (
						<LoaderCircle className="animate-spin" aria-hidden="true" />
					) : (
						<SendHorizonal size={16} aria-hidden="true" />
					)}
					<span className="ml-2" aria-hidden="true">
						Send
					</span>
				</Button>
			</div>

			<MyAlert
				open={!!alert}
				onConfirm={() => setAlert(null)}
				textConfirmButton="Ok"
				type={alert?.type as 'error' | 'success' | 'warning' | 'info'}
				title={alert?.title as string}
				description={alert?.description}
			/>
		</div>
	);
};
