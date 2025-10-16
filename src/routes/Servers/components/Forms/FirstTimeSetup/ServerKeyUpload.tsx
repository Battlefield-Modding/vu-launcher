import { useEffect, useState } from 'react'

import { listen, UnlistenFn } from '@tauri-apps/api/event'
import { serverKeySetup } from '@/api'
import clsx from 'clsx'
import { Search, Upload } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { QueryKey, DragDropEventTauri } from '@/config/config'
import { toast } from 'sonner'
import { open } from '@tauri-apps/plugin-dialog'
import { useTranslation } from 'react-i18next'

export function ServerKeyUpload() {
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

        if (payload && payload.paths[0] && payload.paths[0].includes('server.key')) {
          const info = await serverKeySetup(event.payload.paths[0] as string)
          if (info) {
            queryClient.invalidateQueries({
              queryKey: [QueryKey.ServerKeyExists],
              refetchType: 'all',
            })

            toast(t('servers.firstTime.guidForm.toast.success'))
            cleanupListeners()
          }
        } else {
          toast(t('servers.firstTime.guidForm.toast.failure'))
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
      if (installPath.includes('server.key')) {
        const confirmed = await confirm(
          `${t('servers.firstTime.guidForm.confirm')}: ${installPath} ?`,
        )

        if (confirmed) {
          const info = await serverKeySetup(installPath)
          if (info) {
            queryClient.invalidateQueries({
              queryKey: [QueryKey.ServerKeyExists],
              refetchType: 'all',
            })
            toast(t('servers.firstTime.guidForm.toast.success'))
            cleanupListeners()
          }
        }
      } else {
        toast(t('servers.firstTime.guidForm.toast.failure'))
      }
    }
  }

  return (
    <div
      className={clsx(
        'flex flex-1 flex-col justify-center border border-dashed border-primary bg-secondary p-4 text-sm text-primary',
        isDraggingOver && 'bg-[#16a34a]',
      )}
      onClick={handleClick}
    >
      {isDraggingOver ? (
        <div className="text-md flex h-16 flex-col items-center">
          <Upload />
        </div>
      ) : (
        <div className="text-md flex h-16 flex-col items-center justify-center">
          <div className="mb-2 flex items-center gap-4">
            <p>
              {t('servers.firstTime.guidForm.title')}:{' '}
              <code className="rounded-md bg-black p-1 text-primary">server.key</code>
            </p>
          </div>
          <div className="flex items-center">
            <p>{t('servers.firstTime.guidForm.click')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
