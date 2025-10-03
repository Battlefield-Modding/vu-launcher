import './App.css'

import useBlockContextMenu from './hooks/block-context-menu'

import { Outlet, useLocation, useNavigate } from 'react-router'
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { AppSidebar } from './components/AppSidebar'

import { Toaster } from 'sonner'
import { useEffect } from 'react'
import { firstTimeSetup, getUserPreferences, saveUserPreferences } from './api'

import { invoke } from '@tauri-apps/api/core'

import { Updating } from './components/Updating'
import { routes } from './config/config'
export function AppLayout() {
  useBlockContextMenu()

  const { pathname } = useLocation()
  const navigate = useNavigate()

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
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger className="fixed bottom-0 left-0 z-10 h-[max(2vw,2rem)] w-[max(2vw,2rem)]" />
        <main className="min-h-[100vh] w-full bg-black">
          <Outlet />
        </main>
        <Toaster />
        <Updating />
      </SidebarProvider>
    </>
  )
}
