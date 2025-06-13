import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UnreadNotification } from '@/components/UnreadNotifications';
import { User } from 'next-auth';
import React, { useEffect, useState } from 'react';

const NavbarDashboardMenuToggle = ({
	user,
	showUnreadCount = false,
	onClick,
}: {
	user: User;
	showUnreadCount?: boolean;
	onClick: () => void;
}) => {
	const [xs, setXs] = useState(false);

	const avatarFallbackLetter = user.name ? user.name.slice(0, 2) : 'AB';

	useEffect(() => {
		setXs(window.matchMedia('(min-width: 460px)').matches);
	}, []);

	const handleClick = () => {
		if (onClick) {
			onClick();
		}
	};

	return (
		<button role="menu trigger" onClick={handleClick}>
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
				<div className="relative w-10 h-10 ">
					<Avatar className="w-full h-full rounded-full">
						<AvatarImage
							src={user?.image as string}
							alt={user?.name as string}
							className="object-cover bg-secondary border border-primary"
						/>
						<AvatarFallback className="bg-secondary border border-primary">
							{avatarFallbackLetter.toUpperCase()}
						</AvatarFallback>
					</Avatar>
					{showUnreadCount && (
						<UnreadNotification className={`absolute -top-1 -right-2`} />
					)}
				</div>
			</div>
		</button>
	);
};

export default NavbarDashboardMenuToggle;
