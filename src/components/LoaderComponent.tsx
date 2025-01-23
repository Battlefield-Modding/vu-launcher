import { Loader2Icon } from 'lucide-react'

export function LoaderComponent() {
  return (
    <div className="fixed bottom-10 flex w-full justify-center rounded-md bg-gray-300 bg-opacity-90 p-8">
      <p className="mt-3 text-2xl">Loading... </p>
      <Loader2Icon className="h-16 w-16 animate-spin" />
    </div>
  )
}
