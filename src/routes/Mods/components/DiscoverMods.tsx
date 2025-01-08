import { Button } from '@/components/ui/button'
import GithubIcon from '@/assets/GithubIcon.svg'
import DiscordIcon from '@/assets/DiscordIcon.svg'
import VUIcon from '@/assets/VUIcon.svg'
import { Globe } from 'lucide-react'

function DiscoverMods() {
  return (
    <div className="flex flex-col gap-8 rounded-md bg-primary p-8 text-white">
      <h1 className="text-center text-4xl">Discover Mods</h1>
      <div className="flex flex-col gap-8">
        <a href="https://github.com/topics/venice-unleashed" target="_blank" className="flex">
          <Button variant={'secondary'} className="w-full flex-1 p-8 text-2xl">
            <Globe />
            Github <img src={GithubIcon} className="w-8" />
          </Button>
        </a>

        <a href="https://community.veniceunleashed.net/c/modding/releases/13">
          <Button variant={'secondary'} className="w-full flex-1 p-8 text-2xl">
            <Globe />
            VU Forums <img src={VUIcon} className="w-8 rounded bg-black p-1 pb-2 pt-2" />
          </Button>
        </a>

        <a
          href="discord://https://discord.com/channels/125257766649593856/721729208832884747"
          className="flex"
        >
          <Button variant={'secondary'} className="w-full flex-1 p-8 text-2xl">
            VU Discord <img src={DiscordIcon} className="w-8" />
          </Button>
        </a>
      </div>
    </div>
  )
}

export default DiscoverMods
