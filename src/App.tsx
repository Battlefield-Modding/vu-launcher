import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { AppSidebar } from './components/AppSidebar'
import Home from './routes/Home/Home'
import Settings from './routes/Settings/Settings'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getUserPreferences } from './api'
import { routes } from './config/config'
import Mods from './routes/Mods/Mods'
import { Servers } from './routes/Servers/Servers'
import { invoke } from '@tauri-apps/api/core'
import { Onboarding } from './components/Onboarding/Onboarding'

const queryClient = new QueryClient()

function App() {
  const [onboarding, setOnboarding] = useState(false)

  useEffect(() => {
    async function handleOnboarding() {
      const preferences = await getUserPreferences()
      if (!preferences.is_onboarded) {
        setOnboarding(() => true)
      }
    }
    handleOnboarding()
    invoke('show_window')
  }, [])

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
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
              <Routes>
                <Route path={routes.HOME} element={<Home />} />
                <Route path={routes.SERVERS} element={<Servers />} />
                <Route path={routes.MODS} element={<Mods />} />
                <Route path={routes.SETTINGS} element={<Settings />} />
              </Routes>
            </main>
            <Toaster />
          </SidebarProvider>
        )}
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default App
