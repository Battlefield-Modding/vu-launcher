import { Loader2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function LoaderComponent() {
  const { t } = useTranslation()
  return (
    <div className="fixed bottom-0 left-0 flex min-h-[100vh] w-full flex-col bg-black bg-opacity-50 text-primary">
      <div className="m-auto flex flex-col items-center">
        <p className="text-2xl">{t('loaderComponent.title')}... </p>
        <Loader2Icon className="h-16 w-16 animate-spin" />
      </div>
    </div>
  )
}
