import { useEffect, useRef, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Download, Loader } from 'lucide-react'
import { activateBf3LSX, finishOnboarding, vuDevIsInstalled, vuProdIsInstalled } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { QueryKey, STALE } from '@/config/config'
import { InstallVU } from '@/routes/Home/components/InstallVU/InstallVU'
import { open } from '@tauri-apps/plugin-dialog'
import { InstallVuDevDialog } from './InstallVuDevDialog'
import { toast } from 'sonner'
import PlayerCredentialsSheet from '@/routes/Home/components/PlayerCredentialsSheet/PlayerCredentialsSheet'

export function Onboarding({ setOnboarding }: { setOnboarding: (t: () => boolean) => void }) {
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

      return responseObject
    },
    staleTime: STALE.never,
  })

  useEffect(() => {
    if (data) {
      if (progress == 0) {
        if (data.vuDevelopment && data.vuProduction) {
          setProgress(() => 50)
        }
      }
    }
  }, [data, progress])

  function increaseProgress() {
    if (progress < 100) {
      setProgress((prev) => prev + 50)
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

  function handleActivateLSX() {
    toast('Activating BF3 (LSX)')
    activateBf3LSX()
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

      {progress == 100 && (
        <div className="m-auto flex max-h-[500px] max-w-[500px] flex-col justify-between gap-8 rounded-md bg-black p-8">
          <>
            <h1 className="text-xl">Add a VU account</h1>
            <PlayerCredentialsSheet />
            <Button
              variant={'outline'}
              onClick={async (e) => {
                e.preventDefault()
                const status = await finishOnboarding()
                setOnboarding(() => status)
              }}
            >
              Skip / Complete Onboarding
            </Button>
          </>
        </div>
      )}

      {progress >= 50 && progress < 100 && (
        <div className="m-auto flex max-h-[500px] max-w-[500px] flex-col justify-between gap-8 rounded-md bg-black p-8">
          <div className="flex flex-col items-center gap-8">
            <div className="flex flex-col items-center">
              <h1 className="text-xl">Activate BF3 with EA App / Origin</h1>
              <ul className="m-4 ml-8 list-disc">
                <li>Please launch your EA App / Origin and sign in.</li>
                <li>Once signed-in click on the Activate BF3 button: </li>
                <li>After it succeeds click continue.</li>
              </ul>
              <Button
                variant={'constructive'}
                onClick={(e) => {
                  e.preventDefault()
                  handleActivateLSX()
                }}
              >
                Activate BF3
              </Button>
            </div>
            <Button
              variant={'outline'}
              onClick={(e) => {
                e.preventDefault()
                increaseProgress()
              }}
            >
              Skip / Continue
            </Button>
          </div>
        </div>
      )}

      {!vuProduction && <InstallVU />}

      {vuProduction && !vuDevelopment && progress < 50 && (
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
            <Button
              variant={'outline'}
              onClick={(e) => {
                e.preventDefault()
                increaseProgress()
              }}
            >
              Skip / Continue
            </Button>
            <InstallVuDevDialog dialogRef={dialogRef} vuDevInstallPath={vuDevInstallPath} />
          </>
        </div>
      )}

      <div className="flex w-full items-center justify-center gap-4">
        <Progress className="w-96 bg-secondary" value={progress} />
      </div>
    </form>
  )
}
