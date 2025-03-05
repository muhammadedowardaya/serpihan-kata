'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';

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
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarTrigger,
} from './ui/menubar';
import { Button } from './ui/button';
import { filterByTagsAtom } from '@/jotai';
import { useAtom } from 'jotai';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

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
		isDraft,
	} = post;

	const [filterByTags] = useAtom(filterByTagsAtom);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	useEffect(() => {
		setSelectedTags(filterByTags.map(({ value }) => value));
	}, [filterByTags]);

	return (
		<Card
			className={`w-full ${
				size === 'md'
					? 'max-w-[400px]'
					: fullWidth
					? 'max-w-full'
					: 'max-w-[300px]'
			} border border-border m-[2px] p-[2px] h-max break-inside-avoid relative overflow-hidden`}
		>
			<CardHeader className="flex flex-col gap-2 pb-2 px-4 pt-4">
				{mode === 'normal' && (
					<div
						className={`flex justify-between gap-2 ${
							size === 'md' ? 'text-sm' : 'text-xs'
						}`}
					>
						<p>{timeAgo(createdAt.toString())}</p>
						<div className="flex items-center gap-x-1">
							<EyeIcon className={`${size === 'md' ? 'size-6' : 'size-5'}`} />
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
							className="h-14 w-14 p-0 m-0 absolute top-0 right-0 bg-red-700 rounded-bl-full z-30"
						>
							<Trash2 size={20} className="text-white mb-2 ml-2" />
						</Button>
					</div>
				)}
				{mode === 'my-post' && (
					<div
						className={`flex justify-between items-center gap-2 ${
							size === 'md' ? 'text-sm' : 'text-xs'
						}`}
					>
						<div className="flex flex-col gap-2">
							<div className="flex gap-2 items-center">
								<EyeIcon className="size-5 text-slate-600" />
								<span>{views}</span>
							</div>
							<p>{timeAgo(createdAt.toString())}</p>
						</div>
						<Menubar className="border-none">
							<MenubarMenu>
								<MenubarTrigger className="p-0 ">
									<EllipsisVertical size={20} />
								</MenubarTrigger>
								<MenubarContent className="min-w-max">
									<MenubarItem asChild className="p-0">
										<div className="w-full">
											<Button
												variant="accent"
												className="w-full"
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
									<MenubarItem asChild className="p-0">
										<div className="w-full">
											<Button
												variant="destructive"
												className="w-full"
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
						<Link href={`/author/${user?.username}`}>
							<p className={`py-2 ${size === 'md' ? 'text-base' : 'text-sm'}`}>
								{user?.username}
							</p>
						</Link>
						<Link href={`${isDraft ? '#' : `/${slug}`}`}>
							<h3
								className={`font-bold ${
									size === 'md' ? 'text-xl' : 'text-base md:text-lg'
								}`}
							>
								{title}
							</h3>
						</Link>
					</div>
					<Link
						href={`/author/${user?.username}`}
						className="shrink-0 w-10 h-10 border border-slate-300 rounded-full"
					>
						<Avatar className="w-full h-full">
							<AvatarImage
								src={user?.image as string}
								alt={user?.name as string}
								className="object-cover bg-primary text-primary-foreground"
							/>
							<AvatarFallback className="bg-primary text-primary-foreground">
								{user?.username.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
					</Link>
				</div>
			</CardHeader>
			<CardContent className="px-4">
				<Link href={isDraft ? '#' : `/post/${slug}`}>
					<p className={`${size === 'md' ? 'text-lg' : 'text-xs md:text-sm'}`}>
						{description.length > 100
							? `${description.slice(0, 100)}...`
							: description}
					</p>
					{thumbnail ? (
						<img
							src={thumbnail as string}
							alt="thumbnail"
							className={`mt-4 w-full object-cover object-center border-border shadow-md ${
								size === 'md' ? 'max-h-[250px]' : 'max-h-[150px]'
							}`}
						/>
					) : (
						<div
							className={`mt-4  w-full flex justify-center items-center border-border shadow-md ${
								size === 'md' ? 'h-[250px]' : 'h-[150px]'
							}`}
						>
							<p>No thumbnail</p>
						</div>
					)}
				</Link>
			</CardContent>
			<CardFooter className="px-4 pb-4 flex flex-col gap-6 mt-[5px]">
				{postTag.length > 0 && (
					<div className={`w-full ${size === 'md' ? 'text-sm' : 'text-xs'}`}>
						<h3>Tags :</h3>
						<div className="flex items-center gap-x-2 gap-y-1 flex-wrap mt-2">
							{postTag.map(({ tag: { id, label, value } }) => (
								<span
									key={id}
									className={`${
										selectedTags.includes(value)
											? 'bg-highlight text-highlight-foreground'
											: ''
									} px-2 pb-[1px] inline-block select-none border rounded-full`}
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
