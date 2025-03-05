import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarTrigger,
} from '@/components/ui/sidebar';

import { auth } from '@/auth';
import { SidebarMenuItemList } from './SidebarMenuItemList';
import { User } from 'next-auth';

export async function AppSidebar() {
	const session = await auth();

	return (
		<Sidebar className="w-64 z-50 bg-background text-background-foreground">
			<SidebarTrigger className="absolute w-[40px] h-[60px] z-50 -right-10 top-0 bg-primary text-primary-foreground rounded-none" />
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="my-2 block text-center">
						GO - BLOG | Dashboard
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItemList
								session={session as unknown as { user: User }}
							/>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
