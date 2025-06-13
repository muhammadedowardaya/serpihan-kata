import { LogoutButton } from '@/components/LogoutButton';
import { UnreadNotification } from '@/components/UnreadNotifications';
import {
	Bell,
	House,
	LayoutDashboard,
	LayoutList,
	ListChecks,
	UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const NavbarDashboardListMenu = ({ className }: { className?: string }) => {
	const pathname = usePathname();

	return (
		<ul className={className}>
			<li>
				<Link href="/" className="navbar-item">
					<House />
					<span>Home</span>
				</Link>
			</li>
			<li>
				<Link
					href="/dashboard"
					className={`navbar-item ${
						pathname === '/dashboard'
							? 'bg-primary text-primary-foreground'
							: 'hover:bg-primary hover:!text-primary-foreground'
					}`}
				>
					<LayoutDashboard />
					<span>Dashboard</span>
				</Link>
			</li>
			<li>
				<Link
					href="/dashboard/profile"
					className={`navbar-item ${
						pathname === '/dashboard/profile'
							? 'bg-primary !text-primary-foreground'
							: ''
					}`}
				>
					<UserIcon />
					<span>Profile</span>
				</Link>
			</li>
			<li>
				<Link
					href="/dashboard/notifications"
					className={`navbar-item ${
						pathname === '/dashboard/notifications'
							? 'bg-primary !text-primary-foreground'
							: ''
					}`}
				>
					<Bell />
					<span>Notifications</span>
					<UnreadNotification />
				</Link>
			</li>
			<li>
				<Link
					href="/dashboard/posts"
					className={`navbar-item ${
						pathname.startsWith('/dashboard/posts')
							? 'bg-primary !text-primary-foreground'
							: ''
					}`}
				>
					<LayoutList />
					<span>My Posts</span>
				</Link>
			</li>
			<li>
				<Link
					href="/dashboard/saved-posts"
					className={`navbar-item ${
						pathname.startsWith('/dashboard/saved-posts')
							? 'bg-primary !text-primary-foreground'
							: ''
					}`}
				>
					<ListChecks />
					<span>Saved Posts</span>
				</Link>
			</li>
			<li>
				<LogoutButton />
			</li>
		</ul>
	);
};

export default NavbarDashboardListMenu;
