'use client';

import { userAtom } from '@/jotai';
import { useSetAtom } from 'jotai';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import React, { useState } from 'react';
import { MyAlert } from './MyAlert';
import { Button } from './ui/button';

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
		<>
			<Button
				onClick={() => setOpen(true)}
				variant="destructive"
				className="flex justify-start items-center w-full py-1 text-sm"
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
				textCancelButton="Cancel"
				onCancel={() => setOpen(false)}
				type="warning"
			/>
		</>
	);
};
