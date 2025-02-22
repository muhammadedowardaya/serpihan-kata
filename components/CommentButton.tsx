'use client';

import * as React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Post, TargetUser } from '@/types';
import { Toast } from '@/lib/sweetalert';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { socket } from '@/socket-client';
import { useAtom, useSetAtom } from 'jotai';
import { alertPostCommentAtom, replyToAtom } from '@/jotai';

export function CommentButton({
	className,
	data,
}: {
	className?: string;
	data: Post;
}) {
	const [open, setOpen] = React.useState(false);
	const isDesktop = useMediaQuery('(min-width: 768px)');

	const [message, setMessage] = React.useState('');

	const { data: session } = useSession();

	const setAlertPostComment = useSetAtom(alertPostCommentAtom);

	const queryClient = useQueryClient();

	const [, setReplyTo] = useAtom(replyToAtom);

	const mutation = useMutation<
		{ unreadCount: number; targetUser: TargetUser; commentId: string },
		Error,
		{ postId: string; message: string }
	>({
		mutationFn: async ({
			postId,
			message,
		}: {
			postId: string;
			message: string;
		}) => {
			const response = await axios.post(
				`/api/post/${postId}/comment`,
				{
					message,
				},
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			return response.data;
		},
		onSuccess: (response) => {
			console.info('response dari commentButton', response);

			setMessage('');
			if (response.targetUser && response.commentId) {
				console.info('kirimkan sendNotification');

				socket.emit('sendNotification', {
					targetUser: response.targetUser,
					message: 'commented on your post',
					url: `/${data.slug}?comment=${response.commentId}`,
				});

				socket.emit('unreadCount', {
					unreadCount: response.unreadCount,
					userId: response.targetUser.id,
				});
			}

			queryClient.invalidateQueries({
				queryKey: ['comments', data.id],
			});
			Toast.fire('Add comment success!', '', 'success');
			setOpen(false);
		},
		onError: (error) => {
			setMessage('');
			setOpen(false);
			setAlertPostComment({
				title: 'Add comment failed!',
				description: error.message,
				type: 'error',
				textConfirmButton: 'Ok',
				onConfirm: () => setAlertPostComment(null),
			});
		},
	});

	const handleOnSend = () => {
		if (message) {
			mutation.mutate({
				postId: data.id,
				message,
			});
		} else {
			setAlertPostComment({
				title: `You can't send empty comment!`,
				description: 'Comment value is required!',
				type: 'warning',
				textConfirmButton: 'OK',
				onConfirm: () => setAlertPostComment(null),
			});
		}
	};

	const handleAddCommentClicked = () => {
		if (!session || !session.user) {
			setAlertPostComment({
				title: 'Login Required',
				description: 'You must login to add a comment',
				type: 'warning',
				textConfirmButton: 'OK',
				onConfirm: () => setAlertPostComment(null),
			});
			return;
		} else {
			setReplyTo(null);
			setOpen(true);
		}
	};

	if (isDesktop) {
		return (
			<Dialog
				open={open}
				onOpenChange={() => {
					if (session?.user) {
						setOpen(!open);
					}
				}}
			>
				<DialogTrigger asChild onClick={() => handleAddCommentClicked()}>
					<div className="w-full h-full">
						<Button className={`${className}`} aria-label="Add Comment">
							Add Comment
						</Button>
					</div>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>
							<span
								className="text-slate-700 font-normal"
								aria-label={`Add Comment to ${data.title}`}
							>
								Add a Comment to
							</span>
							<q aria-hidden="true" className="">
								{data.title && data.title}
							</q>
						</DialogTitle>
						<DialogDescription className="text-slate-900 font-light">
							Enter your comment and press send to post it
						</DialogDescription>
					</DialogHeader>
					<Textarea
						onChange={(e) => setMessage(e.target.value)}
						value={message}
						aria-label="Comment Input"
						className="resize-none h-[200px]"
						placeholder="Type your comment here..."
						disabled={mutation.isPending}
					/>
					<Button
						onClick={handleOnSend}
						disabled={mutation.isPending}
						aria-live="polite"
						aria-pressed={mutation.isPending}
					>
						{mutation.isPending ? (
							<>
								<Loader2 className="animate-spin" aria-label="Please wait" />
								Please wait
							</>
						) : (
							<span aria-label="Send Comment">Send</span>
						)}
					</Button>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer
			open={open}
			onOpenChange={() => {
				if (session?.user) {
					setOpen(!open);
				}
			}}
		>
			<DrawerTrigger asChild onClick={handleAddCommentClicked}>
				<Button
					className={className}
					// onClick={() => console.info('button add comment')}
				>
					Add Comment
				</Button>
			</DrawerTrigger>
			<DrawerContent className="h-screen max-h-[80vh] flex flex-col px-4">
				<DrawerHeader className="text-left px-0 mx-0">
					<DrawerTitle>
						<span
							className="text-slate-500 mr-1"
							aria-label={`Add Comment to ${data.title}`}
						>
							Add a Comment to
						</span>
						{data.title && (
							<i aria-hidden="true">
								<q>{data.title}</q>
							</i>
						)}
					</DrawerTitle>
					<DrawerDescription className="mt-2 font-light">
						Enter your comment and press send to post it
					</DrawerDescription>
				</DrawerHeader>
				<Textarea
					onChange={(e) => setMessage(e.target.value)}
					value={message}
					className="flex-1 border border-slate-400 resize-none h-[200px]"
					aria-label="Comment Input"
					placeholder="Type your comment here..."
					disabled={mutation.isPending}
				/>
				<DrawerFooter className="pt-2 flex-row justify-end px-0 mt-2">
					<DrawerClose asChild>
						<Button
							variant="outline"
							aria-label="Cancel Comment"
							disabled={mutation.isPending}
						>
							Cancel
						</Button>
					</DrawerClose>
					<Button
						onClick={handleOnSend}
						disabled={mutation.isPending}
						aria-pressed={mutation.isPending}
					>
						{mutation.isPending ? (
							<div aria-label="please wait" className="flex items-center gap-2">
								<Loader2 className="animate-spin" aria-hidden="true" />
								<span>Please wait</span>
							</div>
						) : (
							<span aria-label="Send Comment">Send</span>
						)}
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
