import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { QueryKey, rust_fns } from '@/config/config'
import { useQueryClient } from '@tanstack/react-query'
import { invoke } from '@tauri-apps/api/core'
import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { LoaderComponent } from '../LoaderComponent'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export function InstallVuDevDialog({
  vuDevInstallPath,
  dialogRef,
}: {
  vuDevInstallPath: string
  dialogRef: any
}) {
  const [submitLoading, setSubmitLoading] = useState(false)
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  async function InstallVuDevToPath() {
    setSubmitLoading(() => true)
    const status = await invoke(rust_fns.copy_vu_prod_to_folder, { path: vuDevInstallPath })
    setSubmitLoading(() => false)
    if (status) {
      queryClient.invalidateQueries({ queryKey: [QueryKey.IsVuInstalled], refetchType: 'all' })
      toast(t('onboarding.install.dev.dialog.toast.success'))
    } else {
      toast(t('onboarding.install.dev.dialog.toast.failure'))
    }
  }

  return (
    <Dialog>
      <DialogTrigger ref={dialogRef}></DialogTrigger>
      <DialogContent className="w-auto max-w-screen-xl">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center pb-4">
            <p className="mb-4">{t('onboarding.install.dev.dialog.title')}:</p>
            <code className="text-md text-nowrap rounded-md bg-gray-800 p-1 pl-2 pr-2 text-white">
              {`${vuDevInstallPath}\\VeniceUnleashedDev`}
            </code>
          </DialogTitle>
          <DialogDescription className="text-center">
            {t('onboarding.install.dev.dialog.description')}
          </DialogDescription>
        </DialogHeader>
        {submitLoading && <LoaderComponent />}
        <div className="flex justify-center gap-8">
          <DialogClose>
            <p className="flex gap-2 rounded-md bg-secondary p-2 transition hover:bg-secondary/80">
              <X />
              {t('onboarding.install.dev.dialog.button.cancel')}
            </p>
          </DialogClose>
          <p
            className="flex gap-4 rounded-md bg-green-600 p-2 text-white transition hover:cursor-pointer hover:bg-green-600/80"
            onClick={InstallVuDevToPath}
          >
            <Check /> {t('onboarding.install.dev.dialog.button.confirm')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
