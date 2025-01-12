import { setVUInstallLocation } from '@/api'
import { QueryKey, rust_fns } from '@/config/config'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { listen } from '@tauri-apps/api/event'
import { useQueryClient } from '@tanstack/react-query'
import InstallProgress from './InstallProgress'
import VUNotInstalled from './VUNotInstalled'

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
      queryClient.invalidateQueries({ queryKey: [QueryKey.IsVuInstalled], refetchType: 'all' })
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

  async function handleDownloadVU() {
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
  }

  async function handleSetVUInstallLocation() {
    const dir = await open({
      multiple: false,
      directory: true,
    })
    if (!dir) {
      return
    }
    const status = await setVUInstallLocation(dir)
    if (status) {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.IsVuInstalled],
        refetchType: 'all',
      })
      toast(`Successfully set VU install to: ${dir}`)
    } else {
      toast('Something went wrong setting VU install location.')
    }
  }

  return (
    <div className="m-auto flex max-h-[500px] max-w-[500px] flex-col justify-between gap-8 rounded-md bg-primary p-8">
      {!gameDownloadUpdateInstalling && (
        <VUNotInstalled
          handleDownloadVU={handleDownloadVU}
          handleSetVUInstallLocation={handleSetVUInstallLocation}
        />
      )}

      {gameDownloadUpdateInstalling && (
        <InstallProgress
          gameDownloadUpdateExtracting={gameDownloadUpdateExtracting}
          gameDownloadUpdateExtractingFilesRemaining={gameDownloadUpdateExtractingFilesRemaining}
          gameDownloadUpdateProgress={gameDownloadUpdateProgress}
        />
      )}
    </div>
  )
}

export default InstallVU
