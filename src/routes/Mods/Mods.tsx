import { AnimatedLayout } from '@/components/AnimatedLayout'
import DiscoverMods from './components/DiscoverMods'

export default function Mods() {
  return (
    <AnimatedLayout>
      <div className="ml-[56px] flex min-h-[100vh] flex-col justify-center">
        <DiscoverMods />
      </div>
    </AnimatedLayout>
  )
}
