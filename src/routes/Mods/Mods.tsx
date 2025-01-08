import DiscoverMods from './components/DiscoverMods'
import ImportModsSheet from './components/ImportModsSheet/ImportModsSheet'
import ManageModsSheet from './components/ManageModsSheet.tsx/ManageModsSheet'
import VUMMSheet from './components/VUMMSheet.tsx/VUMMSheet'

export default function Mods() {
  return (
    <div className="flex min-h-[100vh] flex-col justify-between bg-primary">
      <DiscoverMods />
      <div className="flex justify-center gap-8">
        <VUMMSheet />
        <ImportModsSheet />
        <ManageModsSheet />
      </div>
    </div>
  )
}
