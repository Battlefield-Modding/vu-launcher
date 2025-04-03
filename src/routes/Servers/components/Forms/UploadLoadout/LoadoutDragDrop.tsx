import { useEffect, useState } from 'react'

import { listen, UnlistenFn } from '@tauri-apps/api/event'
import clsx from 'clsx'
import { Search, Upload } from 'lucide-react'
import { DragDropEventTauri } from '@/config/config'
import { toast } from 'sonner'
import { open } from '@tauri-apps/plugin-dialog'
import { useTranslation } from 'react-i18next'

export function LoadoutDragDrop({ setPath }: { setPath: (state: string) => void }) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const { t } = useTranslation()

  let handleDrop: UnlistenFn | undefined
  let handleDragEnter: UnlistenFn | undefined
  let handleDragLeave: UnlistenFn | undefined

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

        if (payload && payload.paths[0] && payload.paths[0].includes('Server')) {
          setPath(payload.paths[0])
        } else {
          toast(t('servers.loadouts.importLoadout.form.dragDrop.toast.invalid'))
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
      if (installPath.includes('Server')) {
        setPath(installPath)
      } else {
        toast(t('servers.loadouts.importLoadout.form.dragDrop.toast.invalid'))
      }
    }
  }

  return (
    <div
      className={clsx(
        'flex h-64 max-h-40 flex-1 flex-col justify-center border-2 border-dashed border-primary bg-secondary text-center text-white',
        isDraggingOver && 'bg-[#16a34a]',
      )}
      onClick={handleClick}
    >
      {isDraggingOver ? (
        <div className="text-md m-auto flex flex-col gap-8">
          <Upload className="h-32 w-32" />
        </div>
      ) : (
        <div className="text-md m-auto flex flex-col gap-8">
          <div className="flex gap-4">
            <p>
              {t('servers.loadouts.importLoadout.form.dragDrop.title')}:{' '}
              <code className="rounded-md bg-black p-1">\Server</code>
            </p>
            <Upload />
          </div>
          <div className="flex gap-2">
            <p>{t('servers.loadouts.importLoadout.form.dragDrop.search')}</p>
            <Search />
          </div>
        </div>
      )}
    </div>
  )
}
