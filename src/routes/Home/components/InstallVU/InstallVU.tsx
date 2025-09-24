import { getLauncherInstallPath } from '@/api'
import { Button } from '@/components/ui/button'
import {
  Download,
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
import { InstallVuProdDialog } from './InstallVuProdDialog'
import { useRef, useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { invoke } from '@tauri-apps/api/core'
import { listen, emit, type UnlistenFn } from '@tauri-apps/api/event'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface TauriEmitEvent {
  payload: number
}

// Custom event interfaces (applied to subscribed events for TS safety; flat number payloads)
interface CustomProgressEvent {
  payload: number // Download progress as percentage (0-100)
}

interface CustomSpeedEvent {
  payload: number // Average download speed in KB/s
}

interface CustomTotalSizeEvent {
  payload: number // Total download size in bytes
}

// Interface for VU install status event emitted by this component
interface VuInstallStatusEvent {
  payload: {
    installing: boolean // Whether VU installation is active
  }
}

// Stalled event interface (empty payload from Rust)
interface DownloadStalledEvent {
  payload: never // Or {} if you extend Rust to include { progress: number, remaining: number }
}

// Corrupt event interface (from Rust on corrupt ZIP/partial)
interface DownloadCorruptEvent {
  payload: {
    reason: string // e.g., "zip-invalid"
    progress: number // e.g., 100.0
    action: string // e.g., "deleted"
    error?: string // Optional full error
  }
}

// Speed stability status type
type SpeedStatus = 'stable' | 'unstable' | 'no-progress' | null

// Error type for categorization (from Rust Err strings or corrupt event)
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
  const [totalDownloadSize, setTotalDownloadSize] = useState(0) // Total bytes (set dynamically from Rust event only)
  const [downloadedBytes, setDownloadedBytes] = useState(0) // Downloaded bytes (derived from progress)
  const [eta, setEta] = useState('Calculating...') // Estimated time remaining (mm:ss)
  const [error, setError] = useState<string | null>(null) // Generic error message
  const [errorType, setErrorType] = useState<RustErrorType>(null) // Categorize for icons/toasts (network, server, etc.)
  const [corruptError, setCorruptError] = useState<string | null>(null) // Specific for corrupt ZIP
  const [lastInstallPath, setLastInstallPath] = useState<string>('') // Cached last path for resume
  const [lastProgressAtError, setLastProgressAtError] = useState(0) // Track % at stall for button text
  const [speedHistory, setSpeedHistory] = useState<number[]>([]) // Track last 5 speeds for stability calc
  const [speedStatus, setSpeedStatus] = useState<SpeedStatus>(null) // Stable/Unstable/No progress indicator
  const [isStalled, setIsStalled] = useState(false) // Track stalled state for UX (retrying or prompt)

  const [vuProdInstallPath, setVuProdInstallPath] = useState('')

  // Refs for unlistens to handle async setup
  const unlistensRef = useRef<UnlistenFn[]>([])

  const dialogRef = useRef<any>(null) // Kept for compatibility; can be used if dialog needs ref
  const { t } = useTranslation()

  // Refs for critical states read in event handlers to avoid stale closures
  const errorRef = useRef(error)
  const isStalledRef = useRef(isStalled)
  const corruptErrorRef = useRef(corruptError)
  const speedStatusRef = useRef(speedStatus)
  const gameDownloadUpdateProgressRef = useRef(gameDownloadUpdateProgress)
  const gameDownloadUpdateInstallingRef = useRef(gameDownloadUpdateInstalling)
  const gameDownloadUpdateExtractingRef = useRef(gameDownloadUpdateExtracting)

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

  useEffect(() => {
    gameDownloadUpdateInstallingRef.current = gameDownloadUpdateInstalling
  }, [gameDownloadUpdateInstalling])

  useEffect(() => {
    gameDownloadUpdateExtractingRef.current = gameDownloadUpdateExtracting
  }, [gameDownloadUpdateExtracting])

  // Emit VU install status to parent/other listeners
  const emitInstallStatus = useCallback(async (installing: boolean) => {
    try {
      await emit('vu-install-status', { installing })
      console.log(`VU install status emitted: ${installing ? 'started' : 'ended'}`)
    } catch (err) {
      console.error('Failed to emit VU install status:', err)
    }
  }, [])

  // Categorize Rust error for better UX (icons, toasts) - Added 'stalled'
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

  // Format bytes to GB/MB for display
  const formatBytes = useCallback((bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }, [])

  // Calculate and format ETA (using direct speed in MB/s)
  const calculateEta = useCallback((remainingBytes: number, speedMbps: number) => {
    if (speedMbps <= 0 || remainingBytes <= 0) {
      return 'Calculating...'
    }
    const speedBytesPerSec = speedMbps * 1024 * 1024 // Convert MB/s to bytes/s
    let secondsRemaining = Math.ceil(remainingBytes / speedBytesPerSec)
    secondsRemaining = Math.max(0, secondsRemaining) // Clamp to prevent negative
    if (secondsRemaining < 5) {
      // Slightly higher threshold to avoid jitter at end
      return 'Finishing...'
    }
    const minutes = Math.floor(secondsRemaining / 60)
    const seconds = secondsRemaining % 60
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
  }, [])

  // Calculate speed stability (simple variance: low change over last 3+ speeds = stable)
  const calculateSpeedStability = useCallback((currentSpeed: number, history: number[]) => {
    if (history.length < 3) return null // Need min history for assessment
    const recentSpeeds = [currentSpeed, ...history.slice(-2)] // Last 3 speeds (current + last 2)
    const avg = recentSpeeds.reduce((a, b) => a + b, 0) / recentSpeeds.length
    const variance =
      recentSpeeds.reduce((sum, speed) => sum + Math.pow(speed - avg, 2), 0) / recentSpeeds.length
    const stdDev = Math.sqrt(variance)
    // Threshold: <0.03 MB/s std dev = stable (e.g., 0.87 ±0.01); >0.03 = unstable
    return stdDev < 0.03 ? 'stable' : 'unstable'
  }, [])

  // Separate effect to reset derived states when install starts (avoids loop in listener effect)
  useEffect(() => {
    if (gameDownloadUpdateInstalling) {
      setTotalDownloadSize(0)
      setDownloadedBytes(0)
      setEta('Calculating...')
      setSpeedHistory([]) // Reset history on new install
      setSpeedStatus(null)
      setIsStalled(false)
      setCorruptError(null) // Clear corrupt on new start
      setError(null) // Clear errors on start
      setErrorType(null)
      setGameDownloadUpdateExtracting(false) // Ensure not stuck on extract
    }
  }, [gameDownloadUpdateInstalling])

  // Effect to derive downloadedBytes, ETA, and no-progress status
  useEffect(() => {
    if (!gameDownloadUpdateInstalling || totalDownloadSize <= 0) {
      return // Guard: Only during install, after total available
    }

    const downloaded = (gameDownloadUpdateProgress / 100) * totalDownloadSize
    setDownloadedBytes(downloaded)

    // ETA only if speed available and not stalled/corrupt/error
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
      // No progress: Speed=0 after meaningful progress (e.g., total set, progress started, but no speed events)
      setSpeedStatus('no-progress')
      setEta('Stalled') // Or keep 'Calculating...' if preferred
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
    speedStatus, // Dep for no-progress check
    isStalled, // New: Avoid no-progress during stalled retry
    corruptError, // Guard for corrupt
    error, // Guard for error
  ])

  // Main listener setup: Async setup with Promise.all to handle Tauri v2's async listen
  useEffect(() => {
    unlistensRef.current = []

    const setupListeners = async () => {
      try {
        unlistensRef.current = await Promise.all([
          // Download progress: Flat number payload (percentage)
          listen<CustomProgressEvent>('download-progress', (event) => {
            const progress = Math.min(100, event.payload) // Clamp to 100%
            setGameDownloadUpdateProgress(progress)
            console.log(`Download progress event received: ${progress}%`)

            // On progress update during error/stalled: Clear if resuming (e.g., manual retry)
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

          // Download speed: Flat number payload (KB/s)
          listen<CustomSpeedEvent>('download-speed', (event) => {
            const speedKbps = event.payload // KB/s from Rust (average)
            const speedMbpsRaw = speedKbps / 1024 // Raw MB/s
            // Use standard rounding to 2 decimals for better fluctuation visibility
            const speedMbps = Math.round(speedMbpsRaw * 100) / 100 // E.g., 0.874 → 0.87
            console.log(
              `Download speed event received: ${speedKbps.toFixed(2)} KB/s → ${speedMbps.toFixed(2)} MB/s (raw: ${speedMbpsRaw.toFixed(3)})`,
            )
            setGameDownloadUpdateSpeed(speedMbps)

            // Reset no-progress and stalled on speed event (progress resuming)
            if (speedStatusRef.current === 'no-progress' || isStalledRef.current) {
              setSpeedStatus(null)
              setIsStalled(false)
              setError(null) // Clear stalled error if resuming
            }
            // Clear corrupt if speed >0 (new fresh download in progress)
            if (speedMbps > 0) {
              setCorruptError(null)
            }

            // Update speed history and stability
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

          // Listener for total size: Flat number payload (bytes)
          listen<CustomTotalSizeEvent>('download-total-size', (event) => {
            const total = Math.floor(event.payload) // Ensure integer bytes
            console.log(
              `Download total size event received: ${total} bytes (${formatBytes(total)} )`,
            )
            setTotalDownloadSize(total)
          }),

          // Stalled listener (from Rust on disconnect/stall) - No setError here; handled in catch
          listen<DownloadStalledEvent>('download-stalled', () => {
            console.log('Download stalled event received: Connection interrupted')
            setIsStalled(true)
            setSpeedStatus('no-progress') // Trigger red dot
            setEta('Stalled – Retrying...')

            // Toast for user awareness (no auto-retry, prompt to resume)
            toast.warning(
              t(
                'onboarding.install.prod.stalled',
                'Connection interrupted. Check your network and resume download.',
              ),
              {
                duration: 5000,
              },
            )
          }),

          // Corrupt listener (from Rust on corrupt ZIP/partial)
          listen<DownloadCorruptEvent>('download-corrupt', (event) => {
            console.log('Download corrupt event received:', event.payload)
            const { reason, progress, action, error: err } = event.payload
            let corruptMsg = `Corrupt download detected (${reason}). File ${action === 'deleted' ? 'deleted' : 'fixed'} for fresh start.`
            if (err) {
              corruptMsg += ` Error: ${err}`
            }
            setCorruptError(corruptMsg)
            setErrorType('corrupt') // Categorize as corrupt
            setIsStalled(true)
            setSpeedStatus('no-progress') // Red dot
            setEta('Restarting Fresh...')
            // Snap to 0% visual if partial deleted (action=deleted)
            if (action === 'deleted') {
              setGameDownloadUpdateProgress(0)
              setDownloadedBytes(0)
              setTotalDownloadSize(0)
            }
            // Toast specific to reason
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

          // Extracting: No payload
          listen('download-extracting', () => {
            setGameDownloadUpdateExtracting(true)
            setIsStalled(false) // Clear stalled during extract
            setCorruptError(null) // Clear corrupt during extract
            setError(null)
            setErrorType(null) // Clear errors during extract
            console.log('Files Extracting.')
          }),

          // Extracting files remaining: Flat number payload
          listen<TauriEmitEvent>('extracting-files', (event) => {
            setGameDownloadUpdateExtractingFilesRemaining(event.payload)
            console.log('Files remaining:', event.payload)
          }),

          // Install complete: No payload
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
            setSpeedHistory([]) // Reset on complete
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
            await emitInstallStatus(false) // Emit end to parent
          }),
        ])
      } catch (err) {
        console.error('Failed to set up event listeners:', err)
      }
    }

    setupListeners()

    // Cleanup: Call each unlisten function if it's a function
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
  ]) // Stable deps only: No changing states

  // Helper to start download with error handling
  const startDownload = useCallback(
    async (installPath: string) => {
      console.log('Starting download for path:', installPath) // Debug log
      try {
        setLastProgressAtError(gameDownloadUpdateProgressRef.current) // Capture current before start
        setGameDownloadUpdateInstalling(true)
        setError(null)
        setErrorType(null)
        setCorruptError(null)
        setIsStalled(false)
        setGameDownloadUpdateSpeed(0)
        setGameDownloadUpdateProgress(gameDownloadUpdateProgressRef.current) // Preserve progress for resume
        setDownloadedBytes((gameDownloadUpdateProgressRef.current / 100) * totalDownloadSize)
        setEta('Calculating...')
        setSpeedHistory([])
        setSpeedStatus(null)
        await emitInstallStatus(true)
        await invoke('download_game', { installPath })
        console.log('Download invoke succeeded') // Debug log
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

        // Special handling for stalled (show stalled mode, not error box)
        if (errType === 'stalled') {
          setIsStalled(true)
          setError(null) // Don't show generic error for stalled
          toast.warning(
            t(
              'onboarding.install.prod.error.stalled',
              'Download stalled (network issue). Check your connection and resume from partial progress.',
            ),
            { duration: 5000 },
          )
        } else {
          // Other errors: show error box
          setIsStalled(false)
          setError(errorMsg)
          // Specific toasts
          if (errType === 'network') {
            toast.warning(errorMsg, { duration: 4000, icon: <WifiOff className="h-4 w-4" /> })
          } else if (errType === 'server') {
            toast.warning(errorMsg, { duration: 4000, icon: <Server className="h-4 w-4" /> })
          } else if (errType === 'disk') {
            toast.error(errorMsg, { duration: 5000, icon: <AlertTriangle className="h-4 w-4" /> })
          } else {
            toast.error(errorMsg, { duration: 5000 })
          }
          // Hint for resume if partial progress
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
        setSpeedHistory([]) // Reset on error
        setSpeedStatus('no-progress') // Red dot on error
        setGameDownloadUpdateExtracting(false) // Cancel extracting if stuck
      }
    },
    [t, emitInstallStatus, categorizeRustError, gameDownloadUpdateProgressRef, totalDownloadSize],
  )

  // New: handleResume – Uses cached path, no dialog if possible
  const handleResume = useCallback(async () => {
    if (!lastInstallPath) {
      toast.warning(t('onboarding.install.prod.noPath', 'No previous path. Select a new one.'), {
        duration: 3000,
      })
      return handleDownloadVU() // Fallback to full
    }

    toast.info(
      t('onboarding.install.prod.resuming', `Resuming from ${lastProgressAtError.toFixed(1)}%...`),
      { duration: 2000 },
    )

    await startDownload(lastInstallPath)
  }, [lastInstallPath, lastProgressAtError, t, startDownload, handleDownloadVU])

  async function handleDownloadVU() {
    console.log('handleDownloadVU called - opening folder dialog') // Debug log
    setError(null) // Clear previous errors
    setErrorType(null)
    setCorruptError(null) // Clear corrupt
    setGameDownloadUpdateSpeed(0)
    setGameDownloadUpdateProgress(0) // Force 0% for fresh visual (backend will set initial if resume, but new path = fresh)
    setDownloadedBytes(0)
    setTotalDownloadSize(0)
    setEta('Calculating...')
    setSpeedHistory([]) // Reset on new download
    setSpeedStatus(null)
    setIsStalled(false) // Clear stalled on manual start
    setLastProgressAtError(0)
    const defaultPath = await getLauncherInstallPath()
    const installPath = await open({
      multiple: false,
      directory: true,
      defaultPath,
    })
    if (installPath) {
      console.log('Folder selected:', installPath) // Debug log
      setLastInstallPath(installPath) // Cache for future resumes
      setVuProdInstallPath(installPath)
      toast.info(
        t(
          'onboarding.install.prod.toast.selectingPath',
          'Installation path selected. Starting download...',
        ),
        {
          duration: 2000,
        },
      )
      // Directly start download after selection (bypasses dialog auto-trigger for reliability)
      await startDownload(installPath)
      // Note: If you need the InstallVuProdDialog for confirmation/editing, add logic here to open it
      // e.g., if (dialogRef.current) { dialogRef.current.showModal(); } but comment out startDownload and rely on onPathConfirm
    } else {
      console.log('No folder selected') // Debug log
    }
  }

  // Handle manual cancel/retry (emit end if was installing) – Clears for fresh/restart
  const handleCancelOrRetry = async () => {
    const wasInstalling = gameDownloadUpdateInstalling
    setError(null)
    setErrorType(null)
    setCorruptError(null) // Clear corrupt on retry action
    setGameDownloadUpdateInstalling(false)
    setGameDownloadUpdateSpeed(0)
    setGameDownloadUpdateProgress(0) // Reset to 0 for fresh/restart visual
    setDownloadedBytes(0)
    setTotalDownloadSize(0)
    setEta('Calculating...')
    setSpeedHistory([]) // Reset on retry
    setSpeedStatus(null)
    setIsStalled(false)
    setLastProgressAtError(0)
    if (wasInstalling) {
      await emitInstallStatus(false)
    }
    // On retry, if corrupt, Rust has deleted partial → Fresh download
    // If stalled, partial remains → Resume on next startDownload
  }

  const formatSpeed = (speed: number) => {
    if (speed < 1) {
      const kbps = speed * 1024
      return `${kbps.toFixed(1)} KB/s`
    }
    return `${speed.toFixed(2)} MB/s` // 2 decimals for subtlety (was 1; shows 0.87 → 0.90 changes)
  }

  // Icon based on error type
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

  // Dot indicator based on speed status (enhanced for stalled/corrupt – force red)
  const getSpeedDot = () => {
    if (
      (speedStatus === null || speedStatus === 'no-progress') &&
      !isStalled &&
      !corruptError &&
      !error
    )
      return null // No dot until assessable or stalled/corrupt
    let dotClass = 'bg-red-500' // Default to red for stalled/no-progress/corrupt
    let pulse = true
    if (speedStatus === 'stable') {
      dotClass = 'bg-green-500'
      pulse = false
    } else if (speedStatus === 'unstable') {
      dotClass = 'bg-orange-500'
      pulse = false
    } else {
      // no-progress or stalled or corrupt
      pulse = true
    }
    return (
      <div
        className={cn(
          'ml-1 inline-block h-2 w-2 rounded-full',
          dotClass,
          pulse ? 'animate-pulse' : '', // Always pulse on stalled/no-progress/corrupt
        )}
        title={`Speed: ${speedStatus === 'stable' ? 'Stable' : speedStatus === 'unstable' ? 'Unstable' : isStalled ? 'Stalled (retrying)' : corruptError ? 'Corrupt (restarting)' : 'No progress'}`}
      />
    )
  }

  // Determine UI mode: Normal, Stalled, Corrupt, or Error
  const uiMode = isStalled ? 'stalled' : corruptError ? 'corrupt' : error ? 'error' : 'normal'

  // Dynamic action buttons based on mode/type
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
              setLastInstallPath('') // Clear cache for fresh
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

    // For stalled (manual resume)
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
        <>
          <Button
            variant="default"
            size="lg"
            className="w-full max-w-sm px-6"
            onClick={(e) => {
              e.preventDefault()
              handleDownloadVU()
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            {t('onboarding.install.prod.download.button', 'Select Directory & Download')}
          </Button>
          {/* Dialog for optional path confirmation/editing – not auto-triggered */}
          <InstallVuProdDialog
            vuProdInstallPath={vuProdInstallPath}
            setGameDownloadUpdateInstalling={setGameDownloadUpdateInstalling}
            gameDownloadUpdateInstalling={gameDownloadUpdateInstalling}
            gameDownloadUpdateExtracting={gameDownloadUpdateExtracting}
            dialogRef={dialogRef}
            onPathConfirm={async (path) => {
              console.log('Dialog confirmed path:', path) // Debug log
              setLastInstallPath(path)
              await startDownload(path)
            }}
          />
        </>
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
                  {/* Legend: Subtle footer under info grid – Hide if stalled/corrupt for simplicity */}
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
          {/* Action buttons for stalled/errors (only if not extracting) */}
          {(error || corruptError || (isStalled && !error && !corruptError)) &&
            !gameDownloadUpdateExtracting &&
            getActionButton()}
        </div>
      )}
    </div>
  )
}
