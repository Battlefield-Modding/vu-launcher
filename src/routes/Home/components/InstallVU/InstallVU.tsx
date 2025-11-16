import { getLauncherInstallPath } from '@/api'
import { Button } from '@/components/ui/button'
import {
  Zap,
  Clock,
  FileText,
  AlertCircle,
  RefreshCw,
  WifiOff,
  Server,
  AlertTriangle,
} from 'lucide-react'
import { QueryKey } from '@/config/config'
import { open } from '@tauri-apps/plugin-dialog'
import { Progress } from '@/components/ui/progress'
import { useQueryClient } from '@tanstack/react-query'
import { useRef, useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { invoke } from '@tauri-apps/api/core'
import { listen, emit, type UnlistenFn } from '@tauri-apps/api/event'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { DownloadVUButton } from './DownloadVUButton'

type NumericPayload = {
  payload: number
}

type DownloadCorruptEvent = {
  payload: {
    reason: string
    progress: number
    action: string
    error?: string
  }
}

type SpeedStatus = 'stable' | 'unstable' | 'no-progress' | null

type RustErrorType = 'network' | 'server' | 'corrupt' | 'disk' | 'generic' | 'stalled' | null

export function InstallVU() {
  const queryClient = useQueryClient()
  const [gameDownloadUpdateInstalling, setGameDownloadUpdateInstalling] = useState(false)
  const [gameDownloadUpdateProgress, setGameDownloadUpdateProgress] = useState(0)
  const [gameDownloadUpdateSpeed, setGameDownloadUpdateSpeed] = useState(0) // MB/s
  const [gameDownloadUpdateExtracting, setGameDownloadUpdateExtracting] = useState(false)
  const [
    gameDownloadUpdateExtractingFilesRemaining,
    setGameDownloadUpdateExtractingFilesRemaining,
  ] = useState(0)
  const [totalDownloadSize, setTotalDownloadSize] = useState(0)
  const [downloadedBytes, setDownloadedBytes] = useState(0)
  const [eta, setEta] = useState('Calculating...') // Estimated time remaining (mm:ss)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<RustErrorType>(null)
  const [corruptError, setCorruptError] = useState<string | null>(null)
  const [lastInstallPath, setLastInstallPath] = useState<string>('')
  const [lastProgressAtError, setLastProgressAtError] = useState(0)
  const [_speedHistory, setSpeedHistory] = useState<number[]>([]) // Track last 5 speeds for stability calc
  const [speedStatus, setSpeedStatus] = useState<SpeedStatus>(null)
  const [isStalled, setIsStalled] = useState(false)

  const dialogRef = useRef<any>(null)
  const unlistensRef = useRef<UnlistenFn[]>([])
  const { t } = useTranslation()

  const errorRef = useRef(error)
  const isStalledRef = useRef(isStalled)
  const corruptErrorRef = useRef(corruptError)
  const speedStatusRef = useRef(speedStatus)
  const gameDownloadUpdateProgressRef = useRef(gameDownloadUpdateProgress)

  useEffect(() => {
    errorRef.current = error
  }, [error])

  useEffect(() => {
    isStalledRef.current = isStalled
  }, [isStalled])

  useEffect(() => {
    corruptErrorRef.current = corruptError
  }, [corruptError])

  useEffect(() => {
    speedStatusRef.current = speedStatus
  }, [speedStatus])

  useEffect(() => {
    gameDownloadUpdateProgressRef.current = gameDownloadUpdateProgress
  }, [gameDownloadUpdateProgress])

  const emitInstallStatus = useCallback(async (installing: boolean) => {
    try {
      await emit('vu-install-status', { installing })
      console.log(`VU install status emitted: ${installing ? 'started' : 'ended'}`)
    } catch (err) {
      console.error('Failed to emit VU install status:', err)
    }
  }, [])

  const categorizeRustError = useCallback((errorMsg: string): RustErrorType => {
    const lower = errorMsg.toLowerCase()
    if (
      lower.includes('stalled') ||
      lower.includes('timeout') ||
      lower.includes('disconnected') ||
      lower.includes('decoding')
    ) {
      return 'stalled'
    } else if (lower.includes('http') || lower.includes('request')) {
      return 'network'
    } else if (
      lower.includes('server') ||
      lower.includes('status') ||
      lower.includes('total size') ||
      lower.includes('probe')
    ) {
      return 'server'
    } else if (
      lower.includes('corrupt') ||
      lower.includes('mismatch') ||
      lower.includes('extraction') ||
      lower.includes('zip')
    ) {
      return 'corrupt'
    } else if (
      lower.includes('disk') ||
      lower.includes('file') ||
      lower.includes('metadata') ||
      lower.includes('write')
    ) {
      return 'disk'
    }
    return 'generic'
  }, [])

  const formatBytes = useCallback((bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }, [])

  const calculateEta = useCallback((remainingBytes: number, speedMbps: number) => {
    if (speedMbps <= 0 || remainingBytes <= 0) {
      return 'Calculating...'
    }
    const speedBytesPerSec = speedMbps * 1024 * 1024 // Convert MB/s to bytes/s
    let secondsRemaining = Math.ceil(remainingBytes / speedBytesPerSec)
    secondsRemaining = Math.max(0, secondsRemaining)
    if (secondsRemaining < 5) {
      return 'Finishing...'
    }
    const minutes = Math.floor(secondsRemaining / 60)
    const seconds = secondsRemaining % 60
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
  }, [])

  const calculateSpeedStability = useCallback((currentSpeed: number, history: number[]) => {
    if (history.length < 3) return null
    const recentSpeeds = [currentSpeed, ...history.slice(-2)]
    const avg = recentSpeeds.reduce((a, b) => a + b, 0) / recentSpeeds.length
    const variance =
      recentSpeeds.reduce((sum, speed) => sum + Math.pow(speed - avg, 2), 0) / recentSpeeds.length
    const stdDev = Math.sqrt(variance)
    return stdDev < 0.03 ? 'stable' : 'unstable'
  }, [])

  useEffect(() => {
    if (gameDownloadUpdateInstalling) {
      setTotalDownloadSize(0)
      setDownloadedBytes(0)
      setEta('Calculating...')
      setSpeedHistory([])
      setSpeedStatus(null)
      setIsStalled(false)
      setCorruptError(null)
      setError(null)
      setErrorType(null)
      setGameDownloadUpdateExtracting(false)
    }
  }, [gameDownloadUpdateInstalling])

  useEffect(() => {
    if (!gameDownloadUpdateInstalling || totalDownloadSize <= 0) {
      return
    }

    const downloaded = (gameDownloadUpdateProgress / 100) * totalDownloadSize
    setDownloadedBytes(downloaded)

    if (gameDownloadUpdateSpeed > 0 && !isStalled && !corruptError && !error) {
      const remainingBytes = Math.max(0, totalDownloadSize - downloaded)
      const etaTime = calculateEta(remainingBytes, gameDownloadUpdateSpeed)
      setEta(etaTime)
    } else if (
      gameDownloadUpdateProgress > 10 &&
      speedStatus !== 'stable' &&
      speedStatus !== 'unstable' &&
      !isStalled &&
      !corruptError &&
      !error
    ) {
      setSpeedStatus('no-progress')
      setEta('Stalled')
      console.log('Speed status: No progress (speed=0 despite progress>10%)')
    }

    console.log(
      `Derived: Progress ${gameDownloadUpdateProgress}% of ${formatBytes(totalDownloadSize)} → Downloaded ${formatBytes(downloaded)} | Remaining ${formatBytes(totalDownloadSize - downloaded)} | Speed ${gameDownloadUpdateSpeed.toFixed(2)} MB/s | ETA ${eta}`,
    )
  }, [
    gameDownloadUpdateProgress,
    totalDownloadSize,
    gameDownloadUpdateSpeed,
    gameDownloadUpdateInstalling,
    calculateEta,
    formatBytes,
    speedStatus,
    isStalled,
    corruptError,
    error,
  ])

  useEffect(() => {
    unlistensRef.current = []

    const setupListeners = async () => {
      try {
        unlistensRef.current = await Promise.all([
          listen('download-progress', (event: NumericPayload) => {
            // @ts-ignore
            const progress = Math.min(100, event.payload)
            setGameDownloadUpdateProgress(progress)
            console.log(`Download progress event received: ${progress}%`)

            if (
              (errorRef.current || isStalledRef.current || corruptErrorRef.current) &&
              progress > lastProgressAtError
            ) {
              setError(null)
              setErrorType(null)
              setIsStalled(false)
              setCorruptError(null)
            }
          }),

          listen('download-speed', (event: NumericPayload) => {
            const speedKbps = event.payload
            const speedMbpsRaw = speedKbps / 1024

            const speedMbps = Math.round(speedMbpsRaw * 100) / 100 // E.g., 0.874 → 0.87
            console.log(
              `Download speed event received: ${speedKbps.toFixed(2)} KB/s → ${speedMbps.toFixed(2)} MB/s (raw: ${speedMbpsRaw.toFixed(3)})`,
            )
            setGameDownloadUpdateSpeed(speedMbps)

            if (speedStatusRef.current === 'no-progress' || isStalledRef.current) {
              setSpeedStatus(null)
              setIsStalled(false)
              setError(null)
            }

            if (speedMbps > 0) {
              setCorruptError(null)
            }

            setSpeedHistory((prev) => {
              const newHistory = [...prev, speedMbps].slice(-5) // Keep last 5 speeds
              const stability = calculateSpeedStability(speedMbps, newHistory)
              if (stability) {
                setSpeedStatus(stability)
                console.log(
                  `Speed history: [${newHistory.map((h) => h.toFixed(2)).join(', ')}] | Status: ${stability}`,
                )
              }
              return newHistory
            })
          }),

          listen('download-total-size', (event: NumericPayload) => {
            const total = Math.floor(event.payload) // Ensure integer bytes
            console.log(
              `Download total size event received: ${total} bytes (${formatBytes(total)} )`,
            )
            setTotalDownloadSize(total)
          }),

          listen('download-stalled', () => {
            console.log('Download stalled event received: Connection interrupted')
            setIsStalled(true)
            setSpeedStatus('no-progress')
            setEta('Stalled – Retrying...')

            toast.warning(t('onboarding.install.prod.stalled'), {
              duration: 5000,
            })
          }),

          listen('download-corrupt', (event: DownloadCorruptEvent) => {
            console.log('Download corrupt event received:', event.payload)
            const { reason, action, error: err } = event.payload
            let corruptMsg = `Corrupt download detected (${reason}). File ${action === 'deleted' ? 'deleted' : 'fixed'} for fresh start.`
            if (err) {
              corruptMsg += ` Error: ${err}`
            }
            setCorruptError(corruptMsg)
            setErrorType('corrupt')
            setIsStalled(true)
            setSpeedStatus('no-progress')
            setEta('Restarting Fresh...')

            if (action === 'deleted') {
              setGameDownloadUpdateProgress(0)
              setDownloadedBytes(0)
              setTotalDownloadSize(0)
            }

            const toastMsg =
              reason === 'zip-invalid'
                ? 'Downloaded ZIP is invalid/corrupt. Deleted and restarting fresh...'
                : reason === 'partial-oversize'
                  ? 'Partial file oversized/corrupt. Deleted and starting fresh...'
                  : reason === 'size-mismatch'
                    ? 'Downloaded size incorrect. Deleted corrupt file and restarting...'
                    : reason === 'no-metadata'
                      ? 'Could not read file. Deleted and restarting fresh...'
                      : reason === 'overshoot-truncated'
                        ? 'Download overshot – truncated for integrity. Continuing...'
                        : `Corrupt download (${reason}). Restarting fresh...`
            toast.error(toastMsg, {
              duration: 4000,
            })
          }),

          listen('download-extracting', () => {
            setGameDownloadUpdateExtracting(true)
            setIsStalled(false)
            setCorruptError(null)
            setError(null)
            setErrorType(null)
            console.log('Files Extracting.')
          }),

          listen('extracting-files', (event: NumericPayload) => {
            setGameDownloadUpdateExtractingFilesRemaining(event.payload)
            console.log('Files remaining:', event.payload)
          }),

          listen('install-complete', async () => {
            setGameDownloadUpdateInstalling(false)
            setGameDownloadUpdateExtracting(false)
            setDownloadedBytes(0)
            setTotalDownloadSize(0)
            setGameDownloadUpdateSpeed(0)
            setEta('Complete')
            setError(null)
            setErrorType(null)
            setCorruptError(null)
            setIsStalled(false)
            setSpeedHistory([])
            setSpeedStatus(null)
            toast.success(
              t(
                'onboarding.install.prod.toast.installComplete',
                'VU Production installation completed successfully!',
              ),
            )
            queryClient.invalidateQueries({
              queryKey: [QueryKey.IsVuInstalled],
              refetchType: 'all',
            })
            console.log('Install completed')
            await emitInstallStatus(false)
          }),
        ])
      } catch (err) {
        console.error('Failed to set up event listeners:', err)
      }
    }

    setupListeners()

    return () => {
      unlistensRef.current.forEach((unlisten) => {
        if (typeof unlisten === 'function') {
          unlisten()
        }
      })
      unlistensRef.current = []
    }
  }, [
    queryClient,
    t,
    emitInstallStatus,
    formatBytes,
    calculateSpeedStability,
    categorizeRustError,
    lastProgressAtError,
  ])

  const startDownload = useCallback(
    async (installPath: string) => {
      console.log('Starting download for path:', installPath)
      try {
        setLastProgressAtError(gameDownloadUpdateProgressRef.current)
        setGameDownloadUpdateInstalling(true)
        setError(null)
        setErrorType(null)
        setCorruptError(null)
        setIsStalled(false)
        setGameDownloadUpdateSpeed(0)
        setGameDownloadUpdateProgress(gameDownloadUpdateProgressRef.current)
        setDownloadedBytes((gameDownloadUpdateProgressRef.current / 100) * totalDownloadSize)
        setEta('Calculating...')
        setSpeedHistory([])
        setSpeedStatus(null)
        await emitInstallStatus(true)
        await invoke('download_game', { installPath })
        console.log('Download invoke succeeded')
      } catch (err: any) {
        console.error('Download invoke failed:', err)
        setGameDownloadUpdateInstalling(false)
        await emitInstallStatus(false)
        const errorMsg =
          err.message ||
          t('onboarding.install.prod.error.generic', 'Installation failed. Please try again.')
        const errType = categorizeRustError(errorMsg)
        setErrorType(errType)
        setLastProgressAtError(gameDownloadUpdateProgressRef.current)

        if (errType === 'stalled') {
          setIsStalled(true)
          setError(null)
          toast.warning(
            t(
              'onboarding.install.prod.error.stalled',
              'Download stalled (network issue). Check your connection and resume from partial progress.',
            ),
            { duration: 5000 },
          )
        } else {
          setIsStalled(false)
          setError(errorMsg)

          if (errType === 'network') {
            toast.warning(errorMsg, { duration: 4000, icon: <WifiOff className="h-4 w-4" /> })
          } else if (errType === 'server') {
            toast.warning(errorMsg, { duration: 4000, icon: <Server className="h-4 w-4" /> })
          } else if (errType === 'disk') {
            toast.error(errorMsg, { duration: 5000, icon: <AlertTriangle className="h-4 w-4" /> })
          } else {
            toast.error(errorMsg, { duration: 5000 })
          }

          if (gameDownloadUpdateProgressRef.current > 5 && errType !== 'corrupt') {
            toast.info(
              t(
                'onboarding.install.prod.resumeHint',
                `Partial download at ${gameDownloadUpdateProgressRef.current.toFixed(1)}%. Resume will continue.`,
              ),
              { duration: 3000 },
            )
          }
        }
        setGameDownloadUpdateSpeed(0)
        setEta('Error')
        setSpeedHistory([])
        setSpeedStatus('no-progress')
        setGameDownloadUpdateExtracting(false)
      }
    },
    [t, emitInstallStatus, categorizeRustError, gameDownloadUpdateProgressRef, totalDownloadSize],
  )

  const handleResume = useCallback(async () => {
    if (!lastInstallPath) {
      toast.warning(t('onboarding.install.prod.noPath', 'No previous path. Select a new one.'), {
        duration: 3000,
      })
      return handleDownloadVU()
    }

    toast.info(
      t('onboarding.install.prod.resuming', `Resuming from ${lastProgressAtError.toFixed(1)}%...`),
      { duration: 2000 },
    )

    await startDownload(lastInstallPath)
  }, [lastInstallPath, lastProgressAtError, t, startDownload, handleDownloadVU])

  async function handleDownloadVU() {
    console.log('handleDownloadVU called - opening folder dialog')
    setError(null)
    setErrorType(null)
    setCorruptError(null)
    setGameDownloadUpdateSpeed(0)
    setGameDownloadUpdateProgress(0)
    setDownloadedBytes(0)
    setTotalDownloadSize(0)
    setEta('Calculating...')
    setSpeedHistory([])
    setSpeedStatus(null)
    setIsStalled(false)
    setLastProgressAtError(0)
    const defaultPath = await getLauncherInstallPath()
    const installPath = await open({
      multiple: false,
      directory: true,
      defaultPath,
    })
    if (installPath) {
      console.log('Folder selected:', installPath)
      setLastInstallPath(installPath)
      if (dialogRef.current) {
        dialogRef.current.click()
      }
    } else {
      console.log('No folder selected')
    }
  }

  const handleCancelOrRetry = async () => {
    const wasInstalling = gameDownloadUpdateInstalling
    setError(null)
    setErrorType(null)
    setCorruptError(null)
    setGameDownloadUpdateInstalling(false)
    setGameDownloadUpdateSpeed(0)
    setGameDownloadUpdateProgress(0)
    setDownloadedBytes(0)
    setTotalDownloadSize(0)
    setEta('Calculating...')
    setSpeedHistory([])
    setSpeedStatus(null)
    setIsStalled(false)
    setLastProgressAtError(0)
    if (wasInstalling) {
      await emitInstallStatus(false)
    }
  }

  const formatSpeed = (speed: number) => {
    if (speed < 1) {
      const kbps = speed * 1024
      return `${kbps.toFixed(1)} KB/s`
    }
    return `${speed.toFixed(2)} MB/s`
  }

  const getErrorIcon = (type: RustErrorType) => {
    switch (type) {
      case 'network':
      case 'stalled':
        return <WifiOff className="h-4 w-4" />
      case 'server':
        return <Server className="h-4 w-4" />
      case 'disk':
        return <AlertTriangle className="h-4 w-4" />
      case 'corrupt':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getSpeedDot = () => {
    if (
      (speedStatus === null || speedStatus === 'no-progress') &&
      !isStalled &&
      !corruptError &&
      !error
    )
      return null
    let dotClass = 'bg-red-500'
    let pulse = true
    if (speedStatus === 'stable') {
      dotClass = 'bg-green-500'
      pulse = false
    } else if (speedStatus === 'unstable') {
      dotClass = 'bg-orange-500'
      pulse = false
    } else {
      pulse = true
    }
    return (
      <div
        className={cn(
          'ml-1 inline-block h-2 w-2 rounded-full',
          dotClass,
          pulse ? 'animate-pulse' : '',
        )}
        title={`Speed: ${speedStatus === 'stable' ? 'Stable' : speedStatus === 'unstable' ? 'Unstable' : isStalled ? 'Stalled (retrying)' : corruptError ? 'Corrupt (restarting)' : 'No progress'}`}
      />
    )
  }

  const uiMode = isStalled ? 'stalled' : corruptError ? 'corrupt' : error ? 'error' : 'normal'

  const getActionButton = () => {
    if (corruptError) {
      return (
        <div className="flex w-full gap-2">
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => {
              setCorruptError(null)
              setError(null)
              setErrorType(null)
              setGameDownloadUpdateInstalling(false)
              setLastInstallPath('')
              handleCancelOrRetry()
            }}
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Restart Fresh
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={handleResume}>
            Resume if Partial
          </Button>
        </div>
      )
    }

    if (error && !corruptError) {
      const isResume = errorType === 'network'
      const buttonText = isResume
        ? `Resume from ${lastProgressAtError > 0 ? lastProgressAtError.toFixed(1) + '%' : ''}`
        : t('onboarding.install.prod.retry', 'Retry')
      const onClick = isResume ? handleResume : handleDownloadVU
      return (
        <div className="flex w-full gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onClick}>
            {buttonText}
          </Button>
          {errorType === 'disk' && (
            <Button variant="ghost" size="sm" className="flex-1" onClick={handleCancelOrRetry}>
              {t('onboarding.install.prod.diskCancel', 'Cancel (Check Disk Space)')}
            </Button>
          )}
          {errorType !== 'disk' && (
            <Button variant="ghost" size="sm" className="flex-1" onClick={handleCancelOrRetry}>
              Cancel
            </Button>
          )}
        </div>
      )
    }

    if (isStalled && !error && !corruptError && !gameDownloadUpdateExtracting) {
      return (
        <Button variant="outline" className="w-full" onClick={handleResume}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {lastProgressAtError > 0
            ? `Resume from ${lastProgressAtError.toFixed(1)}%`
            : t('onboarding.install.prod.resume', 'Resume Download')}
        </Button>
      )
    }

    return null
  }

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-4">
      {!gameDownloadUpdateInstalling && (
        <DownloadVUButton
          handleDownloadVU={handleDownloadVU}
          dialogRef={dialogRef}
          lastInstallPath={lastInstallPath}
          startDownload={startDownload}
        />
      )}

      {gameDownloadUpdateInstalling && (
        <div className="w-full space-y-4">
          {error && !corruptError && (
            <div className="flex flex-col items-center gap-2 rounded-md border bg-destructive/5 p-3 text-sm text-destructive">
              {getErrorIcon(errorType)}
              <span className="text-center">{error}</span>
              {getActionButton()}
            </div>
          )}
          {corruptError && (
            <div className="flex flex-col items-center gap-2 rounded-md border bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-center">{corruptError}</span>
              {getActionButton()}
            </div>
          )}
          {!error && !corruptError && (
            <>
              <div className="space-y-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Zap
                    className={cn(
                      'h-5 w-5',
                      uiMode !== 'normal'
                        ? 'animate-pulse text-destructive'
                        : 'animate-pulse text-primary',
                    )}
                  />
                  <h3 className="text-lg font-semibold">
                    {uiMode === 'stalled'
                      ? t('onboarding.install.prod.stalledHeader', 'Connection Stalled')
                      : t('onboarding.install.prod.progress.header', 'Installing Venice Unleashed')}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {uiMode === 'stalled'
                    ? t(
                        'onboarding.install.prod.stalledDescription',
                        'Connection issue detected. Check your internet and click Resume to continue from partial download.',
                      )
                    : t(
                        'onboarding.install.prod.progress.description',
                        'Your download is in progress. This may take several minutes depending on your connection.',
                      )}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t('onboarding.install.prod.progress.progress', 'Progress')}</span>
                  <span>{gameDownloadUpdateProgress.toFixed(1)}%</span>
                </div>
                <Progress
                  value={gameDownloadUpdateProgress}
                  className={cn('h-2', uiMode !== 'normal' ? 'animate-pulse' : '')}
                />
              </div>

              {!gameDownloadUpdateExtracting ? (
                <div className="text-xs text-muted-foreground">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 flex-shrink-0" />
                      <span>Speed:</span>
                      <span className="ml-auto flex items-center font-medium text-foreground">
                        {formatSpeed(gameDownloadUpdateSpeed)}
                        {getSpeedDot()}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span>ETA:</span>
                      <span className="font-medium text-foreground">{eta}</span>
                    </div>
                  </div>
                  {totalDownloadSize > 0 && (
                    <div className="col-span-2 mt-2 flex items-center gap-1">
                      <FileText className="h-3 w-3 flex-shrink-0" />
                      <span>Total: {formatBytes(totalDownloadSize)}</span>
                      <span className="ml-auto">Downloaded: {formatBytes(downloadedBytes)}</span>
                    </div>
                  )}

                  {uiMode === 'normal' && (
                    <div className="mt-2 flex items-center justify-center gap-3 text-[10px] opacity-60">
                      <span className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span>Stable</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                        <span>Unstable</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                        <span>No progress</span>
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-primary">
                    <Zap className="h-4 w-4 animate-spin" />
                    <span>
                      {t('onboarding.install.prod.progress.extracting', 'Extracting files...')}
                    </span>
                  </div>
                  {gameDownloadUpdateExtractingFilesRemaining > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t(
                        'onboarding.install.prod.progress.extractingFiles',
                        '{{count}} files remaining',
                        { count: gameDownloadUpdateExtractingFilesRemaining },
                      )}
                    </p>
                  )}
                </div>
              )}
              {uiMode === 'stalled' && (
                <div className="text-center text-sm text-destructive">
                  {t(
                    'onboarding.install.prod.stalledMessage',
                    'Click Resume to continue after checking your connection.',
                  )}
                </div>
              )}
            </>
          )}

          {(error || corruptError || (isStalled && !error && !corruptError)) &&
            !gameDownloadUpdateExtracting &&
            getActionButton()}
        </div>
      )}
    </div>
  )
}
