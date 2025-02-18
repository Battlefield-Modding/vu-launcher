import { useState } from 'react'
import serverKeyImage from '@/assets/server-key-info.png'
import { ServerGuidForm } from './ServerGuidForm'
import { ServerKeyUpload } from './ServerKeyUpload'

export function FirstTimeSetup() {
  const [isGuidSaved, setIsGuidSaved] = useState(false)

  function handleGuid(val: boolean) {
    setIsGuidSaved(() => val)
  }

  return (
    <div className="flex min-h-[100vh] flex-col">
      <div className="bg-destructive pl-2 pr-2 text-center text-xl font-bold leading-9">
        <h1 className="p-4">Server Key Not Found</h1>
      </div>
      <div className="flex flex-col gap-8 bg-destructive-foreground p-8">
        <div>
          <h1 className="text-2xl font-bold">1.) Download server.key from:</h1>
          <a
            href="https://veniceunleashed.net/keys"
            target="_blank"
            className="ml-9 text-blue-800 underline hover:bg-blue-100 hover:opacity-80"
          >
            https://veniceunleashed.net/keys
            {!isGuidSaved && <img src={serverKeyImage} alt="" className="" />}
          </a>
        </div>

        <div>
          <h1 className="text-2xl font-bold">2.) Copy Server GUID from above:</h1>
          <ServerGuidForm handleGuid={handleGuid} />
        </div>

        <div>
          <h1 className="text-2xl font-bold">3.) Drag and Drop your key into this window:</h1>
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
