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
import { Post } from '@/types';
import Swal from 'sweetalert2';
import { Toast } from '@/lib/sweetalert';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

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

	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: ({ postId, message }: { postId: string; message: string }) => {
			return axios.post(
				`/api/post/${postId}/comment`,
				{
					message,
					userId: session?.user?.id,
				},
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['comments', data.id],
			});
			Toast.fire('Add comment success!', '', 'success');
			setOpen(false);
		},
		onError: (error) => {
			setOpen(false);
			Swal.fire({
				title: 'Add comment failed!',
				text: error.message,
				icon: 'error',
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
			Swal.fire({
				title: `You can't send empty comment!`,
				text: 'Comment value is required!',
				icon: 'warning',
			});
		}
	};

	const handleAddCommentClicked = () => {
		if (!session || !session.user) {
			Swal.fire({
				title: 'Login Required',
				text: 'You must login to like a comment',
				icon: 'warning',
			});
			return;
		}

		setOpen(true);
	};

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<div className="w-full h-full">
						<Button
							className={`${className} w-full h-full`}
							onClick={handleAddCommentClicked}
						>
							Add Comment
						</Button>
					</div>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>
							Add a Comment {data.title && `to "${data.title}"`}
						</DialogTitle>
						<DialogDescription>
							{`Enter your comment and press send to post it`}
						</DialogDescription>
					</DialogHeader>
					<Textarea onChange={(e) => setMessage(e.target.value)} value={message} />
					<Button onClick={handleOnSend} disabled={mutation.isPending}>
						{mutation.isPending ? (
							<>
								<Loader2 className="animate-spin" />
								Please wait
							</>
						) : (
							'Send'
						)}
					</Button>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>
				<Button className={className}>Add Comment</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle>
						Add a Comment {data.title && `to "${data.title}"`}
					</DrawerTitle>
					<DrawerDescription>
						{`Enter your comment and press send to post it`}
					</DrawerDescription>
				</DrawerHeader>
				<Textarea onChange={(e) => setMessage(e.target.value)} value={message} />
				<DrawerFooter className="pt-2">
					<DrawerClose asChild>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
