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
    <div className="flex items-center gap-2">
      <h1 className="ml-0 mr-auto">{modName}</h1>
      <AddModDialog loadout={loadout} modName={modName} queryKey={queryKey} />
      <DeleteModDialog loadoutName={'mod-cache'} modName={modName} queryKey={queryKey} />
    </div>
  )
}
