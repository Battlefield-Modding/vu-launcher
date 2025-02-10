import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { RefreshCcw } from 'lucide-react'

export function RefreshLoadoutTooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">
            <RefreshCcw />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reload txt files from Loadout JSON (if you manually updated loadout.json)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
