import { useEffect, useState } from 'react'

import { listen, UnlistenFn } from '@tauri-apps/api/event'
import clsx from 'clsx'
import { Search, Upload } from 'lucide-react'
import { DragDropEventTauri } from '@/config/config'
import { toast } from 'sonner'
import { open } from '@tauri-apps/plugin-dialog'

export default function LoadoutUpload({ setPath }: { setPath: (state: string) => void }) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
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
        const confirmed = await confirm('Copying Server Loadout from' + installPath + '?')

        if (confirmed) {
          setPath(installPath)
        }
      } else {
        toast('Incorrect directory. Please choose the Server folder which contains Admin/mods/...')
      }
    }
  }

  return (
    <div
      className={clsx(
        'flex flex-1 flex-col justify-center border-2 border-dashed border-secondary bg-sidebar-foreground text-center text-white',
        isDraggingOver && 'bg-green-400/50',
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
              Drag n Drop <code className="rounded-md bg-primary p-1 text-white">\Server</code> here
            </p>
            <Upload />
          </div>
          <div className="flex gap-2">
            <p>Click to search instead</p>
            <Search />
          </div>
        </div>
      )}
    </div>
  )
}
