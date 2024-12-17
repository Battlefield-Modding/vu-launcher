import { Home, List, Server, Settings } from 'lucide-react'
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
import { Link } from 'react-router'
import { routes } from '@/config/config'

// Menu items.
const items = [
  {
    title: 'Home',
    url: routes.HOME,
    icon: Home,
  },
  {
    title: 'Servers',
    url: routes.SERVERS,
    icon: Server,
  },
  {
    title: 'Mods',
    url: routes.MODS,
    icon: List,
  },
  {
    title: 'Settings',
    url: routes.SETTINGS,
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          {/* <div className="ml-1 flex w-24 justify-start rounded-md border border-white bg-sidebar-foreground p-2">
            <img src={reactIcon} alt="" className="" />
          </div>
          <SidebarGroupLabel>Unofficial VU Launcher</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    variant={'outline'}
                    asChild
                    className="flex min-h-[10vh] gap-[1vw] text-[2vw]"
                  >
                    <Link to={item.url}>
                      <div>
                        <item.icon className="h-auto w-[2vw]" />
                      </div>
                      <p>{item.title}</p>
                    </Link>
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
