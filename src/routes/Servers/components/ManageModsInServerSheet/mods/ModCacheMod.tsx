import { DeleteModDialog } from '../dialog/DeleteModDialog'
import { AddModDialog } from '../dialog/AddModDialog'
import { LoadoutJSON } from '@/config/config'

export function ModCacheMod({
  modName,
  loadout,
  queryKey,
}: {
  modName: string
  loadout: LoadoutJSON
  queryKey: string
}) {
  return (
    <div className="mt-4 flex flex-col gap-4 rounded-md bg-secondary p-4">
      <div className="flex flex-col items-center">
        <h1 className="">{modName.length >= 20 ? `${modName.substring(0, 20)}...` : modName}</h1>
      </div>
      <div className="flex justify-end">
        <AddModDialog loadout={loadout} modName={modName} queryKey={queryKey} />
        <DeleteModDialog loadoutName={'mod-cache'} modName={modName} queryKey={queryKey} />
      </div>
    </div>
  )
}
