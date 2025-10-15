import { Book, Home, Loader, Server, Settings } from 'lucide-react'
import vuIconRed from '@/assets/vu-icon-red.svg'
import { Link, useLocation } from 'react-router'
import { QueryKey, routes, STALE } from '@/config/config'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { getAllLoadoutNames } from '@/api'
import { useEffect, useState, useRef } from 'react'

const topItems = [
  { title: 'home', url: routes.HOME, icon: Home },
  { title: 'loadouts', url: routes.SERVERS, icon: Server },
  { title: 'mods', url: routes.MODS, icon: Book },
]

const bottomItems = [{ title: 'settings', url: routes.SETTINGS, icon: Settings }]

export const menuOrder = [...topItems, ...bottomItems].map((item) => item.url)

export function Menu() {
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const [bgVisible, setBgVisible] = useState(false)
  const [iconsVisible, setIconsVisible] = useState(false)
  const isNavigating = useRef(false)

  const { data } = useQuery({
    queryKey: [QueryKey.GetAllLoadoutNames],
    queryFn: getAllLoadoutNames,
    staleTime: STALE.never,
  })

  useEffect(() => {
    const timeoutBg = setTimeout(() => setBgVisible(true), 50)
    const timeoutIcons = setTimeout(() => setIconsVisible(true), 350)
    return () => {
      clearTimeout(timeoutBg)
      clearTimeout(timeoutIcons)
    }
  }, [])

  const normalizePath = (path: string) => {
    const parts = path.split('/')
    const base = parts[1] || ''
    return '/' + base || path
  }

  const handleNavigation = (url: string) => {
    const normalizedUrl = normalizePath(url)
    const normalizedPathname = normalizePath(pathname)
    if (normalizedUrl === normalizedPathname || isNavigating.current) {
      console.log('Navigation ignored:', { url, pathname, isNavigating: isNavigating.current })
      return
    }
    isNavigating.current = true
    setTimeout(() => {
      isNavigating.current = false
    }, 700) // Match animation duration
  }

  if (!data) return <Loader />

  const renderItem = (item: (typeof topItems)[number], index: number) => {
    const isActive = normalizePath(pathname) === normalizePath(item.url)
    const url =
      data.length > 0 && item.url === routes.SERVERS ? `${routes.SERVERS}/${data[0]}` : item.url
    const delay = `${index * 100}ms`

    return (
      <div
        key={item.title}
        className={clsx(
          'group relative flex w-full justify-center transition-opacity transition-transform duration-500 ease-out',
          iconsVisible ? 'translate-x-0 opacity-100' : '-translate-x-16 opacity-0',
        )}
        style={{ transitionDelay: delay }}
      >
        <Link
          to={url}
          onClick={() => handleNavigation(url)}
          className={clsx(
            'flex h-12 w-12 items-center justify-center rounded-lg transition-colors hover:bg-white hover:bg-opacity-35',
            isActive && 'bg-white bg-opacity-25',
          )}
        >
          <item.icon className="h-6 w-6 text-white" />
        </Link>

        <span className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
          {t(`sidebar.routes.${item.title}`)}
        </span>
      </div>
    )
  }

  return (
    <div className="fixed left-0 top-0 z-50 flex h-screen w-16 flex-col items-center py-4">
      <div
        className={clsx(
          'absolute left-0 top-0 h-full w-full border-r-[1px] border-r-neutral-950 shadow-inner backdrop-blur-lg backdrop-brightness-[70%] transition-opacity transition-transform duration-500 ease-in-out',
          bgVisible ? 'translate-x-0 opacity-100' : '-translate-x-16 opacity-0',
        )}
      />

      <img
        src={vuIconRed}
        className={clsx(
          'mb-4 h-12 w-12 transition-opacity transition-transform duration-500 ease-out',
          iconsVisible ? 'translate-x-0 opacity-100' : '-translate-x-16 opacity-0',
        )}
        style={{ transitionDelay: '0ms' }}
      />

      <div className="flex flex-col space-y-4">
        {topItems.map((item, index) => renderItem(item, index))}
      </div>

      <div className="mt-auto flex flex-col space-y-4">
        {bottomItems.map((item, index) => renderItem(item, index + topItems.length))}
      </div>
    </div>
  )
}
