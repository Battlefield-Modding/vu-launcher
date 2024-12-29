import { Button } from '@/components/ui/button'
import { Edit, Plus } from 'lucide-react'
import ServerSheet from './components/server-sheet'

export default function Servers() {
  // if no server loadouts found
  return (
    <div className="m-auto flex min-h-[100vh] flex-col justify-center">
      <div className="m-auto flex max-h-96 max-w-96 flex-col justify-between gap-8 rounded-md bg-primary p-8 text-white">
        <ServerSheet />
      </div>
    </div>
  )
}
