import VSCodeIcon from '@/assets/VSCodeIcon.svg'
import DeleteModDialog from './DeleteModDialog'
import { toast } from 'sonner'
import { openModWithVsCode } from '@/api'
import { useTranslation } from 'react-i18next'

function Mod({ modName, loadoutName }: { modName: string; loadoutName: string }) {
  const { t } = useTranslation()
  async function handleOpenInVSCode() {
    const status = await openModWithVsCode({ name: loadoutName, modname: modName })
    if (status) {
      toast(`${modName} ${t('mods.manage.sheet.mod.toast.success')}`)
    } else {
      toast(`${modName} ${t('mods.manage.sheet.mod.toast.failure')}`)
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-8 rounded-md bg-secondary p-2 text-white">
      <h1>{modName.length >= 20 ? `${modName.substring(0, 20)}...` : modName}</h1>
      <div className="flex justify-end">
        {modName.includes('.zip') ? (
          <></>
        ) : (
          <p
            className="flex flex-1 rounded-md bg-sidebar p-1.5 hover:cursor-pointer hover:bg-sidebar/80"
            onClick={handleOpenInVSCode}
          >
            <img src={VSCodeIcon} className="m-auto"></img>
          </p>
        )}

        <DeleteModDialog loadoutName={loadoutName} modName={modName} />
      </div>
    </div>
  )
}

export default Mod
