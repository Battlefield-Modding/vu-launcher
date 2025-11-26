import { LoadoutJSON } from '@/config/config'
import ImportModsSheet from '@/routes/Mods/components/ImportModsSheet/ImportModsSheet'
import { LoadoutModContainer } from './mods/LoadoutModContainer'
import { CacheModContainer } from './mods/CacheModContainer'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

function ManageModsInServerForm({ loadout }: { loadout: LoadoutJSON }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <div
      className={clsx(
        'm-auto flex max-w-screen-lg flex-col gap-2 text-center transition-all duration-700 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
      )}
    >
      <div className="m-auto w-fit">
        <ImportModsSheet importToLoadout={true} loadoutName={loadout.name} />
      </div>

      <LoadoutModContainer loadoutName={loadout.name} />

      <CacheModContainer loadout={loadout} />
    </div>
  )
}

export default ManageModsInServerForm
