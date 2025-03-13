import type { Metadata } from 'next';
import './globals.css';
import 'react-tooltip/dist/react-tooltip.css';
import RootLayoutClient from './RootLayoutClient';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { User } from 'next-auth';

export const metadata: Metadata = {
	title: 'Serpihan Kata',
	description: 'Serpihan Kata Blog',
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth();
	const userId = session?.user.id;

	let user: User | null = null;

	if (userId) {
		user = (await prisma.user.findUnique({
			where: {
				id: userId,
			},
		})) as unknown as User;
	}

	return (
		<html lang="en">
			<head>
				<link rel="manifest" href="manifest.json" />
				<meta name="apple-mobile-web-app-title" content="Skata" />
				<meta name="theme-color" content="#000000" />
			</head>
			<body>
				<RootLayoutClient userSession={user as unknown as User}>
					{children}
				</RootLayoutClient>
			</body>
		</html>
	);
}
