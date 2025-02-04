import { DeleteModDialog } from './DeleteModDialog'
import { AddModDialog } from './AddModDialog'

export function ModCacheMod({
  modName,
  loadoutName,
  queryKey,
}: {
  modName: string
  loadoutName: string
  queryKey: string
}) {
  return (
    <div className="mt-4 flex flex-col gap-4 rounded-md bg-secondary p-4">
      <div className="flex flex-col items-center">
        <h1 className="">{modName.length >= 20 ? `${modName.substring(0, 20)}...` : modName}</h1>
      </div>
      <div className="flex justify-end">
        <AddModDialog loadoutName={loadoutName} modName={modName} />
        <DeleteModDialog loadoutName={loadoutName} modName={modName} queryKey={queryKey} />
      </div>
    </div>
  )
}
