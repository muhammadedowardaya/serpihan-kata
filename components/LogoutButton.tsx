'use client';

import { Button } from '@radix-ui/themes';
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
				});
			}
		});
	};

	return (
		<Button onClick={logoutHandler} className="text-white font-[700] w-full py-1 bg-red-500 text-sm">
			<span>Logout</span>
		</Button>
	);
};
