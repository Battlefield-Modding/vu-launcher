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
import { QueryKey, rust_fns } from '@/config/config'
import { useQueryClient } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'
import { Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function InstallVuProdDialog({
  vuProdInstallPath,
  setGameDownloadUpdateInstalling,
  dialogRef,
  gameDownloadUpdateInstalling,
  gameDownloadUpdateExtracting,
}: {
  vuProdInstallPath: string
  setGameDownloadUpdateInstalling: (t: () => boolean) => void
  dialogRef: any
  gameDownloadUpdateInstalling: boolean
  gameDownloadUpdateExtracting: boolean
}) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  // async function InstallVuProdToPath() {
  //   setGameDownloadUpdateInstalling(() => true)
  //   await invoke(rust_fns.download_game, { installPath: vuProdInstallPath })
  // }

  async function InstallVuProdAndDevToPath() {
    setGameDownloadUpdateInstalling(() => true)
    await invoke(rust_fns.download_game, { installPath: vuProdInstallPath })
    while (gameDownloadUpdateInstalling) {
      // do nothing
    }
    while (gameDownloadUpdateExtracting) {
      // do nothing
    }
    await invoke(rust_fns.copy_vu_prod_to_folder, { path: vuProdInstallPath })
    queryClient.invalidateQueries({ queryKey: [QueryKey.IsVuInstalled], refetchType: 'all' })
  }

  return (
    <Dialog>
      <DialogTrigger ref={dialogRef}></DialogTrigger>
      <DialogContent className="max-w-md rounded-md border-border/50 shadow-md">
        <DialogHeader className="space-y-4 text-center">
          <DialogTitle className="text-lg font-semibold">
            {t('onboarding.install.prod.dialog.title')}
          </DialogTitle>
          <code className="inline-block text-sm text-foreground bg-muted px-2 py-1 rounded-md">
            {`${vuProdInstallPath}\\VeniceUnleashed`}
          </code>
          <p className="text-sm text-muted-foreground">
            {t('onboarding.install.dev.dialog.title')}
          </p>
          <code className="inline-block text-sm text-foreground bg-muted px-2 py-1 rounded-md">
            {`${vuProdInstallPath}\\VeniceUnleashedDev`}
          </code>
          <DialogDescription className="text-sm">
            {t('onboarding.install.prod.dialog.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 justify-center">
          <DialogClose asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 min-w-[80px]"
            >
              <X className="h-4 w-4" />
              {t('onboarding.install.prod.dialog.button.cancel')}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="default"
              size="sm"
              className="gap-2 min-w-[100px]"
              onClick={InstallVuProdAndDevToPath}
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