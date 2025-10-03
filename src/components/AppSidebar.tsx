import { Book, Home, Loader, Server, Settings } from 'lucide-react'
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
import { QueryKey, routes, STALE } from '@/config/config'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { getAllLoadoutNames } from '@/api'

// Menu items.
const items = [
  {
    title: 'home',
    url: routes.HOME,
    icon: Home,
  },
  {
    title: 'loadouts',
    url: routes.SERVERS,
    icon: Server,
  },
  {
    title: 'mods',
    url: routes.MODS,
    icon: Book,
  },
  {
    title: 'settings',
    url: routes.SETTINGS,
    icon: Settings,
  },
]

export function AppSidebar() {
  const { pathname } = useLocation()
  const { t } = useTranslation()

  const { data } = useQuery({
    queryKey: [QueryKey.GetAllLoadoutNames],
    queryFn: getAllLoadoutNames,
    staleTime: STALE.never,
  })

  if (!data) {
    return <Loader />
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className="p-0">
          <div className="flex flex-col items-center justify-center p-4">
            <img src={vuIconRed} className="w-16 lg:w-24" />
            <SidebarGroupLabel className="flex w-full justify-center">
              {t('sidebar.header')}
            </SidebarGroupLabel>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    asChild
                    className={clsx(
                      'flex h-[max(3vw,3rem)] rounded-none',
                      pathname === item.url ? 'font-bold' : 'font-normal',
                    )}
                  >
                    <Link
                      to={
                        data.length > 0 && item.url === routes.SERVERS
                          ? `${routes.SERVERS}/${data[0]}`
                          : item.url
                      }
                      className="flex"
                      viewTransition
                    >
                      <div>
                        <item.icon />
                      </div>
                      <p className="flex-1 text-base">{t(`sidebar.routes.${item.title}`)}</p>
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
