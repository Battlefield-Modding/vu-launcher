import { useQuery } from '@tanstack/react-query'
import { QueryKey, STALE } from '@/config/config'
import { getUserPreferences } from '@/api'
import { Loader } from 'lucide-react'
import LocalServerGuidForm from './components/LocalServerGuidForm'
import { Button } from '@/components/ui/button'
import { ActivateBF3Sheet } from './components/ActivateBF3/ActivateBF3Sheet'

export default function Settings() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.UserPreferences],
    queryFn: getUserPreferences,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>Fetching User Preferences</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive pl-2 pr-2 text-xl leading-9">
        <h1>ERROR: No User Preferences</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100vh] flex-col justify-between bg-primary">
      <div className="flex flex-col gap-8 rounded-md bg-primary p-8 text-white">
        <h1 className="text-center text-4xl">Settings</h1>
        <div>
          <ActivateBF3Sheet />
        </div>
        <LocalServerGuidForm guid={data.server_guid} />
      </div>
    </div>
  )
}
