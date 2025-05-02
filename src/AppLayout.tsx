import './App.css'
import { Outlet } from 'react-router'
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { AppSidebar } from './components/AppSidebar'

import { Toaster } from 'sonner'
import { useEffect, useState } from 'react'
import { firstTimeSetup, getUserPreferences } from './api'

import { invoke } from '@tauri-apps/api/core'
import { Onboarding } from './components/Onboarding/Onboarding'

function AppLayout() {
  const [onboarding, setOnboarding] = useState(false)

  useEffect(() => {
    async function handleOnboarding() {
      await firstTimeSetup()
      const preferences = await getUserPreferences()
      if (!preferences.is_onboarded) {
        setOnboarding(() => true)
      }
    }
    handleOnboarding()
    invoke('show_window')
  }, [])

  return (
    <>
      {onboarding ? (
        <>
          <Onboarding setOnboarding={setOnboarding} />
          <Toaster />
        </>
      ) : (
        <SidebarProvider>
          <AppSidebar />
          <SidebarTrigger className="fixed bottom-0 left-0 z-10 h-[max(2vw,2rem)] w-[max(2vw,2rem)]" />
          <main className="min-h-[100vh] w-full bg-black">
            <Outlet />
          </main>
          <Toaster />
        </SidebarProvider>
      )}
    </>
  )
}

export default AppLayout
