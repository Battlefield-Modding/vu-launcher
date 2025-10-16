import './App.css'

import useBlockContextMenu from './hooks/block-context-menu'
import { useLocation, useNavigate } from 'react-router'
import { Menu, menuOrder } from './components/Menu'
import PageTransition from './components/PageTransition'
import { Toaster } from 'sonner'
import { useEffect, useState, useRef } from 'react'
import { firstTimeSetup, getUserPreferences, saveUserPreferences } from './api'
import { invoke } from '@tauri-apps/api/core'
import { Updating } from './components/Updating'
import { routes } from './config/config'
import Home from './routes/Home/Home'
import { Servers } from './routes/Servers/Servers'
import Mods from './routes/Mods/Mods'
import Settings from './routes/Settings/Settings'
import { Onboarding } from './routes/Onboarding/Onboarding'
import { getVersion } from '@tauri-apps/api/app'

export function AppLayout() {
  useBlockContextMenu()

  const [appVersion, setAppVersion] = useState<string>('')

  const location = useLocation()
  const navigate = useNavigate()

  const [prevPath, setPrevPath] = useState(location.pathname)
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const prevPathRef = useRef(location.pathname)

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const version = await getVersion()
        setAppVersion(version)
      } catch (error) {
        console.error('Failed to fetch app version:', error)
      }
    }

    fetchVersion()
  }, [])

  useEffect(() => {
    async function handleOnboarding() {
      await firstTimeSetup()
      const preferences = await getUserPreferences()
      if (!preferences.is_onboarded) {
        navigate(routes.ONBOARDING, { state: { skipAnimation: true } })
      }
    }
    handleOnboarding()

    async function navigateToPreviousRoute() {
      const preferences = await getUserPreferences()
      if (preferences.last_visted_route !== '' && preferences.is_onboarded) {
        navigate(preferences.last_visted_route, { state: { skipAnimation: true } })
      }
    }
    navigateToPreviousRoute()
    invoke('show_window')
  }, [])

  useEffect(() => {
    const prevIndex = menuOrder.indexOf(prevPathRef.current)
    const currIndex = menuOrder.indexOf(location.pathname)
    setDirection(currIndex > prevIndex ? 'up' : 'down')
    prevPathRef.current = location.pathname

    async function storeLatestRoute() {
      const preferences = await getUserPreferences()
      preferences.last_visted_route = location.pathname
      await saveUserPreferences(preferences)
    }
    storeLatestRoute()
  }, [location.pathname])

  const normalizePath = (path: string) => {
    const parts = path.split('/')
    const base = parts[1] || ''
    return '/' + base || path
  }

  const renderRoute = (pathname: string) => {
    const normalized = normalizePath(pathname)
    switch (normalized) {
      case routes.HOME:
        return <Home />
      case routes.SERVERS:
        return <Servers />
      case routes.MODS:
        return <Mods />
      case routes.SETTINGS:
        return <Settings />
      case routes.ONBOARDING:
        return <Onboarding />
      default:
        console.warn('No matching route for normalized path:', normalized)
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Menu />
      <div
        className="fixed inset-0 z-0 origin-center animate-[breathe-zoom_120s_ease-in-out_infinite_forwards] bg-[url(assets/home_background.png)] bg-cover bg-center bg-no-repeat"
        style={{ willChange: 'transform, opacity' }}
      />
      <div className="fixed bottom-2 right-2 text-sm text-white opacity-70 drop-shadow-md">
        {appVersion && `v${appVersion}`}
      </div>
      <main className="relative flex-1 overflow-y-auto">
        <PageTransition>{renderRoute}</PageTransition>
      </main>
      <Toaster />
      <Updating />
    </div>
  )
}
