import { useEffect, useState } from 'react'

import { listen, UnlistenFn } from '@tauri-apps/api/event'
import clsx from 'clsx'
import { Folder, Search, Upload } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { QueryKey, DragDropEventTauri } from '@/config/config'
import { toast } from 'sonner'
import { open } from '@tauri-apps/plugin-dialog'
import { importModFolderToCache } from '@/api'
import { useTranslation } from 'react-i18next'

export function ModFolderImport() {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const { t } = useTranslation()
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

        if (payload && payload.paths[0]) {
          const info = payload.paths[0]
          const result = await importModFolderToCache(info)
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
          toast(t('mods.import.form.toast.failure'))
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
      directory: true,
    })
    if (installPath) {
      const confirmed = await confirm(`${t('mods.import.form.confirm')}: ${installPath}`)

      if (confirmed) {
        const result = await importModFolderToCache(installPath)
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
    }
  }

  return (
    <div
      className={clsx(
        'flex flex-1 flex-col justify-center border-2 border-dashed border-primary bg-secondary text-center text-white',
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
            <p>{t('mods.importFolder.form.drag')}</p>
            <Folder />
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
