import type { Metadata } from 'next';
// import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import 'react-tooltip/dist/react-tooltip.css';
import RootLayoutClient from './RootLayoutClient';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { User } from 'next-auth';

// const geistSans = Geist({
// 	variable: '--font-geist-sans',
// 	subsets: ['latin'],
// });

// const geistMono = Geist_Mono({
// 	variable: '--font-geist-mono',
// 	subsets: ['latin'],
// });

export const metadata: Metadata = {
	title: 'Serpihan Kata',
	description: 'Serpihan Kata Blog',
	icons: {
		icon: '/favicon.ico',
	},
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
			<body
				// className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				className="background text"
			>
				<RootLayoutClient userSession={user as unknown as User}>
					{children}
				</RootLayoutClient>
			</body>
		</html>
	);
}
