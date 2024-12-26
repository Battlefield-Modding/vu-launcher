import { fetchVUData } from '@/api'
import { Button } from '@/components/ui/button'
import { rust_fns } from '@/config/config'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { Download, Play, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { emit, listen } from '@tauri-apps/api/event'
import { Progress } from '@/components/ui/progress'
import { useQueryClient } from '@tanstack/react-query'

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

function InstallVU() {
  const queryClient = useQueryClient()
  const [gameDownloadUpdateInstalling, setGameDownloadUpdateInstalling] = useState(false)
  const [gameDownloadUpdateProgress, setGameDownloadUpdateProgress] = useState(0)
  const [gameDownloadUpdateSpeed, setGameDownloadUpdateSpeed] = useState(0)
  const [gameDownloadUpdateExtracting, setGameDownloadUpdateExtracting] = useState(false)
  const [
    gameDownloadUpdateExtractingFilesRemaining,
    setGameDownloadUpdateExtractingFilesRemaining,
  ] = useState(0)

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

    listen('download-extracting', (event: TauriEmitEvent) => {
      setGameDownloadUpdateExtracting(true)
      console.log('Files Extracting.')
    })

    listen('extracting-files', (event: TauriEmitEvent) => {
      setGameDownloadUpdateExtractingFilesRemaining(event.payload)
      console.log('Files remaining:', event.payload)
    })

    listen('install-complete', (event) => {
      setGameDownloadUpdateInstalling(false)
      setGameDownloadUpdateExtracting(false)
      console.log('VU Installation Completed')
      toast('VU Installation Completed')
      queryClient.invalidateQueries({ queryKey: ['vu-is-installed'], refetchType: 'all' })
      // getGameInstallationPath();
      // checkConfigExists();
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

        lastTime = currentTime
        lastDownloaded = downloadedChunkLength
      }
    })
  }, [])

  return (
    <div className="m-auto flex max-h-[500px] max-w-[500px] flex-col justify-between gap-8 rounded-md bg-primary p-8">
      {!gameDownloadUpdateInstalling && (
        <>
          <div className="flex flex-1 justify-center gap-4 align-middle text-3xl leading-9 text-white">
            <h1>VU not found!</h1>
          </div>
          <div className="flex flex-1 justify-center gap-4 align-middle text-xl leading-9 text-white">
            <h1 className="flex-1">VU already installed?</h1>
            <Button
              variant={'secondary'}
              onClick={async () => {
                const dir = await open({
                  multiple: false,
                  directory: true,
                })
                if (!dir) {
                  return
                }
                // await invoke('set_wallpaper_directory', { dir })
              }}
            >
              <Search /> Find VU
            </Button>
          </div>

          <div className="flex flex-1 justify-center gap-4 align-middle text-xl leading-9">
            <h1 className="flex-1 text-white">VU not installed?</h1>
            <Button
              variant={'secondary'}
              className=""
              onClick={async () => {
                const installPath = await open({
                  multiple: false,
                  directory: true,
                })
                if (installPath) {
                  const confirmed = await confirm(
                    'Are you sure? Venice Unleashed Launcher will be installed to: ' +
                      installPath +
                      '\\VeniceUnleashed',
                  )

                  if (confirmed) {
                    setGameDownloadUpdateInstalling(() => true)
                    await invoke(rust_fns.download_game, { installPath })
                  }
                }
              }}
            >
              <Download size={'10px'} />
              <p>Download VU</p>
            </Button>
          </div>
        </>
      )}

      {gameDownloadUpdateInstalling && (
        <>
          <div className="flex flex-1 justify-center gap-4 align-middle text-3xl leading-9 text-white">
            <h1>Downloading VU</h1>
          </div>

          <div className="flex w-full flex-col rounded-md text-white">
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
                Extracting Files ({gameDownloadUpdateExtractingFilesRemaining} left)
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default InstallVU
