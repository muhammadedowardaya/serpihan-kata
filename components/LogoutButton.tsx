'use client';

import { userAtom } from '@/jotai';
import { Button } from '@radix-ui/themes';
import { useSetAtom } from 'jotai';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import React, { useState } from 'react';
import { MyAlert } from './MyAlert';

export const LogoutButton = () => {
	const setUser = useSetAtom(userAtom);
	const [open, setOpen] = useState(false);

	const logoutHandler = () => {
		signOut({
			redirectTo: '/',
		})
			.then(() => {
				setUser(null);
			})
			.catch((error) => {
				console.info('error logout :', error);
			});
	};

	return (
		<div>
			<Button
				onClick={() => setOpen(true)}
				className="flex items-center text-white font-[700] w-full py-1 bg-red-500 text-sm"
			>
				<LogOut className="w-5 h-5" />
				<span>Logout</span>
			</Button>
			<MyAlert
				title="Logout"
				description="Are you sure you want to log out?"
				open={open}
				textConfirmButton="Logout"
				onConfirm={logoutHandler}
				type="warning"
			/>
		</div>
	);
};
