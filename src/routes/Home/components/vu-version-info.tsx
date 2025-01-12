import { fetchVUData, fetchVUDataDummy } from '@/api'
import { STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'

function VuVersionInfo() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['vu-version-info'],
    queryFn: fetchVUDataDummy,
    staleTime: STALE.default,
  })

  if (isPending) {
    return (
      <div className="m-auto flex flex-col justify-between rounded-md bg-primary p-8 text-white">
        <Loader />
      </div>
    )
  }

  if (isError) {
    ;<div className="m-auto flex max-h-[500px] max-w-[500px] flex-col justify-between gap-8 rounded-md bg-primary p-8">
      <div className="flex flex-1 justify-center gap-4 align-middle text-3xl leading-9 text-white">
        <h1>Could not load VU version info!</h1>
      </div>
    </div>
  }

  return (
    <div className="m-auto flex max-h-[500px] max-w-[500px] flex-col justify-between gap-8 rounded-md bg-primary p-8">
      <div className="flex flex-1 justify-center gap-4 align-middle text-3xl leading-9 text-white">
        <h1>VU Version Info!</h1>
      </div>

      <div className="flex flex-1 justify-center gap-4 align-middle text-xl leading-9 text-white">
        <h1 className="flex-1">Installed Version:</h1>
        <p>{data?.buildnum}</p>
      </div>

      <div className="flex flex-1 justify-center gap-4 align-middle text-xl leading-9 text-white">
        <h1 className="flex-1">Latest Version:</h1>
        <p>{data?.buildnum}</p>
      </div>

      <Button variant={'secondary'}>Update VU</Button>
    </div>
  )
}

export default VuVersionInfo
