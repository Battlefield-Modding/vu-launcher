import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Wrench } from 'lucide-react'

export function ActivateBF3Tooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-between gap-2 rounded-md bg-green-800 p-2 text-lg hover:bg-green-800/80">
            Activate BF3 <Wrench />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Guided BF3 activation</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
