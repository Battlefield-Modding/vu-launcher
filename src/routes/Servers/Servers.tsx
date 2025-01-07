import { Loader } from 'lucide-react'
import ServerSheet from './components/server-sheet'
import LoadoutBrowser from './components/LoadoutBrowser'
import { QueryKey, STALE } from '@/config/config'
import { serverKeyExists } from '@/api'
import { useQuery } from '@tanstack/react-query'
import FileUpload from './components/FileUpload'
import serverKeyImage from '@/assets/server-key-info.png'
import ServerGuidForm from './components/ServerGuidForm'
import { useState } from 'react'

export default function Servers() {
  const [isGuidSaved, setIsGuidSaved] = useState(false)

  function handleGuid(val: boolean) {
    setIsGuidSaved(() => val)
  }

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.ServerKeyExists],
    queryFn: serverKeyExists,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>Checking for Server Key</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive pl-2 pr-2 text-xl leading-9">
        <h1>ERROR: No Server Key</h1>
      </div>
    )
  }

  if (!data) {
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
            <FileUpload />
          </div>
        )}
      </div>
    )
  }

  // if no server loadouts found
  return (
    <div className="m-auto flex min-h-[100vh] flex-col justify-center">
      <div className="m-auto mb-0 mt-8 rounded-md bg-primary p-8">
        <ServerSheet />
      </div>
      <div className="m-auto mt-0">
        <LoadoutBrowser />
      </div>
    </div>
  )
}
