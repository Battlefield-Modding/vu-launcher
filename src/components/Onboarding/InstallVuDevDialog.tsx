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

export function InstallVuDevDialog({
  vuDevInstallPath,
  dialogRef,
}: {
  vuDevInstallPath: string
  dialogRef: any
}) {
  const [submitLoading, setSubmitLoading] = useState(false)
  const queryClient = useQueryClient()

  async function InstallVuDevToPath() {
    setSubmitLoading(() => true)
    await invoke(rust_fns.copy_vu_prod_to_folder, { path: vuDevInstallPath })
    setSubmitLoading(() => false)
    queryClient.invalidateQueries({ queryKey: [QueryKey.IsVuInstalled], refetchType: 'all' })
  }

  return (
    <Dialog>
      <DialogTrigger ref={dialogRef}></DialogTrigger>
      <DialogContent className="w-auto max-w-screen-xl">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center pb-4">
            <p className="mb-4">Install VU Dev to:</p>
            <code className="text-md rounded-md bg-gray-800 p-1 pl-2 pr-2 text-white">
              {`${vuDevInstallPath}\\VeniceUnleashedDev`}
            </code>
          </DialogTitle>
          <DialogDescription className="text-center">
            This will install VU Dev to the above directory.
          </DialogDescription>
        </DialogHeader>
        {submitLoading && <LoaderComponent />}
        <div className="flex justify-center gap-8">
          <DialogClose>
            <p className="flex gap-2 rounded-md bg-secondary p-2 transition hover:bg-secondary/80">
              <X />
              Cancel
            </p>
          </DialogClose>
          <p
            className="flex gap-4 rounded-md bg-green-600 p-2 text-white transition hover:cursor-pointer hover:bg-green-600/80"
            onClick={InstallVuDevToPath}
          >
            <Check /> Install VU Dev
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
