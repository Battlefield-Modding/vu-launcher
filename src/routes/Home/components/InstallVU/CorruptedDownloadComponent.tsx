import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function CorruptedDownloadComponent({
  restartCorruptedDownload,
  handleResume,
}: {
  restartCorruptedDownload: () => void
  handleResume: () => {}
}) {
  const { t } = useTranslation()

  return (
    <div className="flex w-full gap-2">
      <Button variant="destructive" size="sm" className="flex-1" onClick={restartCorruptedDownload}>
        <RefreshCw className="mr-1 h-3 w-3" />
        {t('onboarding.install.button.retry')}
      </Button>
      <Button variant="outline" size="sm" className="flex-1" onClick={handleResume}>
        {t('onboarding.install.button.resume')}
      </Button>
    </div>
  )
}
