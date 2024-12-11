import { getRandomNumber } from '@/api'
import { CardDemo } from '@/components/app-card'
import { DEFAULT_STALE_TIME } from '@/config/config'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader, User } from 'lucide-react'

export default function Home() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['random-num'],
    queryFn: getRandomNumber,
    staleTime: DEFAULT_STALE_TIME,
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

  return (
    <div>
      <CardDemo />
      <h1>Home Route</h1>
      <p>SampleText</p>
      <p>{data as number}</p>
    </div>
  )
}
