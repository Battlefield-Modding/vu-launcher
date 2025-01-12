import VSCodeIcon from '@/assets/VSCodeIcon.svg'
import DeleteModDialog from './DeleteModDialog'
import { toast } from 'sonner'
import { openModWithVsCode } from '@/api'

function Mod({ modName, loadoutName }: { modName: string; loadoutName: string }) {
  async function handleOpenInVSCode() {
    const status = await openModWithVsCode({ name: loadoutName, modname: modName })
    if (status) {
      toast(`Opened ${modName} in vscode`)
    } else {
      toast(`Failed to open ${modName} in vscode`)
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-8 rounded-md bg-primary p-2 text-white">
      <h1>{modName.length >= 20 ? `${modName.substring(0, 20)}...` : modName}</h1>
      <div className="flex justify-end">
        {modName.includes('.zip') ? (
          <></>
        ) : (
          <p
            className="flex flex-1 rounded-md bg-sidebar-foreground p-1.5 hover:cursor-pointer hover:bg-sidebar-foreground/80"
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
