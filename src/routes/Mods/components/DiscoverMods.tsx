import { Button } from '@/components/ui/button'
import GithubIcon from '@/assets/GithubIcon.svg'
import DiscordIcon from '@/assets/DiscordIcon.svg'
import VUIcon from '@/assets/VUIcon.svg'
import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ImportModsSheet from './ImportModsSheet/ImportModsSheet'
import ManageModsSheet from './ManageModsSheet.tsx/ManageModsSheet'

function DiscoverMods() {
  const { t } = useTranslation()
  return (
    <div className="ml-auto mr-auto flex w-fit flex-col gap-8 rounded-md p-8">
      <h1 className="text-center text-4xl">{t('mods.discover.title')}</h1>
      <div className="flex flex-col gap-8">
        <a href="https://github.com/topics/venice-unleashed" target="_blank" className="flex">
          <Button className="w-full flex-1 p-8 text-2xl">
            <Globe />
            {t('mods.discover.github')} <img src={GithubIcon} className="w-8" />
          </Button>
        </a>

        <a
          href="https://community.veniceunleashed.net/c/modding/releases/13"
          target="_blank"
          className="flex"
        >
          <Button className="w-full flex-1 p-8 text-2xl">
            <Globe />
            {t('mods.discover.forums')}{' '}
            <img src={VUIcon} className="w-8 rounded bg-black p-1 pb-2 pt-2" />
          </Button>
        </a>

        <a
          href="discord://https://discord.com/channels/125257766649593856/721729208832884747"
          className="flex"
        >
          <Button className="w-full flex-1 p-8 text-2xl">
            {t('mods.discover.discord')} <img src={DiscordIcon} className="w-8" />
          </Button>
        </a>
      </div>
      <div className="flex justify-center gap-8">
        <ImportModsSheet />
        <ManageModsSheet />
      </div>
    </div>
  )
}

export default DiscoverMods
