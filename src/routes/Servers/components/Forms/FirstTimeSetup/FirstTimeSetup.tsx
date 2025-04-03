import { useState } from 'react'
import serverKeyImage from '@/assets/server-key-info.png'
import { ServerGuidForm } from './ServerGuidForm'
import { ServerKeyUpload } from './ServerKeyUpload'
import { useTranslation } from 'react-i18next'

export function FirstTimeSetup() {
  const [isGuidSaved, setIsGuidSaved] = useState(false)
  const { t } = useTranslation()

  function handleGuid(val: boolean) {
    setIsGuidSaved(() => val)
  }

  return (
    <div className="flex min-h-[100vh] flex-col bg-black">
      <div className="m-auto flex max-w-screen-lg flex-col gap-8 p-8">
        <div>
          <h1 className="text-2xl font-bold">1.) {t('servers.firstTime.step1')}:</h1>
          <a
            href="https://veniceunleashed.net/keys"
            target="_blank"
            className="ml-9 text-blue-500 underline hover:bg-blue-100 hover:opacity-80"
          >
            https://veniceunleashed.net/keys
            {!isGuidSaved && (
              <img src={serverKeyImage} alt="" className="ml-9 w-1/2 border-2 border-cyan-300" />
            )}
          </a>
        </div>

        <div>
          <h1 className="text-2xl font-bold">2.) {t('servers.firstTime.step2')}:</h1>
          <ServerGuidForm handleGuid={handleGuid} />
        </div>

        <div>
          <h1 className="text-2xl font-bold">3.) {t('servers.firstTime.step3')}:</h1>
        </div>
      </div>

      {isGuidSaved && (
        <div className="flex min-h-[30vh] flex-1 flex-col">
          <ServerKeyUpload />
        </div>
      )}
    </div>
  )
}
