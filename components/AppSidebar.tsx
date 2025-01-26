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
import { User } from '@/types';

export async function AppSidebar() {
	const session = await auth();

	return (
		<Sidebar className="w-64 z-50">
			<SidebarTrigger className="absolute w-[40px] h-[60px] z-50 -right-10 top-0 bg-white" />
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>MEDOW BLOG | Dashboard</SidebarGroupLabel>
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
