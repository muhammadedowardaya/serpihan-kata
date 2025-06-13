import { AppSidebar } from '@/components/AppSidebar';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import ModalProgress from '@/components/ModalProgress';
import NavbarDashboard from '@/components/features/navbar-dashboard/NavbarDashboard';
import QueryProvider from '@/components/QueryProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SessionProvider } from 'next-auth/react';

import '@/styles/layout-dashboard.scss';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export default async function LayoutDashboard({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();
	const userId = session?.user?.id;

	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
	});

	return (
		<SessionProvider>
			<QueryProvider>
				<SidebarProvider>
					<div className="flex h-screen w-full">
						<AppSidebar />
						<main className="layout-dashboard">
							<div className="navbar-dashboard padding-content">
								<NavbarDashboard className="w-full" />
							</div>
							<div className="breadcrumb-dashboard md:pl-16 md:pr-12">
								<DashboardBreadcrumb />
								<div className="gap-4 items-center hidden md:flex">
									<span className="text-sm md:text-base hidden xxs:inline-block font-normal">
										{user?.name}
									</span>
									<div className="relative w-10 h-10 border-none">
										<Avatar className="w-full h-full bg-primary text-primary-foreground border-2 border-white">
											<AvatarImage
												src={user?.image as string}
												alt={user?.name as string}
												className="object-cover"
											/>
											<AvatarFallback>
												{user?.username?.slice(0, 2).toUpperCase() || 'ID'}
											</AvatarFallback>
										</Avatar>
									</div>
								</div>
							</div>
							<ScrollArea className="content-dashboard padding-content w-full">
								<div className="relative w-full">{children}</div>
							</ScrollArea>
						</main>
					</div>
					<ModalProgress />
				</SidebarProvider>
			</QueryProvider>
		</SessionProvider>
	);
}
