'use client';

/* eslint-disable @next/next/no-img-element */
import React from 'react';

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { EllipsisVertical, EyeIcon, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@radix-ui/themes';
import { Post } from '@/types';
import Image from 'next/image';
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarTrigger,
} from './ui/menubar';

const PostCard = ({
	post,
	size = 'normal',
	mode = 'normal',
	onDelete = () => {},
	onEdit = () => {},
}: {
	post: Post;
	size?: 'small' | 'normal';
	mode?: 'normal' | 'saved-post' | 'my-post';
	onDelete?: () => void;
	onEdit?: () => void;
}) => {
	const {
		createdAt,
		views,
		slug,
		title,
		description,
		thumbnail,
		category,
		userId,
		user,
	} = post;

	if (size === 'small') {
		return (
			<Card
				className={`w-full max-w-[300px] h-max break-inside-avoid relative overflow-hidden`}
			>
				<CardHeader className="space-y-2 pb-2">
					{mode === 'normal' && (
						<div className="flex justify-between text-xs">
							<p>{formatDate(createdAt.toString())}</p>
							<div className="flex gap-x-1">
								<EyeIcon className="size-5 text-slate-600" />
								<span>{views}</span>
							</div>
						</div>
					)}
					{mode === 'saved-post' && (
						<div className="flex justify-start flex-col gap-2 text-xs">
							<div className="flex gap-1 items-center">
								<EyeIcon className="size-5 text-slate-600" />
								<span>{views}</span>
							</div>
							<p>{formatDate(createdAt.toString())}</p>
							<Button
								onClick={() => {
									if (onDelete) onDelete();
								}}
								variant="ghost"
								className="absolute top-0 right-0 bg-red-700 rounded-bl-full"
							>
								<Trash2 size={20} className="text-white m-2" />
							</Button>
						</div>
					)}
					{mode === 'my-post' && (
						<div className="flex justify-between items-center gap-2 text-xs">
							<div>
								<div className="flex gap-1 items-center">
									<EyeIcon className="size-5 text-slate-600" />
									<span>{views}</span>
								</div>
								<p>{formatDate(createdAt.toString())}</p>
							</div>
							<Menubar className="border-none">
								<MenubarMenu>
									<MenubarTrigger className="p-0 focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground">
										<EllipsisVertical size={20} />
									</MenubarTrigger>
									<MenubarContent className="min-w-max">
										<MenubarItem asChild>
											<div className="w-full">
												<Button
													onClick={() => {
														if (onEdit) {
															onEdit();
														}
													}}
												>
													<Pencil size={16} className="mr-2" />
													Edit
												</Button>
											</div>
										</MenubarItem>
										<MenubarSeparator />
										<MenubarItem asChild>
											<div className="w-max">
												<Button
													onClick={() => {
														if (onDelete) {
															onDelete();
														}
													}}
												>
													<Trash2 size={16} className="mr-2" />
													Delete
												</Button>
											</div>
										</MenubarItem>
									</MenubarContent>
								</MenubarMenu>
							</Menubar>
						</div>
					)}
					<div className="flex justify-between gap-5 py-2">
						<div className="flex-1">
							<Link href={`/user/${userId}`}>
								<p className="text-sm py-2">{user?.username}</p>
							</Link>
							<Link href={`/${slug}`}>
								<h3 className="font-bold text-base">{title}</h3>
							</Link>
						</div>
						<Link href={`/user/${userId}`} className="flex-shrink-0">
							{user.image ? (
								<Image
									src={user.image}
									alt={user.username + ' image'}
									width={38}
									height={38}
									className="rounded-full flex-shrink-0 w-[38px] h-[38px] border"
								/>
							) : (
								<Image
									src="https://placehold.co/48x48"
									alt="placeholder"
									width={38}
									height={38}
									className="rounded-full flex-shrink-0 w-[38px] h-[38px] border"
								/>
							)}
						</Link>
					</div>
				</CardHeader>
				<CardContent>
					<Link href={`/${slug}`}>
						<p className="text-xs">
							{description.length > 100
								? `${description.slice(0, 100)}...`
								: description}
						</p>
						<img
							src={thumbnail as string}
							alt="thumbnail"
							className="mt-4 w-full object-cover object-center max-h-[100px]"
						/>
					</Link>
				</CardContent>
				<CardFooter className="flex justify-between mt-[10px]">
					<Link href={`/?query=${category.value}`}>
						<p className="!text-xs">{category.label}</p>
					</Link>
					<Button asChild>
						<Link href={`/${slug}`} className="!text-xs">
							Details
						</Link>
					</Button>
				</CardFooter>
			</Card>
		);
	}

	return (
		<Card className={`w-full max-w-[400px] h-max break-inside-avoid mb-[20px]`}>
			<CardHeader className="space-y-2">
				<div className="flex justify-between text-[14px]">
					{createdAt && <p>{formatDate(createdAt.toString())}</p>}
					<div className="flex gap-x-1">
						<EyeIcon className="size-5 text-slate-600" />
						<span>{views}</span>
					</div>
				</div>
				<div className="flex justify-between gap-5 py-2">
					<div className="flex-1">
						<Link href={`/user/${userId}`}>
							<p className="text-[14px] py-2">{user?.username}</p>
						</Link>
						<Link href={`/${slug}`}>
							<h3 className="font-bold text-[24px] leading-7">{title}</h3>
						</Link>
					</div>
					<Link href={`/user/${userId}`} className="flex-shrink-0">
						{user.image ? (
							<Image
								src={user.image}
								alt={user.username + ' image'}
								width={48}
								height={48}
								className="rounded-full w-[48px] h-[48px] border"
							/>
						) : (
							<Image
								src="https://placehold.co/48x48"
								alt="placeholder"
								width={48}
								height={48}
								className="rounded-full w-[48px] h-[48px] border"
							/>
						)}
					</Link>
				</div>
			</CardHeader>
			<CardContent>
				<Link href={`/${slug}`}>
					<p>
						{description.length > 100
							? `${description.slice(0, 100)}...`
							: description}
					</p>
					<img
						src={thumbnail as string}
						alt="thumbnail"
						className="mt-4 max-h-[200px]"
					/>
				</Link>
			</CardContent>
			<CardFooter className="flex justify-between mt-[20px]">
				<Link href={`/?query=${category.value}`}>
					<p className="text-[14px]">{category.label}</p>
				</Link>
				<Button asChild>
					<Link href={`/${slug}`}>Details</Link>
				</Button>
			</CardFooter>
		</Card>
	);
};

export default PostCard;
