import DiscoverMods from './components/DiscoverMods'
import ImportModsSheet from './components/ImportModsSheet/ImportModsSheet'
import ManageModsSheet from './components/ManageModsSheet.tsx/ManageModsSheet'

export default function Mods() {
  return (
    <div className="flex min-h-[100vh] flex-col justify-center bg-primary">
      <DiscoverMods />
      <div className="flex justify-center gap-8">
        <ImportModsSheet />
        <ManageModsSheet />
      </div>
    </div>
  )
}
