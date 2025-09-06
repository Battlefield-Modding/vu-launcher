import { getLauncherInstallPath } from '@/api'
import { Button } from '@/components/ui/button'
import { QueryKey } from '@/config/config'
import { open } from '@tauri-apps/plugin-dialog'
import { Download } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { listen } from '@tauri-apps/api/event'
import { Progress } from '@/components/ui/progress'
import { useQueryClient } from '@tanstack/react-query'
import { InstallVuProdDialog } from '@/routes/Home/components/InstallVU/InstallVuProdDialog'
import { useTranslation } from 'react-i18next'

interface TauriEmitEvent {
  payload: number
}

interface LauncherUpdateStatusEvent {
  payload: LauncherUpdateStatusEventPayload
}

interface LauncherUpdateProgressEvent {
  payload: LauncherUpdateProgressEventPayload
}

interface LauncherUpdateProgressEventPayload {
  chunkLength: number
  contentLength: number
}

interface LauncherUpdateStatusEventPayload {
  status: string
  error: string
}

export function InstallVUFromSettings() {
  const queryClient = useQueryClient()
  const [gameDownloadUpdateInstalling, setGameDownloadUpdateInstalling] = useState(false)
  const [gameDownloadUpdateProgress, setGameDownloadUpdateProgress] = useState(0)
  const [gameDownloadUpdateSpeed, setGameDownloadUpdateSpeed] = useState(0)
  const [gameDownloadUpdateExtracting, setGameDownloadUpdateExtracting] = useState(false)
  const [
    gameDownloadUpdateExtractingFilesRemaining,
    setGameDownloadUpdateExtractingFilesRemaining,
  ] = useState(0)

  const [vuProdInstallPath, setVuProdInstallPath] = useState('')
  const dialogRef = useRef(null)
  const { t } = useTranslation()

  useEffect(() => {
    listen('download-progress', (event: TauriEmitEvent) => {
      setGameDownloadUpdateProgress(event.payload)
      console.log('Download progress: ' + event.payload)
    })

    listen('download-speed', (event: TauriEmitEvent) => {
      // set var and update it to MB/s and floor to 2 digits
      let value = Math.floor((event.payload / 1024) * 10) / 10
      setGameDownloadUpdateSpeed(value)
      console.log('Download speed: ' + value)
    })

    listen('download-extracting', () => {
      setGameDownloadUpdateExtracting(true)
      console.log('Files Extracting.')
    })

    listen('extracting-files', (event: TauriEmitEvent) => {
      setGameDownloadUpdateExtractingFilesRemaining(event.payload)
      console.log('Files remaining:', event.payload)
    })

    listen('install-complete', () => {
      setGameDownloadUpdateInstalling(false)
      setGameDownloadUpdateExtracting(false)
      console.log('VU Installation Completed')
      toast(t('onboarding.install.prod.toast.installComplete'))
      queryClient.invalidateQueries({ queryKey: [QueryKey.IsVuInstalled], refetchType: 'all' })
    })

    listen('tauri://update-status', (event: LauncherUpdateStatusEvent) => {
      console.log('New status: ', event)
      if (event.payload.status == 'PENDING') {
        setGameDownloadUpdateInstalling(true)
      }
    })

    let downloadedChunkLength = 0
    let lastTime = Date.now()
    let lastDownloaded = 0

    listen('tauri://update-download-progress', (event: LauncherUpdateProgressEvent) => {
      downloadedChunkLength += event.payload.chunkLength
      let progress = (downloadedChunkLength / event.payload.contentLength) * 100

      let currentTime = Date.now()
      let elapsedTime = (currentTime - lastTime) / 1000

      if (elapsedTime >= 1) {
        let recentDownloaded = downloadedChunkLength - lastDownloaded
        let downloadSpeed = recentDownloaded / 1024 / 1024 / elapsedTime

        setGameDownloadUpdateProgress(progress)
        setGameDownloadUpdateSpeed(parseFloat(downloadSpeed.toFixed(2)))
        console.log(gameDownloadUpdateSpeed)

        lastTime = currentTime
        lastDownloaded = downloadedChunkLength
      }
    })
  }, [])

  async function handleDownloadVU() {
    const defaultPath = await getLauncherInstallPath()
    const installPath = await open({
      multiple: false,
      directory: true,
      defaultPath,
    })
    if (installPath) {
      setVuProdInstallPath(() => installPath)
      console.log(installPath)
      if (dialogRef.current) {
        const element = dialogRef.current as HTMLDialogElement
        element.click()
      }
    }
  }

  // async function handlesetVUInstallLocationRegistry() {
  //   const defaultPath = await getLauncherInstallPath()
  //   const dir = await open({
  //     multiple: false,
  //     directory: true,
  //     defaultPath,
  //   })
  //   if (!dir) {
  //     return
  //   }
  //   const status = await setVUInstallLocationRegistry(dir)
  //   if (status) {
  //     queryClient.invalidateQueries({
  //       queryKey: [QueryKey.IsVuInstalled],
  //       refetchType: 'all',
  //     })
  //     toast(`${t('onboarding.install.prod.toast.chooseInstallDir.success')}: ${dir}`)
  //   } else {
  //     toast(t('onboarding.install.prod.toast.chooseInstallDir.failure'))
  //   }
  // }

  return (
    <div>
      {!gameDownloadUpdateInstalling && (
        <>
          {/* <div className="flex flex-1 justify-center gap-4 align-middle text-xl leading-9">
            <h1 className="flex-1">{t('onboarding.install.prod.locate.header')}</h1>
            <Button
              variant={'secondary'}
              onClick={(e) => {
                e.preventDefault()
                handlesetVUInstallLocationRegistry()
              }}
            >
              <Search /> {t('onboarding.install.prod.locate.button')}
            </Button>
          </div> */}

          <div>
            <Button
              variant={'secondary'}
              onClick={(e) => {
                e.preventDefault()
                handleDownloadVU()
              }}
            >
              <Download size={'10px'} />
              <p>{t('settings.installVu.again')}</p>
            </Button>
          </div>

          <InstallVuProdDialog
            vuProdInstallPath={vuProdInstallPath}
            setGameDownloadUpdateInstalling={setGameDownloadUpdateInstalling}
            gameDownloadUpdateInstalling={gameDownloadUpdateInstalling}
            gameDownloadUpdateExtracting={gameDownloadUpdateExtracting}
            dialogRef={dialogRef}
          />
        </>
      )}

      {gameDownloadUpdateInstalling && (
        <>
          <div className="flex flex-1 justify-center gap-4 align-middle text-3xl leading-9 text-primary">
            <h1>{t('onboarding.install.prod.progress.header')}</h1>
          </div>

          <div className="flex w-full flex-col rounded-md text-primary">
            {!gameDownloadUpdateExtracting ? (
              <div className="mb-2 flex h-6">
                <Progress value={gameDownloadUpdateProgress} className="h-full w-full flex-1" />
              </div>
            ) : (
              <div className="mb-2 flex h-6">
                <Progress value={gameDownloadUpdateProgress} className="h-full w-full flex-1" />
              </div>
            )}
            {!gameDownloadUpdateExtracting ? (
              <div className="flex justify-end">
                {/* <p className="noselect mr-2 text-right text-sm">{gameDownloadUpdateSpeed} MB/s</p> */}

                <p className="noselect mr-2 text-right text-sm">
                  {gameDownloadUpdateProgress.toFixed(2)} %
                </p>
              </div>
            ) : (
              <p className="noselect mr-2 text-right text-sm font-light">
                {t('onboarding.install.prod.progress.extractingPrefix')} (
                {gameDownloadUpdateExtractingFilesRemaining}{' '}
                {t('onboarding.install.prod.progress.extractingSuffix')})
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
