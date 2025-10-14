import './App.css'

import useBlockContextMenu from './hooks/block-context-menu'

import { Outlet, useLocation, useNavigate } from 'react-router'
import { Menu } from './components/Menu'

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
  }, [pathname])

  return (
    <div className="flex h-screen bg-black text-white">
      <Menu />

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      <Toaster />
      <Updating />
    </div>
  )
}
