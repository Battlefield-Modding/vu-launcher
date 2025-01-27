

export type StartupArgs = {
  admin: Admin,
  vars: Vars
  RM?: RM_Commands | undefined,
  vu?: VU_Commands,
  reservedSlots?: ReservedSlots
}

export type Admin = {
  password: string // RCON password
}

export type Vars = {
  ranked?: boolean | undefined,                            // Change the server between ranked/unranked mode
  serverName: string,                           // Set the server name
  gamePassword?: string | undefined,                     // Set the game password for the server
  autoBalance?: boolean | undefined,                       // Set if the server should autobalance
  roundStartPlayerCount?: number | undefined,          // Set minimum numbers of players to go from warm-up to pre-round/in-round
  roundRestartPlayerCount?: number | undefined,        // Set minimum numbers of players to go from in-round to warm-up
  roundLockdownCountdown?: number | undefined,               // Set the duration of pre-round
  serverMessage?: string | undefined,                    // Set the server welcome message
  friendlyFire?: boolean | undefined,                      // Set if the server should allow team damage
  maxPlayers?: number | undefined,                  // Set desired maximum number of players
  serverDescription?: string | undefined,             // Set server description
  killCam?: boolean | undefined,                           // Set if killcam is enabled
  miniMap?: boolean | undefined,                           // Set if minimap is enabled
  hud?: boolean | undefined,                               // Set if HUD is enabled
  crossHair?: boolean | undefined,                         // Set if crosshair for all weapons is enabled
  _3dSpotting?: boolean | undefined,                        // Set if spotted targets are visible in the 3d-world
  miniMapSpotting?: boolean | undefined,                   // Set if spotted targets are visible on the minimap
  nameTag?: boolean | undefined,                           // Set if nametags should be displayed
  _3pCam?: boolean | undefined,                             // Set if allowing to toggle to third person vehicle cameras
  regenerateHealth?: boolean | undefined,                  // Set if health regeneration should be active
  teamKillCountForKick?: number | undefined,                // Set number of teamkills allowed during a round
  teamKillValueForKick?: number | undefined,                // Set max kill-value allowed for a player before he/she is kicked
  teamKillValuelncrease?: number | undefined,               // Set kill-value increase for a teamkill
  teamKillValueDecreasePerSecond?: number | undefined,      // Set kill-value decrease per second
  teamKillKickForBan?: number | undefined,                  // Set number of team-kill kicks that will lead to permaban
  idleTimeout?: number | undefined,                          // Set idle timeout
  idleBanRounds?: boolean | undefined,                     // Set how many rounds idle timeout should ban (if at all)
  vehicleSpawnAllowed?: boolean | undefined,               // Set whether vehicles should spawn in-game
  vehicleSpawnDelay?: number | undefined,       // Set vehicle spawn delay scale factor
  soldierHealth?: number | undefined,           // Set soldier max health scale factor
  playerRespawnTime?: number | undefined,       // Set player respawn time scale factor
  playerManDownTime?: number | undefined,       // Set player man-down time scale factor
  bulletDamage?: number | undefined,            // Set bullet damage scale factor
  gameModeCounter?: number | undefined,         // Set scale factor for number of tickets to end round
  onlySquadLeaderSpawn?: boolean | undefined,              // Set if players can only spawn on their squad leader
  unlockMode?: any | undefined,                           // Set weapons & gadgets to be available on an unranked server
  premiumStatus?: boolean | undefined,                     // Set if the server should be exclusive to Premium Players
}

export type RM_Commands = {
  setDevelopers: string // Set list of developers, separated by a space
  setAdmins: string // Set list of admins, separated by a space
  setLightAdmins: string // Set list of light-admins, separated by a space
  serverInfo: string // a description for your server
  serverLicenseKey: string // RM Server License Key
  ingameBanner: string // a link to an image
  pingLimitEnable: boolean // activate ping limit
  pingLimitInMs: number // time in ms
  autoPerfEnabled: boolean // activate auto perf
  autoPerfMaxPlayers: number // cutoff for auto perf
  tempReservedSlotsEnabled: boolean // enable automatic rejoining
  tempReservedSlotsRejoinTime: number // how long before rejoin is removed
  defaultPreRoundTime: number // time before round starts
  setAutoBalancer: boolean // autobalance
  battleCryLink: string // link to your battlecry JSON endpoint
}

export type VU_Commands = {
  serverBanner?: string | undefined // link to your server banner image
}

export type ReservedSlots = {
  add: string // list of players to add to reserved slot
}