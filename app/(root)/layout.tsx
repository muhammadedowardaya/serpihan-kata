import React from 'react';
import Navbar from '@/components/Navbar';
import { Container, Theme } from '@radix-ui/themes';
import { SessionProvider } from 'next-auth/react';
import QueryProvider from '@/components/QueryProvider';

import '@/styles/root-layout.scss';
import { ScrollArea } from '@/components/ui/scroll-area';

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<QueryProvider>
			<SessionProvider>
				<main className="relative bg-background text-background-foreground root-layout">
					<div className="root-navbar sticky top-0 z-50 w-full padding-content">
						<Navbar className="h-full bg-transparent" />
					</div>
					<ScrollArea className="root-content">
						<Container className="relative">{children}</Container>
					</ScrollArea>
				</main>
			</SessionProvider>
		</QueryProvider>
	);
}
