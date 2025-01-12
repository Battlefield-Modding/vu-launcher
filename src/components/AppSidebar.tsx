import { Book, Home, Server, Settings } from 'lucide-react'
import vuIcon from '@/assets/VUIcon.svg'

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
    title: 'Servers',
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
        <SidebarGroup>
          <div className="ml-1 flex w-24 justify-start rounded-md border border-white bg-sidebar-foreground p-2">
            <img src={vuIcon} alt="" className="" />
          </div>
          <SidebarGroupLabel>Unofficial VU Launcher</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    variant={'outline'}
                    isActive={pathname === item.url}
                    asChild
                    className={clsx(
                      'flex min-h-[10vh] gap-[1vw] text-[2vw]',
                      pathname === item.url
                        ? 'border border-primary/30 opacity-70'
                        : 'border border-white',
                    )}
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
