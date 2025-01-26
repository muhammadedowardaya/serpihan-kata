import { auth } from '@/auth';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
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

const Navbar = async ({ className }: { className?: string }) => {
	const session = await auth();

	let avatarFallbackLetter = '';
	const fullNameArray = session?.user?.name?.split(' ');

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

	return (
		<nav
			className={`flex justify-between items-center px-5 bg-white border-b ${className}`}
		>
			<Link href="/">
				<Image src="/logo.png" alt="logo" width={30} height={30} />
			</Link>
			<div className="flex items-center gap-5 text-black">
				{session && session?.user ? (
					<>
						<Link href="/dashboard/posts/create">
							<span>Create</span>
						</Link>

						<Menubar className="border-none shadow-none">
							<MenubarMenu>
								<MenubarTrigger
									asChild
									className="p-0 focus:bg-transparent data-[state=open]:bg-transparent"
								>
									<div className="flex gap-4 items-center">
										{session.user.name && session?.user?.name?.length > 23 ? (
											<span className="text-sm">
												@{session?.user?.username}
											</span>
										) : (
											<span className="text-sm">{session?.user?.name}</span>
										)}
										<div className="relative w-10 h-10 border-none">
											<Avatar className="w-full h-full">
												<AvatarImage
													src={session?.user?.image as string}
													alt={session?.user?.name as string}
												/>
												<AvatarFallback>{avatarFallbackLetter}</AvatarFallback>
											</Avatar>
										</div>
									</div>
								</MenubarTrigger>
								<MenubarContent
									className="w-48 mt-2 p-2 bg-white border rounded-lg shadow-lg"
									align="end"
								>
									<MenubarItem asChild>
										<Link href="/dashboard/profile" className='text-slate-700 font-[500]'>My Profile</Link>
									</MenubarItem>
									<MenubarSeparator />
									<MenubarItem asChild>
										<Link href="/dashboard/notifications" className='text-slate-700 font-[500]'>Notifications</Link>
									</MenubarItem>
									<MenubarSeparator />
									<MenubarItem asChild>
										<Link href="/dashboard/posts" className='text-slate-700 font-[500]'>My Posts</Link>
									</MenubarItem>
									<MenubarSeparator />
									<MenubarItem asChild>
										<Link href="/dashboard/saved-posts" className='text-slate-700 font-[500]'>Saved Posts</Link>
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
		</nav>
	);
};

export default Navbar;
