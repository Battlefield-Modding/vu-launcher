import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { InstallVuProdDialog } from './InstallVuProdDialog'
import { MutableRefObject } from 'react'

export function DownloadVUButton({
  handleDownloadVU,
  lastInstallPath,
  dialogRef,
  startDownload,
}: {
  handleDownloadVU: Function
  lastInstallPath: string
  dialogRef: MutableRefObject<any>
  startDownload: Function
}) {
  const { t } = useTranslation()
  return (
    <>
      <Button
        variant="default"
        size="lg"
        className="w-full max-w-sm px-6"
        onClick={(e) => {
          e.preventDefault()
          handleDownloadVU()
        }}
      >
        <Download className="mr-2 h-4 w-4" />
        {t('onboarding.install.prod.download.button', 'Select Directory & Download')}
      </Button>
      <InstallVuProdDialog
        vuProdInstallPath={lastInstallPath}
        dialogRef={dialogRef}
        onPathConfirm={async (path) => {
          await startDownload(path)
        }}
      />
    </>
  )
}
