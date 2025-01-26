import Alert from '@/components/Alert';
import { AppSidebar } from '@/components/AppSidebar';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import ModalProgress from '@/components/ModalProgress';
import QueryProvider from '@/components/QueryProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Theme } from '@radix-ui/themes';
import { SessionProvider } from 'next-auth/react';

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<Theme>
			<SessionProvider>
				<QueryProvider>
					<SidebarProvider>
						<div className="flex h-screen w-full">
							<AppSidebar /> {/* Sidebar */}
							<main className="flex-1 overflow-auto w-full relative">
								<div className="sticky flex items-center top-0 w-full h-[60px] z-40 bg-white">
									<DashboardBreadcrumb />
								</div>
								<section className="px-[46px] w-full relative">
									{children}
								</section>
							</main>
						</div>
						<Alert />
						<ModalProgress />
					</SidebarProvider>
				</QueryProvider>
			</SessionProvider>
		</Theme>
	);
}
