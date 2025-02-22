'use client';

import { Button } from '@radix-ui/themes';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import React from 'react';
import Swal from 'sweetalert2';

export const LogoutButton = () => {
	const logoutHandler = () => {
		Swal.fire({
			title: 'Logout?',
			text: 'Are you sure you want to log out?',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Logout',
			cancelButtonText: 'Cancel',
		}).then((result) => {
			if (result.isConfirmed) {
				signOut({
					redirectTo: '/',
				})
					.then((response) => {
						console.info('response logout :', response);
					})
					.catch((error) => {
						console.info('error logout :', error);
					});
			}
		});
	};

	return (
		<Button
			onClick={logoutHandler}
			className="flex items-center text-white font-[700] w-full py-1 bg-red-500 text-sm"
		>
			<LogOut className="w-5 h-5" />
			<span>Logout</span>
		</Button>
	);
};
