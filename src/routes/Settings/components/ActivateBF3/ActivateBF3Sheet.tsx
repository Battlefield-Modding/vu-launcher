import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ActivateBF3Tooltip } from './ActivateBF3Tooltip'
import { Input } from '@/components/ui/input'
import { activateBf3EaAuthToken, activateBf3LSX } from '@/api'

export function ActivateBF3Sheet() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [eaToken, setEAToken] = useState('')

  function handleActivateLSX() {
    toast('Activating BF3 (LSX)')
    activateBf3LSX()
  }

  function handleActivateEAToken() {
    toast('Activating BF3 (EA Auth Token)')
    activateBf3EaAuthToken(eaToken)
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <ActivateBF3Tooltip />
      </SheetTrigger>
      <SheetContent className="overflow-y-none flex flex-col gap-12">
        <SheetHeader>
          <SheetTitle className="text-4xl">Activate BF3</SheetTitle>
        </SheetHeader>
        <div>
          <h1 className="text-2xl">Option 1: EA App / Origin LSX (recommended)</h1>
          <ul className="m-4 ml-8 list-disc">
            <li>Please launch your EA App / Origin and sign in.</li>
            <li>Once signed-in click on the Activate BF3 button: </li>
          </ul>
          <Button variant={'constructive'} onClick={handleActivateLSX} className="ml-8">
            Activate BF3 (LSX)
          </Button>
        </div>

        <div className="max-w-5xl">
          <h1 className="text-2xl">Option 2: EA Token</h1>
          <ul className="m-4 ml-8 list-disc">
            <li>
              Run VU with launch arguments <code>-activate -lsx -wait</code> while EA App / Origin
              is logged in
            </li>
            <li>
              Copy the EA Auth token that window generates into the box below and click on the
              Activate BF3 button.
            </li>
          </ul>
          <div className="ml-8 flex">
            <Input
              type="text"
              className="w-1/2"
              placeholder="EA Token"
              onChange={(e) => {
                const target = e.target as HTMLInputElement
                setEAToken(() => target.value)
                console.log(eaToken)
              }}
            />

            <Button
              variant={'constructive'}
              onClick={handleActivateEAToken}
              disabled={eaToken.length < 1}
            >
              Activate BF3 (EA Token)
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
