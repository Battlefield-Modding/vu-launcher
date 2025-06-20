import { DeleteModDialog } from '../dialog/DeleteModDialog'
import { AddModDialog } from '../dialog/AddModDialog'
import { GameMod, LoadoutJSON } from '@/config/config'

export function ModCacheMod({
  mod,
  loadout,
  queryKey,
}: {
  mod: GameMod
  loadout: LoadoutJSON
  queryKey: string
}) {
  return (
    <div className="flex items-center gap-2">
      <h1 className="ml-0 mr-auto">{`${mod.name}-${mod.version}`}</h1>
      <AddModDialog loadout={loadout} mod={mod} queryKey={queryKey} />
      <DeleteModDialog
        loadoutName={'mod-cache'}
        modName={`${mod.name}-${mod.version}`}
        queryKey={queryKey}
      />
    </div>
  )
}
