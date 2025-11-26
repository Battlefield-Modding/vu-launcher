import { Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function ExtractionMetricsComponent({
  extractionFilesLeft,
}: {
  extractionFilesLeft: number
}) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2 text-center">
      <div className="flex items-center justify-center gap-2 text-sm text-primary">
        <Zap className="h-4 w-4 animate-spin" />
        <span>{t('onboarding.install.extractTitle')}...</span>
      </div>
      {extractionFilesLeft > 0 && (
        <p className="text-xs text-muted-foreground">
          {t('onboarding.install.extractDescription')}: {extractionFilesLeft}
        </p>
      )}
    </div>
  )
}
