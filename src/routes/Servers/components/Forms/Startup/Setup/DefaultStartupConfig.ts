import { StartupArgs } from "./StartupTypes";

export type formBuilderTypes = typeof formBuilderInputTypes

export const formBuilderInputTypes = {
  admin: {password: 'textarea'},
  vars: {
    _3dSpotting: 'checkbox',
    _3pCam: 'checkbox',
    autoBalance: 'checkbox',
    bulletDamage: 'number',
    crossHair: 'checkbox',
    friendlyFire: 'checkbox',
    gameModeCounter: 'number',
    gamePassword: 'textarea',
    hud: 'checkbox',
    idleBanRounds: 'checkbox',
    idleTimeout: 'number',
    killCam: 'checkbox',
    maxPlayers: 'number',
    miniMap: 'checkbox',
    miniMapSpotting: 'checkbox',
    nameTag: 'checkbox',
    onlySquadLeaderSpawn: 'checkbox',
    playerManDownTime: 'number',
    playerRespawnTime: 'number',
    premiumStatus: 'checkbox',
    ranked: 'checkbox',
    regenerateHealth: 'checkbox',
    roundLockdownCountdown: 'number',
    roundRestartPlayerCount: 'number',
    roundStartPlayerCount: 'number',
    serverDescription: 'textarea',
    serverMessage: 'textarea',
    serverName: 'textarea',
    soldierHealth: 'number',
    teamKillCountForKick: 'number',
    teamKillKickForBan: 'number',
    teamKillValueDecreasePerSecond: 'number',
    teamKillValueForKick: 'number',
    teamKillValuelncrease: 'number',
    unlockMode: 'none',
    vehicleSpawnAllowed: 'checkbox',
    vehicleSpawnDelay: 'number',
  },
  RM: {
    autoPerfEnabled: 'checkbox',
    autoPerfMaxPlayers: 'number',
    battleCryLink: 'textarea',
    defaultPreRoundTime: 'number',
    ingameBanner: 'textarea',
    pingLimitEnable: 'checkbox',
    pingLimitInMs: 'number',
    serverInfo: 'textarea',
    serverLicenseKey: 'textarea',
    setAdmins: 'textarea',
    setAutoBalancer: 'checkbox',
    setDevelopers: 'textarea',
    setLightAdmins: 'textarea',
    tempReservedSlotsEnabled: 'checkbox',
    tempReservedSlotsRejoinTime: 'number',
  },
  vu: {
    ColorCorrectionEnabled: 'checkbox',
    DesertingAllowed: 'checkbox',
    DestructionEnabled: 'checkbox',
    HighPerformanceReplication: 'checkbox',
    ServerBanner: 'textarea',
    SetTeamTicketCount: 'textarea',
    SquadSize: 'number',
    SunFlareEnabled: 'checkbox',
    SuppressionMultiplier: 'number',
    FriendlyFireSuppression: 'checkbox',
    TimeScale: 'number',
    VehicleDisablingEnabled: 'checkbox',
    HttpAssetUrl: 'textarea',
    DisablePreRound: 'checkbox',
    TeamActivatedMines: 'checkbox',
    CorpseDamageEnabled: 'checkbox',
  },
  reservedSlots: {
    add: 'textarea'
  },
}

export const defaultStartupArguments: StartupArgs = {
  admin: {password: ""},
  vars: {
    _3dSpotting: true,
    _3pCam: true,
    autoBalance: false,
    bulletDamage: 1,
    crossHair: true,
    friendlyFire: false,
    gameModeCounter: 1,
    gamePassword: "",
    hud: true,
    idleBanRounds: false,
    idleTimeout: 9000,
    killCam: true,
    maxPlayers: 100,
    miniMap: true,
    miniMapSpotting: true,
    nameTag: true,
    onlySquadLeaderSpawn: false,
    playerManDownTime: 1,
    playerRespawnTime: 1,
    premiumStatus: false,
    ranked: false,
    regenerateHealth: true,
    roundLockdownCountdown: 10,
    roundRestartPlayerCount: 0,
    roundStartPlayerCount: 8,
    serverDescription: "",
    serverMessage: "",
    serverName: "",
    soldierHealth: 1,
    teamKillCountForKick: 0,
    teamKillKickForBan: 0,
    teamKillValueDecreasePerSecond: 0.01,
    teamKillValueForKick: 2.0,
    teamKillValuelncrease: 0.525,
    unlockMode: undefined,
    vehicleSpawnAllowed: true,
    vehicleSpawnDelay: 1,
  },
  RM: {
    autoPerfEnabled: false,
    autoPerfMaxPlayers: 80,
    battleCryLink: "",
    defaultPreRoundTime: 45,
    ingameBanner: "",
    pingLimitEnable: true,
    pingLimitInMs: 250,
    serverInfo: "",
    serverLicenseKey: "",
    setAdmins: "",
    setAutoBalancer: false,
    setDevelopers: "",
    setLightAdmins: "",
    tempReservedSlotsEnabled: true,
    tempReservedSlotsRejoinTime: 180
  },
  vu: {
    ColorCorrectionEnabled: true,
    DesertingAllowed: false,
    DestructionEnabled: true,
    HighPerformanceReplication: false,
    ServerBanner: "",
    SetTeamTicketCount: "",
    SquadSize: 4,
    SunFlareEnabled: true,
    SuppressionMultiplier: 100,
    FriendlyFireSuppression: false,
    TimeScale: 1.0,
    VehicleDisablingEnabled: true,
    HttpAssetUrl: "",
    DisablePreRound: false,
    TeamActivatedMines: false,
    CorpseDamageEnabled: false,
  },
  reservedSlots: {
    add: ""
  },
}

