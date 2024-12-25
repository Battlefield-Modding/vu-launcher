import { fetchVUData } from '@/api'
import { Button } from '@/components/ui/button'
import { open } from '@tauri-apps/plugin-dialog'
import { Download, Play, Search } from 'lucide-react'
import { toast } from 'sonner'

function InstallVU() {
  return (
    <div className="m-auto flex min-h-[100vh] flex-col justify-center">
      <div className="m-auto flex max-h-[500px] max-w-[500px] flex-col justify-between gap-8 rounded-md bg-primary p-8">
        <div className="flex flex-1 justify-center gap-4 align-middle text-3xl leading-9 text-white">
          <h1>VU not found!</h1>
        </div>

        <div className="flex flex-1 justify-center gap-4 align-middle text-xl leading-9 text-white">
          <h1 className="flex-1">VU already installed?</h1>
          <Button
            variant={'secondary'}
            onClick={async () => {
              const dir = await open({
                multiple: false,
                directory: true,
              })
              if (!dir) {
                return
              }
              // await invoke('set_wallpaper_directory', { dir })
            }}
          >
            <Search /> Find VU
          </Button>
        </div>

        <div className="flex flex-1 justify-center gap-4 align-middle text-xl leading-9">
          <h1 className="flex-1 text-white">VU not installed?</h1>
          <Button
            variant={'secondary'}
            className=""
            onClick={async () => {
              fetchVUData()
              // const dir = await open({
              //   multiple: false,
              //   directory: true,
              // })
              // if (!dir) {
              //   return
              // }
              // await invoke('set_wallpaper_directory', { dir })
              toast('Downloading VU...')
            }}
          >
            <Download size={'10px'} />
            <p>Download VU</p>
          </Button>
        </div>

        <Button variant={'destructive'} className="flex p-8 text-2xl" disabled>
          <Play />
          PLAY
        </Button>
      </div>
    </div>
  )
}

export default InstallVU
