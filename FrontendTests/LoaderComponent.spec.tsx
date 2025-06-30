import { expect, describe, it, afterAll, vi, beforeAll } from 'vitest'
import { clearMocks } from '@tauri-apps/api/mocks'
import { render, screen } from '@testing-library/react'
import { LoaderComponent } from '../src/components/LoaderComponent'

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
})

afterAll(() => {
  clearMocks()
})

describe('Loader Renders', () => {
  it('should render a Loader', () => {
    // arrange
    const i18nKey = 'loaderComponent.title'
    const extraText = '...'
    const expectedString = i18nKey + extraText
    // act
    render(<LoaderComponent />)
    // assert
    expect(screen.getByText(expectedString)).toBeDefined()
  })
})
