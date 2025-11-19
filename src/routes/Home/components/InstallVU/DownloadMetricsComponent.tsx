import { Zap, Clock, FileText } from 'lucide-react'

export function DownloadMetricsComponent({
  formatSpeed,
  gameDownloadUpdateSpeed,
  getSpeedDot,
  totalDownloadSize,
  formatBytes,
  eta,
  downloadedBytes,
  uiMode,
}: {
  formatSpeed: (a: number) => string
  gameDownloadUpdateSpeed: number
  getSpeedDot: () => any
  totalDownloadSize: number
  formatBytes: (a: number) => string
  eta: string
  downloadedBytes: number
  uiMode: string
}) {
  return (
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
            <span>No progress</span>
          </span>
        </div>
      )}
    </div>
  )
}