export const StartupDescriptions = {
  admin: {
    password: "Password used for connecting to server with PROCON"
  },
  vars: {
    ranked:  "Change the server between ranked/unranked mode",
    serverName:  "Set the server name",
    gamePassword:  "Set the game password for the server",
    autoBalance:  "Set if the server should autobalance",
    roundStartPlayerCount:  "Set minimum numbers of players to go from warm-up to pre-round/in-round",
    roundRestartPlayerCount:  "Set minimum numbers of players to go from in-round to warm-up",
    roundLockdownCountdown:  "Set the duration of pre-round",
    serverMessage:  "Set the server welcome message",
    friendlyFire:  "Set if the server should allow team damage",
    maxPlayers:  "Set desired maximum number of players",
    serverDescription:  "Set server description",
    killCam:  "Set if killcam is enabled",
    miniMap:  "Set if minimap is enabled",
    hud:  "Set if HUD is enabled",
    crossHair:  "Set if crosshair for all weapons is enabled",
    _3dSpotting:  "Set if spotted targets are visible in the 3d-world",
    miniMapSpotting:  "Set if spotted targets are visible on the minimap",
    nameTag:  "Set if nametags should be displayed",
    _3pCam:  "Set if allowing to toggle to third person vehicle cameras",
    regenerateHealth:  "Set if health regeneration should be active",
    teamKillCountForKick:  "Set number of teamkills allowed during a round",
    teamKillValueForKick:  "Set max kill-value allowed for a player before he/she is kicked",
    teamKillValuelncrease:  "Set kill-value increase for a teamkill",
    teamKillValueDecreasePerSecond:  "Set kill-value decrease per second",
    teamKillKickForBan:  "Set number of team-kill kicks that will lead to permaban",
    idleTimeout:  "Set idle timeout",
    idleBanRounds:  "Set how many rounds idle timeout should ban (if at all)",
    vehicleSpawnAllowed:  "Set whether vehicles should spawn in-game",
    vehicleSpawnDelay:  "Set vehicle spawn delay scale factor",
    soldierHealth:  "Set soldier max health scale factor",
    playerRespawnTime:  "Set player respawn time scale factor",
    playerManDownTime:  "Set player man-down time scale factor",
    bulletDamage:  "Set bullet damage scale factor",
    gameModeCounter:  "Set scale factor for number of tickets to end round",
    onlySquadLeaderSpawn:  "Set if players can only spawn on their squad leader",
    unlockMode:  "Set weapons & gadgets to be available on an unranked server",
    premiumStatus:  "Set if the server should be exclusive to Premium Players",
  },
  RM: {
    setDevelopers:  "Set list of developers, separated by a space",
    setAdmins:  "Set list of admins, separated by a space",
    setLightAdmins:  "Set list of light-admins, separated by a space",
    serverInfo:  "a description for your server",
    serverLicenseKey:  "RM Server License Key",
    ingameBanner:  "a link to an image",
    pingLimitEnable:  "activate ping limit",
    pingLimitInMs:  "time in ms",
    autoPerfEnabled:  "activate auto perf",
    autoPerfMaxPlayers:  "cutoff for auto perf",
    tempReservedSlotsEnabled:  "enable automatic rejoining",
    tempReservedSlotsRejoinTime:  "how long before rejoin is removed",
    defaultPreRoundTime:  "time before round starts",
    setAutoBalancer:  "autobalance",
    battleCryLink:  "link to your battlecry JSON endpoint",
  },
  vu: {
    ColorCorrectionEnabled: "Enable blue-tint filter",
    DesertingAllowed: "Disable Out Of Bounds",
    DestructionEnabled: "Enable Destruction",
    HighPerformanceReplication: "Update far-away players at same rate as nearby players",
    ServerBanner: "URL for 1378x162 .jpg that appears in server browser",
    SetTeamTicketCount: "Sets team ticket count for a team. Ex: 1 100 would mean you set team1 tickets to 100",
    SquadSize: "Set max players per squad",
    SunFlareEnabled: "Enable sun flare",
    SuppressionMultiplier: "Set suppression intensity [0, infinite]. 0 means disable suppression.",
    FriendlyFireSuppression: "Enable suppression of allies",
    TimeScale: "Slow down or speed up game [0.0, 2.0]. Default is 1.0",
    VehicleDisablingEnabled: "Enable disabled state of vehicles (mobility down and burning)",
    HttpAssetUrl: "A URL pointing to an external HTTP server hosting mod assets, or an empty string if assets should be sent directly from the game server. When this is set, any connecting clients will try to download any needed assets from that URL, following the file structure of the mod files. For example, if you have a mod called mymod and it has a WebUI container file (ui.vuic), and you set the URL to https://example.com/assets/, the client will try to download the file from https://example.com/assets/mymod/ui.vuic. If file downloads fail or their contents don't match what's on the game server, clients will be unable to join.",
    DisablePreRound: "Disable time before round starts (waiting for players 1/10)",
    TeamActivatedMines: "Enable mines killing allies",
    CorpseDamageEnabled: "Enables corpse damage, preventing revival.(Tip: Tweak VeniceSoldierHealthModuleData.manDownStateHealthPoints with a mod.)",
  },
  reservedSlots: {
    add: "list of players to add to reserved slot separated by comma ,"
  }
}