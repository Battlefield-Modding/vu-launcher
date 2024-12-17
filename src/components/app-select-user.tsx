import { getUsers } from '@/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'

export default function AppSelectUser() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['select-users'],
    queryFn: getUsers,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>LOADING USERS</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive pl-2 pr-2 text-xl leading-9">
        <h1>No Users Found</h1>
      </div>
    )
  }
  // const users = await getUsers()
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={data[0].username} />
      </SelectTrigger>
      <SelectContent>
        {data.map((item) => {
          return (
            <SelectItem key={item.username} value={item.username}>
              {item.username}
            </SelectItem>
          )
        })}
        {/* <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem> */}
      </SelectContent>
    </Select>
  )
}
