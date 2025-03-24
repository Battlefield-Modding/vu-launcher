import { Book, Home, Server, Settings } from 'lucide-react'
import vuIconRed from '@/assets/vu-icon-red.svg'

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
import { Link, useLocation } from 'react-router'
import { routes } from '@/config/config'
import clsx from 'clsx'

// Menu items.
const items = [
  {
    title: 'Home',
    url: routes.HOME,
    icon: Home,
  },
  {
    title: 'Loadouts',
    url: routes.SERVERS,
    icon: Server,
  },
  {
    title: 'Mods',
    url: routes.MODS,
    icon: Book,
  },
  {
    title: 'Settings',
    url: routes.SETTINGS,
    icon: Settings,
  },
]

export function AppSidebar() {
  const { pathname } = useLocation()
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className="p-0">
          <div className="flex flex-col items-center justify-center p-4">
            <img src={vuIconRed} className="w-16 lg:w-24" />
            <SidebarGroupLabel className="flex w-full justify-center">
              Unofficial VU Launcher
            </SidebarGroupLabel>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="">
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    asChild
                    className={clsx(
                      'flex h-[max(3vw,3rem)] rounded-none',
                      pathname === item.url ? 'opacity-70' : 'opacity-100',
                    )}
                  >
                    <Link to={item.url} className="flex">
                      <div>
                        <item.icon />
                      </div>
                      <p className="flex-1 text-[max(1vw,1.25rem)]">{item.title}</p>
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
