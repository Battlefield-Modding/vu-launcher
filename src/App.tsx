import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { AppSidebar } from './components/app-sidebar'
import Home from './routes/Home'
import LauncherSettings from './routes/LauncherSettings'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarTrigger className="fixed bottom-0 left-0 z-10 bg-sidebar-border p-6" />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/launchersettings" element={<LauncherSettings />} />
            </Routes>
          </main>
          <Toaster />
        </SidebarProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default App
