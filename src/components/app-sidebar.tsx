import { Home, List, Server, Settings, User } from 'lucide-react'
import reactIcon from '@/assets/VUIcon.svg'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

// Menu items.
const items = [
  {
    title: 'Home',
    url: '/',
    icon: Home,
  },
  {
    title: 'Servers',
    url: '#',
    icon: Server,
  },
  {
    title: 'Mods',
    url: '#',
    icon: List,
  },
  {
    title: 'Launcher Settings',
    url: '/launchersettings',
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="ml-1 flex w-24 justify-start rounded-md border border-white bg-sidebar-foreground p-2">
            <img src={reactIcon} alt="" className="" />
          </div>
          <SidebarGroupLabel>Unofficial VU Launcher</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
