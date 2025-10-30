import './App.css'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { AppSidebar } from './components/AppSidebar'

import { AnimatePresence, motion } from 'motion/react'

import { Toaster } from 'sonner'
import { useEffect, useState } from 'react'
import { firstTimeSetup, getUserPreferences, saveUserPreferences } from './api'

import { invoke } from '@tauri-apps/api/core'

import { Updating } from './components/Updating'
import { routes } from './config/config'
import { Menu } from './components/Menu'

import { getVersion } from '@tauri-apps/api/app'

import { AnimatedOutlet } from './components/AnimatedOutlet'
import clsx from 'clsx'
import useBlockContextMenu from './hooks/block-context-menu'
export function AppLayout() {
  useBlockContextMenu()
  const [appVersion, setAppVersion] = useState<string>('')
  const { pathname } = useLocation()
  const navigate = useNavigate()

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

  useEffect(() => {
    async function storeLatestRoute() {
      const preferences = await getUserPreferences()
      preferences.last_visted_route = pathname

      await saveUserPreferences(preferences)
    }
    storeLatestRoute()
    // update the latest pathname in preferences
  }, [pathname])

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
      <div
        className={clsx(
          'relative flex-1 overflow-y-auto',
          pathname != routes.HOME ? 'bg-black bg-opacity-60' : '',
        )}
      >
        <AnimatePresence>
          <AnimatedOutlet />
        </AnimatePresence>
      </div>
      <Toaster />
      <Updating />
    </div>
  )
}
