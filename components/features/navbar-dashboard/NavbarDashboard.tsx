'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import ChooseLoginButton from '../../ChooseLoginButton';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '../../ui/skeleton';
import { User } from 'next-auth';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/jotai';
import { usePathname, useRouter } from 'next/navigation';
import { ActionButtonMyPosts } from '../../ActionButtonMyPosts';
import NavbarDashboardMenuToggle from './components/NavbarDashboardMenuToggle';
import NavbarDashboardListMenu from './components/NavbarDashboardListMenu';

const NavbarDashboard = ({ className }: { className?: string }) => {
	const [isOpen, setIsOpen] = useState(false);

	const user = useAtomValue(userAtom);

	const router = useRouter();
	const pathname = usePathname();

	const getUser = useQuery<User>({
		queryKey: ['user'],
		queryFn: async () => {
			const response = await axios.get('/api/user');
			return response.data.user;
		},
		enabled: !!user,
		initialData: user as User,
	});

	useEffect(() => {
		if (user && !user?.username) {
			setTimeout(() => router.push('/dashboard/profile'), 100);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	const [isClient, setIsClient] = useState(false);

	const navigationRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setIsClient(true);

		const handleClickOutside = (event: MouseEvent) => {
			if (
				navigationRef.current &&
				!navigationRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
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
				<div
					ref={navigationRef}
					role="navigation"
					className="relative flex shrink-0 items-center gap-5"
				>
					{user ? (
						<>
							{!pathname.startsWith('/dashboard/posts') && (
								<div className="hidden xs:block">
									<ActionButtonMyPosts />
								</div>
							)}

							<NavbarDashboardMenuToggle
								onClick={() => setIsOpen(!isOpen)}
								user={user}
								showUnreadCount={!isOpen}
							/>

							{isOpen && (
								<NavbarDashboardListMenu
									className="
									fixed top-14 right-[20px] z-50 p-2 shadow bg-slate-200		
								"
								/>
							)}
						</>
					) : (
						<ChooseLoginButton />
					)}
				</div>
			)}
		</nav>
	);
};

export default NavbarDashboard;
