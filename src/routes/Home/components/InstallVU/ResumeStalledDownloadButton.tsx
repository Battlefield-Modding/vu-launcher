import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function ResumeStalledDownloadButton({
  lastProgressAtError,
  handleResume,
}: {
  lastProgressAtError: number
  handleResume: (e: any) => {}
}) {
  const { t } = useTranslation()
  return (
    <Button variant="outline" className="w-full" onClick={handleResume}>
      <RefreshCw className="mr-2 h-4 w-4" />
      {lastProgressAtError > 0
        ? `${t('onboarding.install.button.resumeFrom')} ${lastProgressAtError.toFixed(1)}%`
        : t('onboarding.install.button.resume')}
    </Button>
  )
}
