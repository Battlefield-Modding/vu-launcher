import { useEffect, useState } from 'react'

import { listen, UnlistenFn } from '@tauri-apps/api/event'
import clsx from 'clsx'
import { FolderArchive, Search, Upload } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { QueryKey, DragDropEventTauri, routes } from '@/config/config'
import { toast } from 'sonner'
import { open } from '@tauri-apps/plugin-dialog'
import { importZippedModToCache, importZippedModToLoadout } from '@/api'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

export function ZippedModImport({ importToLoadout }: { importToLoadout: boolean }) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const { t } = useTranslation()
  const { pathname } = useLocation()
  let handleDrop: UnlistenFn | undefined
  let handleDragEnter: UnlistenFn | undefined
  let handleDragLeave: UnlistenFn | undefined

  const queryClient = useQueryClient()

  function cleanupListeners() {
    if (handleDrop) {
      console.log('Cleaning up HandleDrop')
      handleDrop()
    }
    if (handleDragEnter) {
      console.log('Cleaning up handleDragEnter')
      handleDragEnter()
    }
    if (handleDragLeave) {
      console.log('Cleaning up handleDragLeave')
      handleDragLeave()
    }
  }

  useEffect(() => {
    ;(async () => {
      console.log('Setting up listeners for drag+drop')
      handleDrop = await listen('tauri://drag-drop', async (event: DragDropEventTauri) => {
        setIsDraggingOver(() => false)
        const payload = event.payload

        if (payload && payload.paths[0] && payload.paths[0].includes('.zip')) {
          const info = payload.paths[0]
          let result
          if (importToLoadout) {
            const loadoutName = pathname.split(`${routes.SERVERS}/`)[1]
            result = await importZippedModToLoadout({ modLocation: info, loadoutName })
            queryClient.invalidateQueries({
              queryKey: [`${QueryKey.GetAllModNames}-${loadoutName}`],
              refetchType: 'all',
            })
            queryClient.invalidateQueries({
              queryKey: [QueryKey.GetLoadoutJSON, loadoutName],
              refetchType: 'all',
            })
          } else {
            result = await importZippedModToCache(info)
          }
          if (result) {
            queryClient.invalidateQueries({
              queryKey: [QueryKey.GetModNamesInCache],
              refetchType: 'all',
            })
            queryClient.invalidateQueries({
              queryKey: [QueryKey.GetAllModNames],
              refetchType: 'all',
            })

            toast(`${t('mods.import.form.toast.success')}: ${info}`)
          } else {
            toast(t('mods.import.form.toast.failure'))
          }
        } else {
          toast(t('mods.import.form.toast.invalid'))
        }
      })

      handleDragEnter = await listen('tauri://drag-enter', () => {
        setIsDraggingOver(() => true)
      })

      handleDragLeave = await listen('tauri://drag-leave', () => setIsDraggingOver(() => false))
    })()

    return () => {
      cleanupListeners()
    }
  }, [])

  async function handleClick() {
    const installPath = await open({
      multiple: false,
      directory: false,
    })
    if (installPath) {
      if (installPath.includes('.zip')) {
        // TODO: Make a custom confirm window instead of native
        const confirmed = await confirm(`${t('mods.import.form.confirm')}: ${installPath}`)

        if (confirmed) {
          let result
          if (importToLoadout) {
            const loadoutName = pathname.split(`${routes.SERVERS}/`)[1]
            result = await importZippedModToLoadout({ modLocation: installPath, loadoutName })
            queryClient.invalidateQueries({
              queryKey: [`${QueryKey.GetAllModNames}-${loadoutName}`],
              refetchType: 'all',
            })
            queryClient.invalidateQueries({
              queryKey: [QueryKey.GetLoadoutJSON, loadoutName],
              refetchType: 'all',
            })
          } else {
            result = await importZippedModToCache(installPath)
          }
          if (result) {
            queryClient.invalidateQueries({
              queryKey: [QueryKey.GetModNamesInCache],
              refetchType: 'all',
            })
            queryClient.invalidateQueries({
              queryKey: [QueryKey.GetAllModNames],
              refetchType: 'all',
            })

            toast(`${t('mods.import.form.toast.success')}: ${installPath}`)
          } else {
            toast(t('mods.import.form.toast.failure'))
          }
        }
      } else {
        toast(t('mods.import.form.toast.invalid'))
      }
    }
  }

  return (
    <div
      className={clsx(
        'flex flex-1 flex-col justify-center border-2 border-dashed border-primary bg-secondary text-center text-primary',
        isDraggingOver && 'bg-green-500/80',
      )}
      onClick={handleClick}
    >
      {isDraggingOver ? (
        <div className="text-md m-auto flex flex-col gap-8">
          <Upload className="h-32 w-32" />
        </div>
      ) : (
        <div className="text-md m-auto flex flex-col gap-8">
          <div className="flex gap-2">
            <p>{t('mods.import.form.drag')}</p>
            <FolderArchive />
          </div>
          <div className="flex gap-2">
            <p>{t('mods.import.form.click')}</p>
            <Search />
          </div>
        </div>
      )}
    </div>
  )
}
