import React from 'react';
import Navbar from '@/components/Navbar';
import { Container, Theme } from '@radix-ui/themes';
import { SessionProvider } from 'next-auth/react';
import QueryProvider from '@/components/QueryProvider';

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<QueryProvider>
			<SessionProvider>
				<Theme>
					<Container>
						<main className="relative">
							<div className="sticky top-0 z-50 w-full">
								<Navbar className="h-[60px]" />
							</div>
							{children}
						</main>
					</Container>
				</Theme>
			</SessionProvider>
		</QueryProvider>
	);
}
