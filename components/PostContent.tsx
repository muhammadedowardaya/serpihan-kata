'use client';

import { Post } from '@/types';
import React, { useEffect, useState } from 'react';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import '@/styles/post-content.scss';
import { Button } from '@radix-ui/themes';
import { Bookmark, LoaderCircle, ThumbsUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Toast } from '@/lib/sweetalert';
import { Tooltip } from 'react-tooltip';
import dynamic from 'next/dynamic';
import { useLike } from '@/hooks/use-like';
import { PostCommentButton } from './PostCommentButton';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Loader } from './Loader';
import { useSearchParams } from 'next/navigation';
import { useAtom } from 'jotai';
import { alertPostContentAtom, showPostCommentAtom } from '@/jotai';
import { MyAlert } from './MyAlert';

const ShowPostContent = dynamic(() => import('./ShowPostContent'), {
	ssr: false,
	loading: () => <Loader text="Loading post content..." />,
});

const PostContent = ({
	data,
	hideBreadcrumb,
}: {
	data: Post;
	hideBreadcrumb?: boolean;
}) => {
	const queryClient = useQueryClient();

	const { data: session } = useSession();

	const [likesLength, setLikesLength] = useState(0);

	const [, setShowPostComment] = useAtom(showPostCommentAtom);
	const [alertPostContent, setAlertPostContent] = useAtom(alertPostContentAtom);

	const getPost = useQuery<unknown, Error, Post>({
		queryKey: ['post', data.id],
		queryFn: async () => {
			const response = await axios.get(`/api/post/${data.id}`);
			setLikesLength(response.data.post.likes.length);
			return response.data.post;
		},
	});

	const getIsLiked = useQuery<unknown, Error, { isLiked: boolean }>({
		queryKey: ['isLiked', data.id],
		queryFn: async () => {
			const response = await axios.get(`/api/post/${data.id}/isLiked`);
			return response.data;
		},
		enabled: !!data,
	});

	const { addLike, removeLike } = useLike();

	const [isLiked, setIsLiked] = useState(false);

	useEffect(() => {
		if (getIsLiked.data) {
			setIsLiked(getIsLiked.data.isLiked);
		}
	}, [getIsLiked.data]);

	const searchParams = useSearchParams();
	const commentId = searchParams.get('comment');

	useEffect(() => {
		if (commentId) {
			setShowPostComment(true);
		} else {
			setShowPostComment(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [commentId]);

	const likeHandler = async () => {
		if (!session || !session.user) {
			setAlertPostContent({
				title: 'Login Required',
				description: 'You must be logged in to perform this action.',
				type: 'warning',
			});

			return;
		}

		if (data?.userId === session?.user?.id) {
			// Swal.fire({
			// 	title: 'Info',
			// 	text: 'Liking your own post? Self-love is important! 😂',
			// 	icon: 'info',
			// });

			setAlertPostContent({
				title: 'Just a Heads-up!',
				description: 'Liking your own post? Confidence level: 100! 😆',
				type: 'info',
			});

			return;
		}

		if (getPost.data) {
			if (isLiked) {
				setIsLiked(false);
				setLikesLength(likesLength - 1);
				removeLike.mutate({
					userId: session?.user?.id as string,
					postId: getPost.data?.id,
				});
			} else {
				setIsLiked(true);
				setLikesLength(likesLength + 1);
				addLike.mutate({
					userId: session?.user?.id as string,
					postId: getPost.data?.id,
				});
			}
		}
	};

	const addPostToSavedPost = useMutation<unknown, Error, { postId: string }>({
		mutationFn: async ({ postId }: { postId: string }) => {
			const response = await axios.post(`/api/post/${postId}/add-to-saved`);
			return response.data.savedPost;
		},
		onSuccess: () => {
			Toast.fire(
				`"${data.title}" has been successfully added to your saved posts.`,
				'',
				'success'
			);

			queryClient.invalidateQueries({
				queryKey: ['isSavedPost', data.id],
			});
		},
		onError: (error) => {
			setAlertPostContent({
				title: `Error`,
				description: error.message,
				type: 'error',
			});
		},
	});

	const isSavedPost = useQuery<unknown, Error, { id: string }>({
		queryKey: ['isSavedPost', data.id],
		queryFn: async () => {
			const response = await axios.get(`/api/post/${data.id}/is-saved`);
			return response.data.savedPost;
		},
	});

	const removeFromSavedPost = useMutation<unknown, Error, { id: string }>({
		mutationFn: async ({ id }: { id: string }) => {
			const response = await axios.delete(`/api/saved-post/${id}`);
			return response.data;
		},
		onSuccess: () => {
			Toast.fire(
				`"${data.title}" has been successfully removed from your saved posts.`,
				'',
				'success'
			);
			queryClient.invalidateQueries({
				queryKey: ['isSavedPost', data.id],
			});
		},
		onError: (error) => {
			setAlertPostContent({
				title: 'Error',
				description: error.message,
				type: 'error',
			});
		},
	});

	const savePostHandler = () => {
		if (!session || !session.user) {
			setAlertPostContent({
				title: 'Login Required',
				description: 'You need to log in to save this post.',
				type: 'warning',
			});

			return;
		}

		if (session?.user.id === data.userId) {
			setAlertPostContent({
				title: 'Info',
				description:
					'Saving your own post? What’s next, giving yourself an award? 😏',
				type: 'info',
			});

			return;
		}

		if (data.id) {
			if (isSavedPost.data?.id) {
				removeFromSavedPost.mutate({ id: isSavedPost.data.id });
			} else {
				addPostToSavedPost.mutate({
					postId: data.id,
				});
			}
		}
	};

	useEffect(() => {
		queryClient.invalidateQueries({
			queryKey: ['isSavedPost', data.id],
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data.id]);

	if (getPost.isPending) return <Loader text="Loading post content..." />;

	return (
		<article
			className={`post-content padding-content ${
				hideBreadcrumb ? 'hide-breadcrumb' : ''
			} relative`}
		>
			{!hideBreadcrumb && (
				<section className="padding-content flex justify-center items-center breadcrumb flex items-center text-xs sm:text-base">
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink
									href="/posts"
									className="underline underline-offset-4"
								>
									All Posts
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>
									{`${
										data.title.length > 20
											? `${data.title.slice(0, 30)}...`
											: data.title
									}`}
								</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</section>
			)}

			<section className="pt-4 sm:pt-0 grid prose sm:prose-xl md:prose-2xl w-full mx-auto mt-4 main-content relative z-40">
				<ScrollArea className="px-4">
					<ShowPostContent data={data} />
				</ScrollArea>
				{/* <div className="z-50 absolute bottom-0 left-0 right-0 h-[20px] bg-accent"></div> */}
			</section>

			<div className="py-4 info-section">
				<div className="flex flex-col xs:flex-row items-center gap-4 py-4 md:py-0 border-y border-primary md:border-none xs:items-start xs:justify-between mb-6">
					{/* Tanggal */}
					<p className="text-xs md:text-sm font-semibold my-0">
						{formatDate(getPost.data?.createdAt.toString() as string)}
					</p>
					<div className="flex items-center justify-center w-max gap-4">
						<Button
							variant="ghost"
							className="flex items-end gap-1 group"
							aria-pressed={isLiked}
							aria-label={isLiked ? 'Unlike this post' : 'Like this post'}
							onClick={likeHandler}
						>
							<ThumbsUp
								strokeWidth={1}
								className={`size-5 ${
									isLiked ? 'fill-primary' : ''
								} group-hover:fill-primary`}
								aria-hidden="true"
							/>
							{likesLength > 0 && (
								<span className="text-sm">{likesLength}</span>
							)}
						</Button>

						<PostCommentButton data={data} className="!size-5" />

						{isSavedPost.isPending ||
						removeFromSavedPost.isPending ||
						addPostToSavedPost.isPending ? (
							<Button
								variant="ghost"
								color="gray"
								className="w-max hover:bg-transparent group"
							>
								<LoaderCircle className="animate-spin size-5 group-hover:fill-primary" />
							</Button>
						) : (
							<Button
								variant="ghost"
								data-tooltip-id="bookmark"
								data-tooltip-delay-show={1000}
								className="w-max group"
								onClick={savePostHandler}
							>
								<Bookmark
									className={`${
										isSavedPost.data ? 'fill-primary' : ''
									} size-5 group-hover:fill-primary`}
									strokeWidth={isSavedPost.data ? 0 : 1}
								/>
							</Button>
						)}

						<Tooltip id="bookmark" place="top" className="text-sm! w-32">
							{isSavedPost.data
								? 'Click to remove from saved posts'
								: 'Click to save post'}
						</Tooltip>
					</div>
				</div>

				<div className="">
					<h3 className="text-center sm:text-start text-xs text-slate-400 sm:text-base">
						Author
					</h3>
					<Link href={`/author/${getPost.data?.user.username}`}>
						<div className="flex rounded-md h-max items-center gap-3 hover:opacity-80 transition-opacity p-2">
							<Avatar className="rounded-full max-w-10 max-h-10">
								<AvatarImage
									src={getPost.data?.user.image || 'https://placehold.co/48x48'}
									alt={getPost.data?.user.username}
									className="m-0 border border-border"
								/>
								<AvatarFallback className="m-0 border border-border">
									{getPost.data?.user.username?.slice(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="flex flex-col gap-1 ">
								<span className="text-sm font-semibold word-break leading-4">
									{getPost.data?.user.name}
								</span>
								<span className="text-xs text-muted-foreground word-break">
									@{getPost.data?.user.username}
								</span>
							</div>
						</div>
					</Link>
				</div>

				{/* Kategori / Tags */}
				{getPost.data?.postTag && getPost.data?.postTag.length > 0 && (
					<div className="mt-4">
						<h3 className="mb-2 text-xs sm:text-sm text-slate-400">Tags :</h3>
						<div className="flex flex-wrap gap-2">
							{getPost.data?.postTag.map(({ tag: { id, label } }) => (
								<span
									key={id}
									className="px-2 text-xs sm:text-sm border border-slate-700 rounded-full"
								>
									{label}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Tombol Aksi */}
				{/* <div className="flex items-center gap-4 mt-2">
						<Button variant="ghost" size="icon">
							<Heart className="w-5 h-5 text-gray-500 hover:text-red-500" />
						</Button>
						<Button variant="ghost" size="icon">
							<MessageSquare className="w-5 h-5 text-gray-500 hover:text-blue-500" />
						</Button>
						<Button variant="ghost" size="icon">
							<Share className="w-5 h-5 text-gray-500 hover:text-green-500" />
						</Button>
						<Button variant="ghost" size="icon">
							<Bookmark className="w-5 h-5 text-gray-500 hover:text-yellow-500" />
						</Button>
					</div> */}
			</div>

			{alertPostContent && (
				<MyAlert
					open={!!alertPostContent}
					onConfirm={() => setAlertPostContent(null)}
					textConfirmButton="Ok"
					type={
						alertPostContent?.type as 'error' | 'success' | 'warning' | 'info'
					}
					title={alertPostContent?.title as string}
					description={<span>{alertPostContent?.description}</span>}
				/>
			)}
		</article>
	);
};

export default PostContent;
