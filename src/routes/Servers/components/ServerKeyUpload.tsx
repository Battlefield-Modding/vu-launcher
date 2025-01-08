import React, { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { getCurrentWebview } from '@tauri-apps/api/webview'
import { listen, UnlistenFn } from '@tauri-apps/api/event'
import { serverKeySetup } from '@/api'
import clsx from 'clsx'
import { Droplet, Search, Upload } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { QueryKey } from '@/config/config'
import { toast } from 'sonner'
import { open } from '@tauri-apps/plugin-dialog'

export default function ServerKeyUpload() {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
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
      handleDrop = await listen<DropPayload>('tauri://drag-drop', async (event) => {
        setIsDraggingOver(() => false)
        if (
          event.payload &&
          event.payload.paths[0] &&
          event.payload.paths[0].includes('server.key')
        ) {
          const info = await serverKeySetup(event.payload.paths[0] as String)
          if (info) {
            queryClient.invalidateQueries({
              queryKey: [QueryKey.ServerKeyExists],
              refetchType: 'all',
            })
            toast('Successfully imported server key.')
            cleanupListeners()
          }
        } else {
          toast('Incorrect File. Please use server.key')
        }
      })

      handleDragEnter = await listen<DropPayload>('tauri://drag-enter', () => {
        setIsDraggingOver(() => true)
        console.log('dragging')
      })

      handleDragLeave = await listen<DropPayload>('tauri://drag-leave', () =>
        setIsDraggingOver(() => false),
      )
    })()

    return () => {
      cleanupListeners()
    }
  }, [])

  return (
    <div
      className={clsx(
        'flex flex-1 flex-col justify-center border-2 border-dashed border-secondary bg-sidebar-foreground text-center text-white',
        isDraggingOver && 'bg-green-400/50',
      )}
      onClick={async () => {
        const installPath = await open({
          multiple: false,
          directory: true,
        })
        if (installPath) {
          if (installPath.includes('server.key')) {
            const confirmed = await confirm('Copying server key from' + installPath + '?')

            if (confirmed) {
              const info = await serverKeySetup(installPath)
              if (info) {
                queryClient.invalidateQueries({
                  queryKey: [QueryKey.ServerKeyExists],
                  refetchType: 'all',
                })
                toast('Successfully imported server key.')
                cleanupListeners()
              }
            }
          } else {
            toast('Incorrect File. Please use server.key')
          }
        }
      }}
    >
      {isDraggingOver ? (
        <div className="text-md m-auto flex flex-col gap-8">
          <Upload className="h-32 w-32" />
        </div>
      ) : (
        <div className="text-md m-auto flex flex-col gap-8">
          <div className="flex gap-4">
            <p>
              Drag n Drop your{' '}
              <code className="rounded-md bg-primary p-1 text-white">server.key</code> here
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
