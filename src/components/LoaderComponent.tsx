import { Loader2Icon } from 'lucide-react'

export function LoaderComponent() {
  return (
    <div className="fixed bottom-0 left-0 flex min-h-[100vh] w-full flex-col bg-black bg-opacity-50">
      <div className="m-auto flex flex-col items-center">
        <p className="text-2xl">Loading... </p>
        <Loader2Icon className="h-16 w-16 animate-spin" />
      </div>
    </div>
  )
}
