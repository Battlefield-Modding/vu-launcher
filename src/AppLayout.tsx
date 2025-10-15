import './App.css'

import useBlockContextMenu from './hooks/block-context-menu'
import { Outlet, useLocation, useNavigate } from 'react-router'
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

export function AppLayout() {
  useBlockContextMenu()
  const location = useLocation()
  const navigate = useNavigate()

  const [prevPath, setPrevPath] = useState(location.pathname)
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const prevPathRef = useRef(location.pathname)

  useEffect(() => {
    async function handleOnboarding() {
      await firstTimeSetup()
      const preferences = await getUserPreferences()
      if (!preferences.is_onboarded) {
        navigate(routes.ONBOARDING)
      }
    }
    handleOnboarding()

    async function navigateToPreviousRoute() {
      const preferences = await getUserPreferences()
      if (preferences.last_visted_route !== '' && preferences.is_onboarded) {
        navigate(preferences.last_visted_route)
      }
    }

    navigateToPreviousRoute()
    invoke('show_window')
  }, [])

  // Track last route to determine slide direction
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

  // Helper to render the route component manually
  const renderRoute = (pathname: string) => {
    switch (pathname) {
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
        return null
    }
  }

  return (
    <div className="flex h-screen bg-black text-white">
      <Menu />

      <main className="relative flex-1 overflow-hidden">
        <PageTransition direction={direction}>{renderRoute}</PageTransition>
      </main>

      <Toaster />
      <Updating />
    </div>
  )
}
