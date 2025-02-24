'use client';

import React from 'react';

import {
	Grid3X3,
	Home,
	User as UserIcon,
	LayoutDashboard,
	LayoutList,
	Bell,
	LogOut,
	ListChecks,
} from 'lucide-react';

import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { User } from 'next-auth';

// Menu items.
const adminItems = [
	{
		title: 'Home',
		url: '/',
		icon: Home,
	},
	{
		title: 'Dashboard',
		url: '/',
		icon: LayoutDashboard,
	},
	{
		title: 'My Posts',
		url: '/dashboard/posts',
		icon: LayoutList,
	},
	{
		title: 'Categories',
		url: '/dashboard/categories',
		icon: Grid3X3,
	},
	{
		title: 'Logout',
		url: '#',
		icon: LogOut,
	},
];

const userItems = [
	{
		title: 'Home',
		url: '/',
		icon: Home,
	},
	{
		title: 'Dashboard',
		url: '/dashboard',
		icon: LayoutDashboard,
	},
	{
		title: 'Profile',
		url: '/dashboard/profile',
		icon: UserIcon,
	},
	{
		title: 'My Posts',
		url: '/dashboard/posts',
		icon: LayoutList,
	},
	{
		title: 'Saved Posts',
		url: '/dashboard/saved-posts',
		icon: ListChecks,
	},
	{
		title: 'Notifications',
		url: '/dashboard/notifications',
		icon: Bell,
	},
	{
		title: 'Logout',
		url: '/dashboard/logout',
		icon: LogOut,
	},
];

export const SidebarMenuItemList = ({
	session,
}: {
	session: { user: User };
}) => {
	const pathname = usePathname();

	useQuery({
		queryKey: ['profile'],
		queryFn: async () => {
			const response = await axios.get('/api/user');
			// await update({
			// 	user: {
			// 		username: response.data.user.username,
			// 	},
			// });
			return response.data.user;
		},
		enabled: !!session?.user,
	});

	return (
		<div className="flex flex-col gap-1">
			{session?.user?.role === 'ADMIN' &&
				adminItems.map((item) => (
					<SidebarMenuItem key={item.title}>
						<SidebarMenuButton asChild>
							<a
								href={item.url}
								className={`${
									pathname === item.url ||
									pathname.includes(`${item.url.split('/')[2]}/`)
										? 'bg-primary text-primary-foreground'
										: ''
								} flex items-center space-x-2 p-2 rounded`}
							>
								<item.icon />
								<span>{item.title}</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			{session?.user?.role === 'USER' &&
				userItems.map((item) => (
					<SidebarMenuItem key={item.title}>
						<SidebarMenuButton asChild>
							<a
								href={item.url}
								className={`${
									pathname === item.url ||
									pathname.includes(`${item.url.split('/')[2]}/`)
										? 'bg-primary text-primary-foreground'
										: ''
								} flex items-center space-x-2 p-2 rounded hover:bg-primary hover:text-primary-foreground`}
							>
								<item.icon />
								<span>{item.title}</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
		</div>
	);
};
