import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { rust_fns } from '@/config/config'
import { invoke } from '@tauri-apps/api/core'
import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { LoaderComponent } from '../../../../components/LoaderComponent'

export function InstallVuProdDialog({
  vuProdInstallPath,
  setGameDownloadUpdateInstalling,
  dialogRef,
}: {
  vuProdInstallPath: string
  setGameDownloadUpdateInstalling: (t: () => boolean) => void
  dialogRef: any
}) {
  const [submitLoading, setSubmitLoading] = useState(false)

  async function InstallVuProdToPath() {
    setGameDownloadUpdateInstalling(() => true)
    await invoke(rust_fns.download_game, { installPath: vuProdInstallPath })
  }

  return (
    <Dialog>
      <DialogTrigger ref={dialogRef}></DialogTrigger>
      <DialogContent className="w-auto max-w-screen-xl">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center pb-4">
            <p className="mb-4">Install VU to:</p>
            <code className="text-md text-nowrap rounded-md bg-gray-800 p-1 pl-2 pr-2 text-white">
              {`${vuProdInstallPath}\\VeniceUnleashed`}
            </code>
          </DialogTitle>
          <DialogDescription className="text-center">
            This will install VU to the above directory.
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
          <DialogClose>
            <p
              className="flex gap-4 rounded-md bg-green-600 p-2 text-white transition hover:cursor-pointer hover:bg-green-600/80"
              onClick={InstallVuProdToPath}
            >
              <Check /> Install VU Prod
            </p>
          </DialogClose>
          <DialogClose>
            <p
              className="flex gap-4 rounded-md bg-green-600 p-2 text-white transition hover:cursor-pointer hover:bg-green-600/80"
              onClick={InstallVuProdToPath}
            >
              <Check /> Install VU Prod AND Dev
            </p>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
