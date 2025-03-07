import { vuIsInstalled } from '@/api'
import { QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import InstallVU from './components/InstallVU/InstallVU'
import PlayVUForm from './components/PlayVU/PlayVUForm'
import PlayerCredentialsSheet from './components/PlayerCredentialsSheet/PlayerCredentialsSheet'
import ServerSheet from './components/ServerSheet/ServerSheet'

export default function Home() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.IsVuInstalled],
    queryFn: vuIsInstalled,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>Home Route LOADING</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div>
        <h1>Home Route Error</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  const vuInstalled = data

  if (vuInstalled) {
    return (
      <div className="m-auto flex min-h-[100vh] flex-col justify-center bg-[url(assets/home_background.png)] bg-cover">
        <div className="m-auto flex max-w-96 flex-col justify-between gap-8 rounded-md bg-black p-8">
          <div className="flex justify-between">
            <PlayerCredentialsSheet />
            <ServerSheet />
          </div>
          <PlayVUForm />
        </div>
      </div>
    )
  } else {
    return (
      <div className="m-auto flex min-h-[100vh] flex-col justify-center bg-[url(assets/home_background.png)] bg-cover">
        <InstallVU />
      </div>
    )
  }
}
