'use client';

/* eslint-disable @next/next/no-img-element */
import React from 'react';

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '@/components/ui/card';
import { timeAgo } from '@/lib/utils';
import { EllipsisVertical, EyeIcon, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
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
import { Button } from './ui/button';

const PostCard = ({
	post,
	mode = 'normal',
	onDelete = () => {},
	onEdit = () => {},
	size = 'sm',
	fullWidth,
}: {
	post: Post;
	mode?: 'normal' | 'saved-post' | 'my-post';
	onDelete?: () => void;
	onEdit?: () => void;
	size?: 'sm' | 'md';
	fullWidth?: boolean;
}) => {
	const {
		createdAt,
		views,
		slug,
		title,
		description,
		thumbnail,
		postTag,
		user,
	} = post;

	return (
		<Card
			className={`w-full ${
				size === 'md'
					? 'max-w-[400px]'
					: fullWidth
					? 'max-w-full'
					: 'max-w-[300px]'
			} border-2 border-[var(--accent)] bg-transparent h-max break-inside-avoid relative overflow-hidden`}
		>
			<CardHeader className="space-y-2 pb-2">
				{mode === 'normal' && (
					<div
						className={`flex justify-between gap-2 ${
							size === 'md' ? 'text-sm' : 'text-xs'
						}`}
					>
						<p>{timeAgo(createdAt.toString())}</p>
						<div className="flex items-center gap-x-1">
							<EyeIcon
								className={`${
									size === 'md' ? 'size-6' : 'size-5'
								} text-slate-600`}
							/>
							<span className={`${size === 'md' ? 'text-base' : 'text-xs'}`}>
								{views}
							</span>
						</div>
					</div>
				)}
				{mode === 'saved-post' && (
					<div
						className={`flex justify-start flex-col gap-2 ${
							size === 'md' ? 'text-sm' : 'text-xs'
						}`}
					>
						<div className="flex gap-1 items-center">
							<EyeIcon className="size-5" />
							<span>{views}</span>
						</div>
						<p>{timeAgo(createdAt.toString())}</p>
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
					<div
						className={`flex justify-between items-center gap-2 ${
							size === 'md' ? 'text-sm' : 'text-xs'
						}`}
					>
						<div>
							<div className="flex gap-1 items-center">
								<EyeIcon className="size-5 text-slate-600" />
								<span>{views}</span>
							</div>
							<p>{timeAgo(createdAt.toString())}</p>
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
						<Link href={`/user/${user?.username}`}>
							<p className={`py-2 ${size === 'md' ? 'text-base' : 'text-sm'}`}>
								{user?.username}
							</p>
						</Link>
						<Link href={`/${slug}`}>
							<h3
								className={`font-bold ${
									size === 'md' ? 'text-xl' : 'text-base'
								}`}
							>
								{title}
							</h3>
						</Link>
					</div>
					<Link href={`/user/${user?.username}`} className="shrink-0">
						{user && user.image ? (
							<Image
								src={user.image}
								alt={user.username + ' image'}
								width={38}
								height={38}
								className={`rounded-full shrink-0 ${
									size === 'md' ? 'w-[48px] h-[48px]' : 'w-[38px] h-[38px]'
								} border`}
							/>
						) : (
							<Image
								src="https://placehold.co/48x48"
								alt="placeholder"
								width={38}
								height={38}
								className={`rounded-full shrink-0 ${
									size === 'md' ? 'w-[48px] h-[48px]' : 'w-[38px] h-[38px]'
								} border`}
							/>
						)}
					</Link>
				</div>
			</CardHeader>
			<CardContent>
				<Link href={`/post/${slug}`}>
					<p className={`${size === 'md' ? 'text-base' : 'text-xs'}`}>
						{description.length > 100
							? `${description.slice(0, 100)}...`
							: description}
					</p>
					<img
						src={thumbnail as string}
						alt="thumbnail"
						className={`mt-4 w-full object-cover object-center border-4 border-b-8 border-white ${
							size === 'md' ? 'max-h-[250px]' : 'max-h-[100px]'
						}`}
					/>
				</Link>
			</CardContent>
			<CardFooter className="flex flex-col gap-6 mt-[5px]">
				{postTag.length > 0 && (
					<div className={`w-full ${size === 'md' ? 'text-sm' : 'text-xs'}`}>
						<h3>Tags :</h3>
						<div className="flex items-center gap-1 flex-wrap mt-2">
							{postTag.map(({ tag: { id, label } }) => (
								<span
									key={id}
									className="px-2 py-[1px] inline-block select-none bg-[var(--accent)] text-white rounded-full"
								>
									{label}
								</span>
							))}
						</div>
					</div>
				)}
				{/* <Button asChild>
					<Link
						href={`/${slug}`}
						className={`${
							size === 'md' ? 'text-lg' : 'text-base'
						} uppercase hover:bg-blue-600 font-extrabold text-white bg-blue-500 hover:shadow-md rounded-full py-1 px-4 w-full`}
					>
						Read
					</Link>
				</Button> */}
			</CardFooter>
		</Card>
	);
};

export default PostCard;
