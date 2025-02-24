'use client';

import React from 'react';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { userAtom } from '@/jotai';

const LogoutPage = () => {
	const router = useRouter();

	const setUser = useSetAtom(userAtom);

	const handleLogout = () => {
		signOut().then(() => setUser(null));
	};

	return (
		<Card className="max-w-md mx-auto mt-10 p-4 shadow-lg">
			{/* Card Header */}
			<CardHeader className="text-center">
				<CardTitle className="text-xl font-semibold text-gray-800">
					Logout?
				</CardTitle>
				<CardDescription className="text-gray-600">
					Are you sure you want to log out?
				</CardDescription>
			</CardHeader>

			{/* Card Content */}
			<CardContent className="flex justify-center gap-4 mt-4">
				<Button
					className="bg-red-600 hover:bg-red-500 text-white px-4 py-2"
					onClick={handleLogout}
				>
					Logout
				</Button>
				<Button
					className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2"
					onClick={() => router.back()}
				>
					Cancel
				</Button>
			</CardContent>
		</Card>
	);
};

export default LogoutPage;
