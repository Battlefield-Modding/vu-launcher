import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function RefreshLoadoutTooltip() {
  const { t } = useTranslation()
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>
            <RefreshCcw />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('servers.loadouts.loadout.refreshTooltip')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
