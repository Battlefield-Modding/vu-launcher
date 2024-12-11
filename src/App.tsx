import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { AppSidebar } from './components/app-sidebar'
import Home from './routes/Home'

function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger className="fixed bottom-0 left-0 z-10 bg-blue-300 p-6" />
      <main>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </main>
    </SidebarProvider>
  )
}

export default App
