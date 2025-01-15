import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { AppSidebar } from './components/AppSidebar'
import Home from './routes/Home/Home'
import Settings from './routes/Settings/Settings'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { firstTimeSetup } from './api'
import { routes } from './config/config'
import Servers from './routes/Servers/Servers'
import Mods from './routes/Mods/Mods'

const queryClient = new QueryClient()

function App() {
  useEffect(() => {
    firstTimeSetup()
  }, [])

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarTrigger className="fixed bottom-0 left-0 z-10 bg-sidebar-border p-6" />
          <main className="min-h-[100vh] w-full bg-sidebar-foreground">
            <Routes>
              <Route path={routes.HOME} element={<Home />} />
              <Route path={routes.SERVERS} element={<Servers />} />
              <Route path={routes.MODS} element={<Mods />} />
              <Route path={routes.SETTINGS} element={<Settings />} />
            </Routes>
          </main>
          <Toaster />
        </SidebarProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default App
