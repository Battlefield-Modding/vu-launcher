import { getLauncherInstallPath } from '@/api'
import { Button } from '@/components/ui/button'
import { InstallVuDevDialog } from '@/routes/Onboarding/InstallVuDevDialog'
import { open } from '@tauri-apps/plugin-dialog'
import { Download } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function CopyProdToDev() {
  const { t } = useTranslation()
  const dialogRef = useRef(null)
  const [vuDevInstallPath, setVuDevInstallPath] = useState('')

  async function handleCopyVuProdToDev() {
    const defaultPath = await getLauncherInstallPath()
    const installPath = await open({
      multiple: false,
      directory: true,
      defaultPath,
    })
    if (installPath) {
      setVuDevInstallPath(() => installPath)
      if (dialogRef.current) {
        const element = dialogRef.current as HTMLDialogElement
        element.click()
      }
    }
  }
  return (
    <div>
      <Button
        variant={'secondary'}
        onClick={(e) => {
          e.preventDefault()
          handleCopyVuProdToDev()
        }}
      >
        <Download size={'10px'} />
        <p>{t('settings.copyProdToDev.button')}</p>
      </Button>
      <InstallVuDevDialog dialogRef={dialogRef} vuDevInstallPath={vuDevInstallPath} />
    </div>
  )
}
