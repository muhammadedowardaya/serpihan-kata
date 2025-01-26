'use client';

import { Comment, Post } from '@/types';
import React, { useEffect } from 'react';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import '@/styles/post-content.scss';
import { Button, Heading, ScrollArea } from '@radix-ui/themes';
import { CommentButton } from './CommentButton';
import { Bookmark, LoaderCircle } from 'lucide-react';
import { CommentList } from './CommentList';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Toast } from '@/lib/sweetalert';
import Swal from 'sweetalert2';
import { Tooltip } from 'react-tooltip';
import dynamic from 'next/dynamic';

const ShowPostContent = dynamic(() => import('./ShowPostContent'), {
	ssr: false,
	loading: () => <LoaderCircle className="animate-spin" />,
});

const PostContent = ({
	data,
	hideBreadcrumb,
}: {
	data: Post;
	hideBreadcrumb?: boolean;
}) => {
	const { data: session } = useSession();

	const queryClient = useQueryClient();

	const getPost = useQuery({
		queryKey: ['post', data.id],
		queryFn: async () => {
			const response = await axios.get(`/api/post/${data.id}`);
			return response.data.post;
		},
	});

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
			Swal.fire({
				title: 'Error',
				text: error.message,
				icon: 'error',
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
			Swal.fire({
				title: 'Error',
				text: error.message,
				icon: 'error',
			});
		},
	});

	const savePostHandler = () => {
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

	if (getPost.isPending) return <LoaderCircle className="animate-spin" />;

	return (
		<article
			className={`post-content relative ${
				hideBreadcrumb ? 'hide-breadcrumb' : ''
			}`}
		>
			{!hideBreadcrumb && (
				<section className="breadcrumb flex items-center">
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink href="/">All Posts</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>View Post : {`${data.title}`}</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</section>
			)}
			<header className="prose mb-[20px] info-section">
				<Heading as="h3" className="text-primary text-base">
					{data?.title}
				</Heading>
				<ScrollArea type="auto" scrollbars="vertical">
					<p className="prose my-0 text-sm">{data.description}</p>
				</ScrollArea>
			</header>
			<div className="comment-section relative">
				<h3 className="sticky top-0 bg-white text-slate-900 font-semibold">
					Comments
				</h3>
				<section className="border border-slate-400 rounded-md p-2 bg-white">
					<ScrollArea
						type="auto"
						scrollbars="vertical"
						className="pl-[10px] pt-[10px] pr-[20px]"
					>
						<CommentList
							comments={data.comments as unknown as Comment[]}
							postId={data.id}
						/>
					</ScrollArea>
				</section>
				<CommentButton data={data} />
			</div>
			<section className="prose lg:prose-2xl w-full mx-auto border-2 main-content relative">
				{/* {(session?.user && session.user.role) === 'USER' && (
					<div className="absolute right-0 -top-10 flex flex-col !h-max">
						{isSavedPost.isPending ||
						removeFromSavedPost.isPending ||
						addPostToSavedPost.isPending ? (
							<Button
								variant="ghost"
								color="gray"
								className="!ml-[1px] !py-2 w-max hover:bg-transparent"
							>
								<LoaderCircle className="animate-spin" />
							</Button>
						) : (
							<a
								data-tooltip-id="bookmark"
								data-tooltip-delay-show={1000}
								className="!ml-[1px] !py-2 w-max"
								onClick={savePostHandler}
							>
								<Bookmark
									className={`${isSavedPost.data ? 'fill-sky-500' : ''}`}
									strokeWidth={isSavedPost.data ? 0 : 2}
								/>
							</a>
						)}

						<Tooltip id="bookmark" place="top" className="!text-sm w-32">
							{isSavedPost.data
								? 'Click to remove from saved posts'
								: 'Click to save post'}
						</Tooltip>
					</div>
				)} */}

				<div className="absolute right-0 -top-10 flex flex-col !h-max">
					{isSavedPost.isPending ||
					removeFromSavedPost.isPending ||
					addPostToSavedPost.isPending ? (
						<Button
							variant="ghost"
							color="gray"
							className="!ml-[1px] !py-2 w-max hover:bg-transparent"
						>
							<LoaderCircle className="animate-spin" />
						</Button>
					) : (
						<a
							data-tooltip-id="bookmark"
							data-tooltip-delay-show={1000}
							className="!ml-[1px] !py-2 w-max"
							onClick={savePostHandler}
						>
							<Bookmark
								className={`${isSavedPost.data ? 'fill-sky-500' : ''}`}
								strokeWidth={isSavedPost.data ? 0 : 2}
							/>
						</a>
					)}

					<Tooltip id="bookmark" place="top" className="!text-sm w-32">
						{isSavedPost.data
							? 'Click to remove from saved posts'
							: 'Click to save post'}
					</Tooltip>
				</div>

				<ShowPostContent data={data} />
			</section>
		</article>
	);
};

export default PostContent;
