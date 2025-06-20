import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppLayout } from './AppLayout'

// import i18n (needs to be bundled ;))
import './i18n/config'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { routes } from './config/config'
import Home from './routes/Home/Home'
import { Servers } from './routes/Servers/Servers'
import Mods from './routes/Mods/Mods'
import Settings from './routes/Settings/Settings'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoadoutContainer } from './routes/Servers/components/Loadouts/LoadoutContainer'
import { Loadout } from './routes/Servers/components/Loadouts/Loadout'
import { Onboarding } from './routes/Onboarding/Onboarding'

const router = createBrowserRouter([
  {
    path: routes.HOME,
    element: <AppLayout />,
    children: [
      { path: routes.ONBOARDING, element: <Onboarding /> },
      { path: routes.HOME, element: <Home /> },
      {
        path: routes.SERVERS,
        element: <Servers />,
        children: [
          {
            path: routes.SERVERS,
            element: <LoadoutContainer />,
            children: [{ path: `${routes.SERVERS}/:loadoutName`, element: <Loadout /> }],
          },
        ],
      },
      { path: routes.MODS, element: <Mods /> },
      { path: routes.SETTINGS, element: <Settings /> },
    ],
  },
])

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
