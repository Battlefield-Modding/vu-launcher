import { expect, describe, it, afterAll, vi, beforeAll } from 'vitest'
import { clearMocks } from '@tauri-apps/api/mocks'
import { render, screen } from '@testing-library/react'
import { AppSidebar } from '../src/components/AppSidebar'
import { routes } from '@/config/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoutesStub, Outlet } from 'react-router'
import { SidebarProvider } from '../src/components/ui/sidebar'

const mockedLoadouts = ['LoadoutOne', 'LoadoutTwo', 'LoadoutThree']

const sidebarRoutes = [
  {
    title: 'home',
    url: routes.HOME,
  },
  {
    title: 'loadouts',
    url:
      mockedLoadouts && mockedLoadouts.length > 0
        ? `${routes.SERVERS}/${mockedLoadouts[0]}`
        : routes.SERVERS,
  },
  {
    title: 'mods',
    url: routes.MODS,
  },
  {
    title: 'settings',
    url: routes.SETTINGS,
  },
]

const queryClient = new QueryClient()
function Wrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <Outlet />
      </SidebarProvider>
    </QueryClientProvider>
  )
}

afterAll(() => {
  clearMocks()
})

beforeAll(() => {
  vi.mock('react-i18next', () => ({
    // this mock makes sure any components using the translate hook can use it without a warning being shown
    useTranslation: () => {
      return {
        t: (i18nKey: string) => i18nKey,
        i18n: {
          changeLanguage: () => new Promise(() => {}),
        },
      }
    },
    initReactI18next: {
      type: '3rdParty',
      init: () => {},
    },
  }))

  vi.mock('@/api', () => ({
    getAllLoadoutNames: () => Promise.resolve(mockedLoadouts),
  }))
})

describe('Sidebar Renders', () => {
  it('should render text for each sidebar entry', async () => {
    // arrange
    const i18nKeyPrefix = 'sidebar.routes.'

    const Stub = createRoutesStub([
      {
        path: '/',
        Component: Wrapper,
        children: [
          {
            path: '/',
            Component: AppSidebar,
          },
        ],
      },
    ])

    // act
    render(<Stub />)

    // assert
    expect(await screen.findByText(i18nKeyPrefix + sidebarRoutes[0].title)).toBeDefined()
    expect(await screen.findByText(i18nKeyPrefix + sidebarRoutes[1].title)).toBeDefined()
    expect(await screen.findByText(i18nKeyPrefix + sidebarRoutes[2].title)).toBeDefined()
    expect(await screen.findByText(i18nKeyPrefix + sidebarRoutes[3].title)).toBeDefined()
  })

  it('each text parent element should be a clickable link with correct HREF', async () => {
    // arrange
    const i18nKeyPrefix = 'sidebar.routes.'
    const localhostURL = 'http://localhost:3000'

    const Stub = createRoutesStub([
      {
        path: '/',
        Component: Wrapper,
        children: [
          {
            path: '/',
            Component: AppSidebar,
          },
        ],
      },
    ])

    // act
    render(<Stub />)

    // assert
    const itemOne = (await screen.findByText(i18nKeyPrefix + sidebarRoutes[0].title)).parentElement
    const itemTwo = (await screen.findByText(i18nKeyPrefix + sidebarRoutes[1].title)).parentElement
    const itemThree = (await screen.findByText(i18nKeyPrefix + sidebarRoutes[2].title))
      .parentElement
    const itemFour = (await screen.findByText(i18nKeyPrefix + sidebarRoutes[3].title)).parentElement

    expect(itemOne.href).toEqual(localhostURL + sidebarRoutes[0].url)
    expect(itemTwo.href).toEqual(localhostURL + sidebarRoutes[1].url)
    expect(itemThree.href).toEqual(localhostURL + sidebarRoutes[2].url)
    expect(itemFour.href).toEqual(localhostURL + sidebarRoutes[3].url)
  })
})
