import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export function DownloadErrorComponent({
  errorType,
  lastProgressAtError,
  handleResume,
  handleDownloadVU,
  handleCancelOrRetry,
}: {
  errorType: string | null
  lastProgressAtError: number
  handleResume: () => {}
  handleDownloadVU: () => {}
  handleCancelOrRetry: () => {}
}) {
  const { t } = useTranslation()

  const isResume = errorType === 'network'
  const buttonText = isResume
    ? `${t('onboarding.install.button.resumeFrom')} ${lastProgressAtError > 0 ? lastProgressAtError.toFixed(1) + '%' : ''}`
    : t('onboarding.install.button.retry')
  const onClick = isResume ? handleResume : handleDownloadVU
  return (
    <div className="flex w-full gap-2">
      <Button variant="outline" size="sm" className="flex-1" onClick={onClick}>
        {buttonText}
      </Button>
      {errorType === 'disk' ? (
        <Button variant="ghost" size="sm" className="flex-1" onClick={handleCancelOrRetry}>
          {t('onboarding.install.button.cancelDiskSpace')}
        </Button>
      ) : (
        <Button variant="ghost" size="sm" className="flex-1" onClick={handleCancelOrRetry}>
          {t('onboarding.install.button.cancel')}
        </Button>
      )}
    </div>
  )
}
