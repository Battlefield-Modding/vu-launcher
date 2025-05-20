export type StartupArgs = {
  admin: Admin
  vars: Vars
  RM?: RM_Commands
  vu?: VU_Commands
  reservedSlots?: Array<string>
}

export type Admin = {
  password: string // RCON password
}

export type Vars = {
  ranked?: boolean | undefined // Change the server between ranked/unranked mode
  serverName: string // Set the server name
  gamePassword?: string | undefined // Set the game password for the server
  autoBalance?: boolean | undefined // Set if the server should autobalance
  roundStartPlayerCount?: number | undefined // Set minimum numbers of players to go from warm-up to pre-round/in-round
  roundRestartPlayerCount?: number | undefined // Set minimum numbers of players to go from in-round to warm-up
  roundLockdownCountdown?: number | undefined // Set the duration of pre-round
  serverMessage?: string | undefined // Set the server welcome message
  friendlyFire?: boolean | undefined // Set if the server should allow team damage
  maxPlayers?: number | undefined // Set desired maximum number of players
  serverDescription?: string | undefined // Set server description
  killCam?: boolean | undefined // Set if killcam is enabled
  miniMap?: boolean | undefined // Set if minimap is enabled
  hud?: boolean | undefined // Set if HUD is enabled
  crossHair?: boolean | undefined // Set if crosshair for all weapons is enabled
  _3dSpotting?: boolean | undefined // Set if spotted targets are visible in the 3d-world
  miniMapSpotting?: boolean | undefined // Set if spotted targets are visible on the minimap
  nameTag?: boolean | undefined // Set if nametags should be displayed
  _3pCam?: boolean | undefined // Set if allowing to toggle to third person vehicle cameras
  regenerateHealth?: boolean | undefined // Set if health regeneration should be active
  teamKillCountForKick?: number | undefined // Set number of teamkills allowed during a round
  teamKillValueForKick?: number | undefined // Set max kill-value allowed for a player before he/she is kicked
  teamKillValuelncrease?: number | undefined // Set kill-value increase for a teamkill
  teamKillValueDecreasePerSecond?: number | undefined // Set kill-value decrease per second
  teamKillKickForBan?: number | undefined // Set number of team-kill kicks that will lead to permaban
  idleTimeout?: number | undefined // Set idle timeout
  idleBanRounds?: boolean | undefined // Set how many rounds idle timeout should ban (if at all)
  vehicleSpawnAllowed?: boolean | undefined // Set whether vehicles should spawn in-game
  vehicleSpawnDelay?: number | undefined // Set vehicle spawn delay scale factor
  soldierHealth?: number | undefined // Set soldier max health scale factor
  playerRespawnTime?: number | undefined // Set player respawn time scale factor
  playerManDownTime?: number | undefined // Set player man-down time scale factor
  bulletDamage?: number | undefined // Set bullet damage scale factor
  gameModeCounter?: number | undefined // Set scale factor for number of tickets to end round
  onlySquadLeaderSpawn?: boolean | undefined // Set if players can only spawn on their squad leader
  // unlockMode?: any | undefined,                           // Set weapons & gadgets to be available on an unranked server
}

export type RM_Commands = {
  setDevelopers: string[] // Set list of developers, separated by a space
  setAdmins: string[] // Set list of admins, separated by a space
  setLightAdmins: string[] // Set list of light-admins, separated by a space
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
  enableEnemyLocalVoip: boolean
}

export type VU_Commands = {
  ColorCorrectionEnabled?: boolean // Accepts a single boolean argument (true or false) that specifies whether the blue-tint filter should be enabled or not.
  DesertingAllowed?: boolean // Accepts a single boolean argument (true or false) which specifies whether players are allowed to exit the combat area or not. When set to true the combat area will be disabled and players will not be killed for exiting it.
  DestructionEnabled?: boolean // Accepts a single boolean argument (true or false) which toggles destruction. When set to false, all destruction on the server will be disabled.
  HighPerformanceReplication?: boolean // Accepts a single boolean argument (true or false) that specifies whether high performance replication should be enabled or not. Normally, the server will reduce the amount of updates it sends for players that are further away from other players. Setting this to true will make the server send updates at the same rate for all players. This also results in an increase in network activity.
  ServerBanner?: string // A URL pointing to a custom server banner image that will be shown to users in the VU server browser. This must be an http or https URL pointing to a JPEG image with the .jpg extension. The recommended resolution for banner images is 1378x162. Using inappropriate or hateful images will result in your server being delisted and your server hosting privileges being revoked.
  SetTeamTicketCount?: Array<{ teamId: string; ticketCount: number }> // Accepts two arguments: a team number and the number of tickets that team should have. For example, to set the tickets of team 1 to 120 you would execute the following command: SetTeamTicketCount 1 120
  SquadSize?: number // Accepts a single integer argument (1 or higher) which sets the maximum amount of players per squad.
  SunFlareEnabled?: boolean // Accepts a single boolean argument (true or false) that specifies whether the sun flare should be enabled or not.
  SuppressionMultiplier?: number // Accepts a single integer argument (0 or higher) that specifies a multiplier for the suppression effect. Setting this to 0 completely disables suppression (both visually and for weapon spread).
  FriendlyFireSuppression?: boolean // Accepts a single boolean argument (true or false) that specifies whether friendly fire should be suppressed as well.
  TimeScale?: number // Accepts a single numeric argument (0.0 to 2.0) that specifies the relative time scale for all players. Values lower than 1.0 make the game slower, values higher 1.0 make the game faster.
  VehicleDisablingEnabled?: boolean // Accepts a single boolean argument (true or false) which toggles whether vehicles can enter the disabled state or not. When set to false, vehicles will no longer get disabled (and drain health) when they reach low health status.
  HttpAssetUrl?: string // A URL pointing to an external HTTP server hosting mod assets, or an empty string if assets should be sent directly from the game server. When this is set, any connecting clients will try to download any needed assets from that URL, following the file structure of the mod files. For example, if you have a mod called mymod and it has a WebUI container file (ui.vuic), and you set the URL to https://example.com/assets/, the client will try to download the file from https://example.com/assets/mymod/ui.vuic. If file downloads fail or their contents don't match what's on the game server, clients will be unable to join.
  DisablePreRound?: boolean // Accepts a single boolean argument (true or false). This has to be used before the level gets loaded. When set to true the preround will be disabled on the next level (re)load.
  TeamActivatedMines?: boolean // Allows you to control whether team members can trigger claymores and other mines. Accepts a single boolean argument, either true or false, to toggle the feature on or off.
  CorpseDamageEnabled?: boolean // Enables or disables the ability to deal damage to a corpse, preventing revival. Accepts a single boolean argument, either true or false, to control whether damage to a corpse is permitted or not. (Tip: Tweak VeniceSoldierHealthModuleData.manDownStateHealthPoints with a mod.)
}
