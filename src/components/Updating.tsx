import { getUserPreferences } from '@/api'
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { useTranslation } from 'react-i18next'

export function Updating() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const { t } = useTranslation()

  useEffect(() => {
    async function checkForUpdates() {
      const preferences = await getUserPreferences()

      try {
        if (!preferences.automatically_check_for_updates) {
          return
        }

        const update = await check()
        if (update) {
          console.log(
            `found update ${update.version} from ${update.date} with notes ${update.body}`,
          )

          if (!preferences.automatically_install_update_if_found) {
            const install = await confirm(
              `${t('update.install')} [${update.version}]\n\n${update.body}`,
            )
            if (!install) {
              return
            }
          }

          setIsUpdating(() => true)

          let downloaded = 0
          let contentLength = 0
          // alternatively we could also call update.download() and update.install() separately
          await update.downloadAndInstall((event) => {
            switch (event.event) {
              case 'Started':
                // @ts-ignore
                contentLength = event.data.contentLength
                console.log(`started downloading ${event.data.contentLength} bytes`)
                break
              case 'Progress':
                downloaded += event.data.chunkLength
                setDownloadProgress(() => (downloaded / contentLength) * 100)
                console.log(`downloaded ${downloaded} from ${contentLength}`)
                break
              case 'Finished':
                console.log('download finished')
                break
            }
          })

          console.log('update installed')
          await relaunch()
        }
      } catch (err) {
        console.log(`Failed to check for updates due to error:\n[${err}]`)
      }
    }

    checkForUpdates()
  }, [])

  if (isUpdating) {
    return (
      <div className="absolute z-10 m-auto flex h-full w-full flex-col justify-between gap-8 rounded-md bg-black p-8">
        <div className="flex w-full flex-col rounded-md text-primary">
          <h1 className="text-center text-xl">{t('update.header')}</h1>
          <div className="mb-2 flex h-6">
            <Progress value={downloadProgress} className="h-full w-full flex-1" />
          </div>
          <h1>{downloadProgress}%</h1>
        </div>
      </div>
    )
  }

  return <></>
}
