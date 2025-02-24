import { AppSidebar } from '@/components/AppSidebar';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import ModalProgress from '@/components/ModalProgress';
import NavbarDashboard from '@/components/NavbarDashboard';
import QueryProvider from '@/components/QueryProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SessionProvider } from 'next-auth/react';

import '@/styles/layout-dashboard.scss';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function LayoutDashboard({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SessionProvider>
			<QueryProvider>
				<SidebarProvider>
					<div className="flex h-screen w-full">
						<AppSidebar />
						<main className="layout-dashboard">
							<div className="navbar-dashboard">
								<NavbarDashboard />
							</div>
							<div className="breadcrumb-dashboard">
								<DashboardBreadcrumb />
							</div>
							<ScrollArea className="content-dashboard">{children}</ScrollArea>
						</main>
					</div>
					<ModalProgress />
				</SidebarProvider>
			</QueryProvider>
		</SessionProvider>
	);
}
