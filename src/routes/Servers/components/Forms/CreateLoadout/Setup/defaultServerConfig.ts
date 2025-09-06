import { LoadoutJSON } from '@/config/config'
import { StartupArgs } from '../../Startup/Setup/StartupTypes'

export type ServerConfig = {
  name: string
  startup: StartupArgs
  map: {
    mapCode: string
    gameMode: string
  }
  banlist: string[]
}

export const defaultServerConfig: LoadoutJSON = {
  name: '',
  startup: {
    admin: {
      password: '',
    },
    vars: {
      serverName: '',
      gamePassword: '',
      maxPlayers: 64,
    },
  },
  maplist: [
    {
      mapCode: 'MP_001',
      gameMode: 'ConquestLarge0',
    },
  ],
  banlist: ['player0'],
  modlist: [],
  launch: {},
}
