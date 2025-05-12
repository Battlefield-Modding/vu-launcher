import './App.css'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { AppSidebar } from './components/AppSidebar'

import { Toaster } from 'sonner'
import { useEffect, useState } from 'react'
import { firstTimeSetup, getUserPreferences, saveUserPreferences } from './api'

import { invoke } from '@tauri-apps/api/core'
import { Onboarding } from './components/Onboarding/Onboarding'

import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
export function AppLayout() {
  const [onboarding, setOnboarding] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const update = await check()
        if (update) {
          console.log(
            `found update ${update.version} from ${update.date} with notes ${update.body}`,
          )
          let downloaded = 0
          let contentLength = 0
          // alternatively we could also call update.download() and update.install() separately
          await update.downloadAndInstall((event) => {
            switch (event.event) {
              case 'Started':
                // @ts-ignore
                contentLength = event.data.contentLength
                console.log(`started downloading ${event.data.contentLength} bytes`)
                break
              case 'Progress':
                downloaded += event.data.chunkLength
                console.log(`downloaded ${downloaded} from ${contentLength}`)
                break
              case 'Finished':
                console.log('download finished')
                break
            }
          })

          console.log('update installed')
          await relaunch()
        }
      } catch (err) {
        console.log(`Failed to check for updates due to error:\n[${err}]`)
      }
    }

    async function handleOnboarding() {
      await firstTimeSetup()
      const preferences = await getUserPreferences()
      if (!preferences.is_onboarded) {
        setOnboarding(() => true)
      }
    }
    handleOnboarding()

    async function navigateToPreviousRoute() {
      const preferences = await getUserPreferences()

      if (preferences.last_visted_route !== '') {
        navigate(preferences.last_visted_route)
      }
    }

    navigateToPreviousRoute()

    invoke('show_window')

    checkForUpdates()
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
