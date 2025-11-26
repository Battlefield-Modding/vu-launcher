import { useState } from 'react'
import serverKeyImage from '@/assets/server-key-info.png'
import { ServerGuidForm } from './ServerGuidForm'
import { ServerKeyUpload } from './ServerKeyUpload'
import { useTranslation } from 'react-i18next'

export function FirstTimeSetup() {
  const [isGuidSaved, setIsGuidSaved] = useState(false)
  const { t } = useTranslation()

  function handleGuid(val: boolean) {
    setIsGuidSaved(val)
  }

  return (
    <div className="relative z-10 flex min-h-screen flex-col text-white">
      <div className="relative flex flex-1 items-center justify-center py-6">
        <div className="flex flex-col">
          <header className="mb-4 flex w-full flex-col items-center justify-center">
            <h1 className="text-3xl font-semibold">{t('servers.firstTime.title')}</h1>
            <p className="mt-1 text-center text-gray-400">{t('servers.firstTime.subtitle')}</p>
          </header>

          <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 md:flex-row">
            <div className="flex flex-1 flex-col gap-6 rounded-md bg-black bg-opacity-90 p-8 drop-shadow-2xl transition-all duration-700 ease-in-out">
              <section className="flex flex-col gap-2">
                <h2 className="text-xl font-medium">1.) {t('servers.firstTime.step1')}</h2>
                <p>
                  <a
                    href="https://veniceunleashed.net/keys"
                    target="_blank"
                    className="text-cyan-400 underline hover:text-cyan-300"
                  >
                    https://veniceunleashed.net/keys
                  </a>
                </p>
              </section>

              <section className="flex flex-col gap-2">
                <h2 className="text-xl font-medium">2.) {t('servers.firstTime.step2')}</h2>
                <ServerGuidForm handleGuid={handleGuid} />
              </section>

              <section className="flex flex-col gap-2">
                <h2 className="text-xl font-medium">3.) {t('servers.firstTime.step3')}</h2>
                <ServerKeyUpload />
              </section>
            </div>

            {!isGuidSaved && (
              <div className="flex flex-1 justify-center overflow-hidden rounded-md md:justify-end">
                <img
                  src={serverKeyImage}
                  alt={t('servers.firstTime.serverKeyImageAlt')}
                  className="h-full w-full scale-[1.0] rounded-md object-cover object-left-bottom"
                />
              </div>
            )}
          </main>
        </div>

        {isGuidSaved && (
          <footer className="relative mx-auto flex w-full max-w-5xl justify-center px-4 pb-6">
            <ServerKeyUpload />
          </footer>
        )}
      </div>
    </div>
  )
}
