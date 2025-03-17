import { useRef, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Download, Loader } from 'lucide-react'
import { vuDevIsInstalled, vuProdIsInstalled } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { QueryKey, STALE } from '@/config/config'
import { InstallVUProd } from '@/routes/Home/components/InstallVU/InstallVUProd'
import { open } from '@tauri-apps/plugin-dialog'
import { InstallVuDevDialog } from './InstallVuDevDialog'

export function Onboarding() {
  const [progress, setProgress] = useState(0)
  const [vuDevInstallPath, setVuDevInstallPath] = useState('')
  const dialogRef = useRef(null)

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.IsVuInstalled],
    queryFn: async (): Promise<{ vuProduction: boolean; vuDevelopment: boolean }> => {
      const responseObject = {
        vuProduction: await vuProdIsInstalled(),
        vuDevelopment: await vuDevIsInstalled(),
      }

      console.log(
        `Response object: ${responseObject.vuProduction}, ${responseObject.vuDevelopment}`,
      )

      return responseObject
    },
    staleTime: STALE.never,
  })

  function increaseProgress() {
    if (progress < 100) {
      setProgress((prev) => prev + 25)
    }
  }

  function decreaseProgress() {
    if (progress > 0) {
      setProgress((prev) => prev - 25)
    }
  }

  async function handleDownloadVU() {
    const installPath = await open({
      multiple: false,
      directory: true,
    })
    if (installPath) {
      setVuDevInstallPath(() => installPath)
      if (dialogRef.current) {
        const element = dialogRef.current as HTMLDialogElement
        element.click()
      }
    }
  }

  if (isPending) {
    return (
      <div>
        <h1>Home Route LOADING</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div>
        <h1>Home Route Error</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  const { vuProduction, vuDevelopment } = data

  return (
    <form className="m-auto flex max-w-screen-md flex-col items-center gap-8 p-8">
      <h1 className="text-4xl">First Time Setup</h1>

      {vuProduction && !vuDevelopment && (
        <div className="m-auto flex max-h-[500px] max-w-[500px] flex-col justify-between gap-8 rounded-md bg-black p-8">
          <>
            <h1 className="text-xl">Found VU Prod. Install VU Dev also?</h1>
            <Button
              variant={'secondary'}
              onClick={(e) => {
                e.preventDefault()
                handleDownloadVU()
              }}
            >
              <Download size={'10px'} />
              <p>Choose Install Location</p>
            </Button>
            <Button variant={'outline'}>No thanks</Button>
            <InstallVuDevDialog dialogRef={dialogRef} vuDevInstallPath={vuDevInstallPath} />
          </>
        </div>
      )}

      {!vuProduction && <InstallVUProd />}

      <div className="flex w-full items-center justify-center gap-4">
        <Button
          onClick={(e) => {
            e.preventDefault()
            decreaseProgress()
          }}
          variant={'secondary'}
        >
          <ArrowLeft />
        </Button>

        <Progress className="w-96 bg-secondary" value={progress} />

        <Button
          onClick={(e) => {
            e.preventDefault()
            increaseProgress()
          }}
          variant={'secondary'}
        >
          <ArrowRight />
        </Button>
      </div>
    </form>
  )
}
