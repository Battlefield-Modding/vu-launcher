import { getUserPreferences, setIgnoreUpdateVersion } from '@/api'
import { check, Update } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { useEffect, useRef, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { useTranslation } from 'react-i18next'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useQuery } from '@tanstack/react-query'
import { QueryKey, UserPreferences } from '@/config/config'
import { Button } from './ui/button'
import { Loader, Loader2, Loader2Icon } from 'lucide-react'
import { LoaderComponent } from './LoaderComponent'

export function Updating() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const autoInstallRef = useRef(undefined)
  const [isReadyForInstall, setIsReadyForInstall] = useState(false)
  const [autoInstallTimer, setAutoInstallTimer] = useState(5)
  const { t } = useTranslation()

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.CheckForUpdates],
    queryFn: async (): Promise<{ update: Update | null; preferences: UserPreferences | null }> => {
      const preferences = await getUserPreferences()
      if (preferences) {
        if (preferences.automatically_check_for_updates == false) {
          return { update: null, preferences }
        } else {
          const update = await check()
          if (update) {
            console.log(update.version, preferences.ignore_update_version)
            if (update.version == preferences.ignore_update_version) {
              return { update: null, preferences }
            }
          }
          return { update, preferences }
        }
      } else {
        return { update: null, preferences: null }
      }
    },
  })

  useEffect(() => {
    async function autoInstall() {
      if (autoInstallTimer <= 0 && data) {
        clearInterval(autoInstallRef.current)
        await data.update?.install()
        await relaunch()
      }
    }
    autoInstall()
  }, [autoInstallTimer, data])

  if (isPending) {
    return <div></div>
  }

  if (isError) {
    return (
      <AlertDialog defaultOpen={true}>
        <AlertDialogTrigger></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('update.checkFailed')}</AlertDialogTitle>
            <AlertDialogDescription>{error.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('update.close')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  if (data.preferences && data.preferences.automatically_install_update_if_found) {
    if (data.update && !isUpdating) {
      startDownload()
    }
  }

  async function startDownload() {
    // console.log('START DOWNLOAD')
    if (data?.update) {
      // console.log('UPDATE EXISTS')
      try {
        // console.log('IN TRY')
        if (!isUpdating) {
          // console.log('SET IS UPDATING TRUE')
          setIsUpdating(() => true)
          let downloaded = 0
          let contentLength = 0
          // alternatively we could also call update.download() and update.install() separately
          console.log('GOING INTO DOWNLOAD FUNCTION')

          await data?.update.download(() => {
            // console.log('INSIDE DOWNLOADING FUNCTION')
          })

          setIsUpdating(() => false)

          setIsReadyForInstall(() => true)
          autoInstallRef.current = setInterval(async () => {
            setAutoInstallTimer((prev) => prev - 1)
          }, 1000)
          // await data?.update.download((event) => {
          //   console.log('INSIDE DOWNLOAD FUNCTION')
          //   console.log('You are in the download event thing')
          //   console.log(`Your event is ${event}`)
          //   switch (event.event) {
          //     case 'Started':
          //       // @ts-ignore
          //       contentLength = event.data.contentLength
          //       console.log(`started downloading ${event.data.contentLength} bytes`)
          //       break
          //     case 'Progress':
          //       downloaded += event.data.chunkLength
          //       setDownloadProgress(() => (downloaded / contentLength) * 100)
          //       console.log(`downloaded ${downloaded} from ${contentLength}`)
          //       break
          //     case 'Finished':
          //       console.log('download finished')
          //       break
          //   }
          // })

          // console.log('update installed')
          // await relaunch()

          // setIsUpdating(() => false)
        }
      } catch (err) {
        console.log(`Failed to check for updates due to error:\n[${err}]`)
      }
    }
  }

  if (isReadyForInstall) {
    return (
      <AlertDialog defaultOpen={true}>
        <AlertDialogTrigger></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('update.downloadComplete')}
              {autoInstallTimer}
              {/* {t('update.install')} */}
              <hr></hr>
            </AlertDialogTitle>
            <AlertDialogDescription></AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* <AlertDialogCancel>
              {t('onboarding.install.dev.dialog.button.cancel')}
            </AlertDialogCancel> */}
            <Button
              onClick={async () => {
                await data.update?.install()
                await relaunch()
              }}
            >
              {t('servers.loadouts.loadout.mods.addModDialog.confirm')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  if (data.update && !isUpdating) {
    return (
      <AlertDialog defaultOpen={true}>
        <AlertDialogTrigger></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('update.install')}
              <hr></hr>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <a
                href={`https://github.com/Battlefield-Modding/vu-launcher/releases/tag/v${data.update.version}`}
                target="_blank"
                className="text-blue-500 underline hover:opacity-80"
              >
                {`https://github.com/Battlefield-Modding/vu-launcher/releases/tag/v${data.update.version}`}
              </a>
              <br />
              {data.update.body}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              // @ts-expect-error
              onClick={async () => await setIgnoreUpdateVersion(data.update.version)}
            >
              {t('update.ignore')} {data.update.version}
            </AlertDialogCancel>
            <AlertDialogCancel>
              {t('onboarding.install.dev.dialog.button.cancel')}
            </AlertDialogCancel>
            <Button onClick={() => startDownload()}>{t('update.download')}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  if (isUpdating) {
    return (
      <AlertDialog defaultOpen={true}>
        <AlertDialogTrigger></AlertDialogTrigger>
        <AlertDialogContent autoFocus={true} onKeyDown={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('update.downloading')}
              <hr></hr>
            </AlertDialogTitle>
            <div className="mb-2 flex h-8">
              <Loader2 className="animate-spin m-auto h-16 w-16" />
              {/* <Progress value={downloadProgress} className="h-full w-full flex-1" /> */}
            </div>
            {/* <div className="text-right">{downloadProgress.toFixed(2)}%</div> */}
          </AlertDialogHeader>
          <AlertDialogFooter></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return <></>
}
