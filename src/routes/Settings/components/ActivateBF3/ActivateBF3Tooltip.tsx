import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Wrench } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function ActivateBF3Tooltip() {
  const { t } = useTranslation()
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-between gap-2 rounded-md bg-green-800 p-1 text-lg hover:bg-green-800/80">
            {t('settings.activateBF3.tooltip.title')} <Wrench />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('settings.activateBF3.tooltip.content')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
