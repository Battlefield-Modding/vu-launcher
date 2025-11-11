import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function InstallVuProdDialog({
  vuProdInstallPath,
  dialogRef,
  onPathConfirm,
}: {
  vuProdInstallPath: string
  dialogRef: any
  onPathConfirm: (path: string) => void
}) {
  const { t } = useTranslation()

  return (
    <Dialog>
      <DialogTrigger ref={dialogRef}></DialogTrigger>
      <DialogContent className="max-w-md rounded-md border-border/50 shadow-md">
        <DialogHeader className="space-y-4 text-center">
          <DialogTitle className="text-lg font-semibold">
            {t('onboarding.install.prod.dialog.title')}
          </DialogTitle>
          <code className="inline-block rounded-md bg-muted px-2 py-1 text-sm text-foreground">
            {`${vuProdInstallPath}\\VeniceUnleashed`}
          </code>
          <p className="text-sm text-muted-foreground">
            {t('onboarding.install.dev.dialog.title')}
          </p>
          <code className="inline-block rounded-md bg-muted px-2 py-1 text-sm text-foreground">
            {`${vuProdInstallPath}\\VeniceUnleashedDev`}
          </code>
          <DialogDescription className="text-sm">
            {t('onboarding.install.prod.dialog.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-3">
          <DialogClose asChild>
            <Button variant="outline" size="sm" className="min-w-[80px] gap-2">
              <X className="h-4 w-4" />
              {t('onboarding.install.prod.dialog.button.cancel')}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="default"
              size="sm"
              className="min-w-[100px] gap-2"
              onClick={() => onPathConfirm(vuProdInstallPath)}
            >
              <Check className="h-4 w-4" />
              {t('servers.loadouts.loadout.mods.addModDialog.confirm')}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
