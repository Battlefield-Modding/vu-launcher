import { DeleteModDialog } from '../dialog/DeleteModDialog'
import { AddModDialog } from '../dialog/AddModDialog'
import { GameMod, LoadoutJSON } from '@/config/config'
import { useTranslation } from 'react-i18next'

export function ModCacheMod({
  mod,
  loadout,
  queryKey,
}: {
  mod: GameMod
  loadout: LoadoutJSON
  queryKey: string
}) {
  const { t } = useTranslation()

  return (
    <tr className="border border-secondary">
      <td className="border border-secondary">
        {t('servers.loadouts.loadout.mods.sheet.modCache')}
      </td>

      <td className="border border-secondary">{mod.name}</td>

      <td className="border border-secondary">
        <code className="text-md text-nowrap rounded-md bg-gray-800 p-1 pl-2 pr-2 text-primary">
          {mod.version}
        </code>
      </td>

      <td className="flex justify-center">
        <AddModDialog loadout={loadout} mod={mod} queryKey={queryKey} />
        <DeleteModDialog
          loadoutName={'mod-cache'}
          modName={`${mod.name}-${mod.version}`}
          queryKey={queryKey}
        />
      </td>
    </tr>
  )
}
