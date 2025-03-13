'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import ChooseLoginButton from './ChooseLoginButton';

import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarTrigger,
} from '@/components/ui/menubar';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LogoutButton } from './LogoutButton';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from './ui/skeleton';
import { Bell, House, LayoutList, ListChecks, UserIcon } from 'lucide-react';
import { UnreadNotification } from './UnreadNotifications';
import { User } from 'next-auth';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/jotai';
import { useRouter } from 'next/navigation';
import { ActionButtonMyPosts } from './ActionButtonMyPosts';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const Navbar = ({ className }: { className?: string }) => {
	const [isOpen, setIsOpen] = useState(false);

	const user = useAtomValue(userAtom);

	const xs = useMediaQuery('(min-width: 460px)');

	const router = useRouter();

	const getUser = useQuery<User>({
		queryKey: ['user'],
		queryFn: async () => {
			const response = await axios.get('/api/user');
			return response.data.user;
		},
		enabled: !!user,
	});

	let avatarFallbackLetter = '';
	const fullNameArray = user?.name?.split(' ');

	if (fullNameArray) {
		let firstLetter = '';
		let secondLetter = '';

		if (fullNameArray.length > 1) {
			firstLetter = fullNameArray[0].at(0) as string;
			secondLetter = fullNameArray[1].at(0) as string;
		} else {
			firstLetter = fullNameArray[0].at(0) as string;
			secondLetter = fullNameArray[0].at(1) as string;
		}

		avatarFallbackLetter = firstLetter + secondLetter;
	}

	useEffect(() => {
		if (user && !user?.username) {
			router.push('/dashboard/profile');
			console.info({ user });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) return null;

	return (
		<nav className={`flex justify-between items-center ${className}`}>
			<Link href="/" className="shrink-0">
				<Image src="/logo-singkat-sk1x.png" alt="logo" width={30} height={30} />
			</Link>

			{getUser.isPending && user ? (
				<div className="flex items-center gap-4">
					<Skeleton className="h-3 w-10" />
					<Skeleton className="h-3 w-20" />
					<Skeleton className="w-10 h-10 rounded-full" />
				</div>
			) : (
				<div className="flex shrink-0 items-center gap-5">
					{user ? (
						<>
							{/* <Link href="/dashboard/posts/create" className="hidden sm:block">
								<span className="text-sm md:text-base ">Create</span>
							</Link> */}
							<div className="hidden xs:block">
								<ActionButtonMyPosts />
							</div>

							<Menubar className="border-none shadow-none">
								<MenubarMenu>
									<MenubarTrigger
										asChild
										className="p-0"
										onClick={() => setIsOpen(!isOpen)}
									>
										<div className="flex gap-4 items-center">
											{user?.name && user?.name?.length > 23 ? (
												<span className="text-sm md:text-base hidden xxs:inline-block font-normal">
													{xs ? user?.name : `@${user?.username}`}
												</span>
											) : (
												<span className="text-sm md:text-base hidden xxs:inline-block font-normal">
													{!xs ? `@${user?.username}` : user?.name}
												</span>
											)}
											<div className="relative w-10 h-10 border-none">
												<Avatar className="w-full h-full bg-secondary border border-primary">
													<AvatarImage
														src={user?.image as string}
														alt={user?.name as string}
														className="object-cover"
													/>
													<AvatarFallback className="bg-secondary border border-primary">
														{avatarFallbackLetter.toUpperCase()}
													</AvatarFallback>
												</Avatar>
												{!!isOpen === false && (
													<UnreadNotification
														className={`absolute -top-1 -right-2`}
													/>
												)}
											</div>
										</div>
									</MenubarTrigger>
									<MenubarContent
										className="w-48 mt-2 p-2 border rounded-lg shadow-lg"
										align="end"
									>
										<MenubarItem asChild>
											<Link href="/" className="navbar-item">
												<House />
												<span>Home</span>
											</Link>
										</MenubarItem>
										<MenubarSeparator />
										<MenubarItem asChild>
											<Link href="/dashboard/profile" className="navbar-item">
												<UserIcon />
												<span>My Profile</span>
											</Link>
										</MenubarItem>
										<MenubarSeparator />
										<MenubarItem asChild>
											<Link
												href="/dashboard/notifications"
												className="navbar-item"
											>
												<Bell />
												<span>Notifications</span>
												<UnreadNotification />
											</Link>
										</MenubarItem>
										<MenubarSeparator />
										<MenubarItem asChild>
											<Link href="/dashboard/posts" className="navbar-item">
												<LayoutList />
												<span>My Posts</span>
											</Link>
										</MenubarItem>
										<MenubarSeparator />
										<MenubarItem asChild>
											<Link
												href="/dashboard/saved-posts"
												className="navbar-item"
											>
												<ListChecks />
												<span>Saved Posts</span>
											</Link>
										</MenubarItem>
										<MenubarSeparator />
										<MenubarItem asChild>
											<LogoutButton />
										</MenubarItem>
									</MenubarContent>
								</MenubarMenu>
							</Menubar>
						</>
					) : (
						<ChooseLoginButton />
					)}
				</div>
			)}
		</nav>
	);
};

export default Navbar;
