import { Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import vuIconRed from '@/assets/vu-icon-red.svg'

export default function OnboardingLoader() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <img src={vuIconRed} alt="VU Logo" className="mb-4 h-16 w-16 animate-ping" />
      <Loader className="h-8 w-8 animate-spin text-primary" />
      <h1 className="text-xl font-semibold">{t('onboarding.loading')}</h1>
    </div>
  )
}
