'use client';

import { Comment, Post } from '@/types';
import React from 'react';
import { ScrollArea } from './ui/scroll-area';
import { CommentButton } from './CommentButton';
import { CommentList } from './CommentList';

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

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

import { Button } from './ui/button';
import { MessageCircle, X } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import { AnimatePresence, motion } from 'framer-motion';
import { CommentReplyInput } from './CommentReplyInput';
import { useAtom, useAtomValue } from 'jotai';
import {
	alertPostCommentAtom,
	replyToAtom,
	showPostCommentAtom,
} from '@/jotai';
import { MyAlert } from './MyAlert';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
// import { useQuery } from '@tanstack/react-query';
// import axios from 'axios';

export const PostCommentButton = ({
	data,
	className,
}: {
	data: Post;
	className?: string;
}) => {
	const [showPostComment, setShowPostComment] = useAtom(showPostCommentAtom);

	const isDesktop = useMediaQuery('(min-width: 768px)');

	const [replyTo, setReplyTo] = useAtom(replyToAtom);
	const alertPostComment = useAtomValue(alertPostCommentAtom);

	const getCommentCount = useQuery({
		queryKey: ['commentCount', data.id],
		queryFn: async () => {
			const response = await axios.get(`/api/post/${data.id}/comments/length`);
			return response.data.commentCount;
		},
	});

	if (isDesktop) {
		return (
			<Dialog
				open={showPostComment}
				onOpenChange={() => {
					setShowPostComment(!showPostComment);
					setReplyTo(null);
				}}
			>
				<DialogTrigger asChild>
					<Button
						variant="ghost"
						className="p-0 m-0 h-max flex items-center gap-1 group"
					>
						<MessageCircle
							strokeWidth={1}
							className={`${className} group-hover:fill-primary text-2xl`}
						/>
						{getCommentCount.data && getCommentCount.data > 0 && (
							<span className="text-xs">{getCommentCount.data}</span>
						)}
					</Button>
				</DialogTrigger>

				<DialogContent className="h-screen max-w-[600px] mx-auto max-h-[85vh] px-8 flex flex-col">
					{/* Header tetap di tempatnya */}
					<DialogHeader className="shrink-0 pt-2">
						<DialogTitle>{`What’s on Your Mind?`}</DialogTitle>
						<DialogDescription>
							See what people are talking about and jump into the discussion!
						</DialogDescription>
					</DialogHeader>

					{/* Bagian yang memiliki scroll */}
					<section className="relative border-y-2 border-primary rounded-md pl-2 pt-2 pr-0 overflow-hidden grid flex-1">
						<ScrollArea className="pr-5">
							<CommentList
								comments={data.comments as unknown as Comment[]}
								postId={data.id as string}
							/>
						</ScrollArea>

						<AnimatePresence initial={false}>
							{replyTo && (
								<motion.div
									className="absolute inset-0 z-40 bg-background/20 backdrop-blur-[2px] rounded-md border border-transparent border-t-white/10 border-b-black/10 shadow-lg"
									key={`background-${replyTo.id}`}
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1.02 }}
									transition={{ ease: 'easeInOut', duration: 0.6 }}
									exit={{ opacity: 0, scale: 0.95 }}
								></motion.div>
							)}
						</AnimatePresence>
					</section>

					{/* Footer tetap di tempatnya */}

					{!replyTo && (
						<DialogFooter className="shrink-0 flex flex-row justify-end">
							<AnimatePresence>
								<motion.div
									key={`comment-button-${data.id}`}
									initial={{ opacity: 0, scale: 0.9, y: 20 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.9, y: 20 }}
									transition={{ type: 'spring', stiffness: 200, damping: 20 }}
								>
									<CommentButton
										data={data}
										className="w-max bg-amber-300 hover:bg-amber-400 border border-primary text-slate-900"
									/>
								</motion.div>
							</AnimatePresence>
						</DialogFooter>
					)}

					{/* Tampilkan input reply jika tombol reply diklik */}
					<AnimatePresence>
						{replyTo && (
							<motion.div
								className="ml-6 mt-4 fixed bottom-4 right-2 w-[95%] max-w-[400px] z-40 bg-background text-background-foreground border border-slate-500 rounded-md"
								key={`comment-input-${replyTo.id}`}
								initial={{ opacity: 0, scale: 0.9, y: 40 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.9, y: 40 }}
								transition={{ type: 'spring', stiffness: 200, damping: 20 }}
							>
								<CommentReplyInput comment={replyTo} />
							</motion.div>
						)}
					</AnimatePresence>

					{alertPostComment && (
						<MyAlert
							open={!!alertPostComment}
							onConfirm={alertPostComment.onConfirm as VoidFunction}
							onCancel={alertPostComment.onCancel}
							isLoadingConfirm={!!alertPostComment.isLoadingConfirm}
							textCancelButton={alertPostComment?.textCancelButton as string}
							textConfirmButton={alertPostComment?.textConfirmButton as string}
							type={
								alertPostComment?.type as
									| 'error'
									| 'success'
									| 'warning'
									| 'info'
							}
							title={alertPostComment?.title as string}
							description={<span>{alertPostComment?.description}</span>}
						/>
					)}
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer
			open={showPostComment}
			onOpenChange={() => {
				setShowPostComment(!showPostComment);
				setReplyTo(null);
			}}
		>
			<DrawerTrigger asChild>
				<Button
					variant="ghost"
					className="p-0 m-0 h-max flex items-center gap-1 group"
				>
					<MessageCircle
						strokeWidth={1}
						className={`${className} group-hover:fill-primary`}
					/>
					{getCommentCount.data && getCommentCount.data > 0 && (
						<span className="text-xs">{getCommentCount.data}</span>
					)}
				</Button>
			</DrawerTrigger>

			<DrawerContent className="h-screen max-h-[85vh] max-w-[600px] mx-auto px-4 flex flex-col">
				<DrawerHeader>
					<DrawerTitle>What’s on Your Mind?</DrawerTitle>
					<DrawerDescription>
						See what people are talking about and jump into the discussion!
					</DrawerDescription>
				</DrawerHeader>

				<section className="relative border-y-2 border-primary rounded-md pl-2 pt-2 pr-0 overflow-hidden grid flex-1">
					<ScrollArea className="pr-4">
						<CommentList
							comments={data.comments as unknown as Comment[]}
							postId={data.id}
						/>
					</ScrollArea>
					<AnimatePresence initial={false}>
						{replyTo && (
							<motion.div
								className="absolute inset-0 z-40 bg-background/20 backdrop-blur-[2px] rounded-md border border-transparent border-t-white/10 border-b-black/10 shadow-lg"
								key={`background-${replyTo.id}`}
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1.02 }}
								transition={{ ease: 'easeInOut', duration: 0.6 }}
								exit={{ opacity: 0, scale: 0.95 }}
							></motion.div>
						)}
					</AnimatePresence>
				</section>

				<DrawerFooter className="flex flex-row justify-end px-0 pt-4 pb-8">
					{!replyTo && (
						<CommentButton
							data={data}
							className="w-max bg-amber-300 hover:bg-amber-400 border border-primary text-slate-900"
						/>
					)}
					<DrawerClose asChild className="absolute top-2 right-2">
						<Button
							variant="outline"
							className="rounded-full w-10 h-10 p-1 bg-destructive text-white"
							onClick={() => setReplyTo(null)}
						>
							<X className="size-6" />
						</Button>
					</DrawerClose>
				</DrawerFooter>

				{/* Tampilkan input reply jika tombol reply diklik */}
				<AnimatePresence initial={false}>
					{replyTo && (
						<motion.div
							className="ml-6 mt-4 fixed bottom-4 right-2 w-[95%] max-w-[400px] z-40 bg-background text-background-foreground border border-slate-500 rounded-md"
							key={`comment-input-${replyTo.id}`}
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ ease: 'easeInOut' }}
							exit={{ opacity: 0, scale: 0.95 }}
						>
							<CommentReplyInput comment={replyTo} />
						</motion.div>
					)}
				</AnimatePresence>

				{alertPostComment && (
					<MyAlert
						open={!!alertPostComment}
						onConfirm={alertPostComment.onConfirm as VoidFunction}
						onCancel={alertPostComment.onCancel}
						isLoadingConfirm={!!alertPostComment.isLoadingConfirm}
						textCancelButton={alertPostComment?.textCancelButton as string}
						textConfirmButton={alertPostComment?.textConfirmButton as string}
						type={
							alertPostComment?.type as 'error' | 'success' | 'warning' | 'info'
						}
						title={alertPostComment?.title as string}
						description={<span>{alertPostComment?.description}</span>}
					/>
				)}
			</DrawerContent>
		</Drawer>
	);
};
