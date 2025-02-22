import { StartupArgs } from "./StartupTypes";

export type formBuilderTypes = typeof formBuilderInputTypes

export const formBuilderInputTypes = {
  admin: {password: 'text'},
  vars: {
    _3dSpotting: 'checkbox',
    _3pCam: 'checkbox',
    autoBalance: 'checkbox',
    bulletDamage: 'number',
    crossHair: 'checkbox',
    friendlyFire: 'checkbox',
    gameModeCounter: 'number',
    gamePassword: 'text',
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
    ranked: 'checkbox',
    regenerateHealth: 'checkbox',
    roundLockdownCountdown: 'number',
    roundRestartPlayerCount: 'number',
    roundStartPlayerCount: 'number',
    serverDescription: 'textarea',
    serverMessage: 'textarea',
    serverName: 'text',
    soldierHealth: 'number',
    teamKillCountForKick: 'number',
    teamKillKickForBan: 'number',
    teamKillValueDecreasePerSecond: 'number',
    teamKillValueForKick: 'number',
    teamKillValuelncrease: 'number',
    // unlockMode: 'none',
    vehicleSpawnAllowed: 'checkbox',
    vehicleSpawnDelay: 'number',
  },
  RM: {
    autoPerfEnabled: 'checkbox',
    autoPerfMaxPlayers: 'number',
    battleCryLink: 'text',
    defaultPreRoundTime: 'number',
    ingameBanner: 'text',
    pingLimitEnable: 'checkbox',
    pingLimitInMs: 'number',
    serverInfo: 'text',
    serverLicenseKey: 'text',
    setAdmins: 'text',
    setAutoBalancer: 'checkbox',
    setDevelopers: 'text',
    setLightAdmins: 'text',
    tempReservedSlotsEnabled: 'checkbox',
    tempReservedSlotsRejoinTime: 'number',
  },
  vu: {
    ColorCorrectionEnabled: 'checkbox',
    DesertingAllowed: 'checkbox',
    DestructionEnabled: 'checkbox',
    HighPerformanceReplication: 'checkbox',
    ServerBanner: 'text',
    SetTeamTicketCount: 'setTeamTicketCount',
    SquadSize: 'number',
    SunFlareEnabled: 'checkbox',
    SuppressionMultiplier: 'number',
    FriendlyFireSuppression: 'checkbox',
    TimeScale: 'number',
    VehicleDisablingEnabled: 'checkbox',
    HttpAssetUrl: 'text',
    DisablePreRound: 'checkbox',
    TeamActivatedMines: 'checkbox',
    CorpseDamageEnabled: 'checkbox',
  },
  reservedSlots: 'reservedSlots' ,
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
    // unlockMode: undefined,
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
    SetTeamTicketCount: [],
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
  reservedSlots: [""],
}

export const StartupDescriptions = {
  admin: {
    password: "Set RCON Password for Procon"
  },
  vars: {
    ranked:  "Enable ranked",
    serverName:  "Set server name",
    gamePassword:  "Set password for joining server",
    autoBalance:  "Enable Autobalance",
    roundStartPlayerCount:  "Set min players to activate pre-round/in-round",
    roundRestartPlayerCount:  "Set min players numbers to revert to warm-up",
    roundLockdownCountdown:  "Set pre-round duration",
    serverMessage:  "Set server welcome message",
    friendlyFire:  "Enable team damage",
    maxPlayers:  "Set max players",
    serverDescription:  "Set server description",
    killCam:  "Enable killcam",
    miniMap:  "Enable minimap",
    hud:  "Enable HUD",
    crossHair:  "Enable crosshair for all weapons",
    _3dSpotting:  "Enable 3d markers over spotted enemies",
    miniMapSpotting:  "Enable spotted enemies on minimap",
    nameTag:  "Enable nametags",
    _3pCam:  "Enable 3rd person vehicle camera",
    regenerateHealth:  "Enable health regeneration",
    teamKillCountForKick:  "Set number of teamkills allowed during a round",
    teamKillValueForKick:  "Set max kill-value allowed for a player before he/she is kicked",
    teamKillValuelncrease:  "Set kill-value increase for a teamkill",
    teamKillValueDecreasePerSecond:  "Set kill-value decrease per second",
    teamKillKickForBan:  "Set number of team-kill kicks that will lead to permaban",
    idleTimeout:  "Set idle timeout",
    idleBanRounds:  "Set how many rounds idle timeout should ban (if at all)",
    vehicleSpawnAllowed:  "Enable vehicles to spawn",
    vehicleSpawnDelay:  "Set vehicle spawn delay scale factor",
    soldierHealth:  "Set soldier max health scale factor",
    playerRespawnTime:  "Set player respawn time scale factor",
    playerManDownTime:  "Set player man-down time scale factor",
    bulletDamage:  "Set bullet damage scale factor",
    gameModeCounter:  "Set scale factor for number of tickets to end round",
    onlySquadLeaderSpawn:  "Disable squadmate spawns except squadleader",
    // unlockMode:  "Set weapons & gadgets to be available on an unranked server",
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
    DesertingAllowed: "Disable Out of Bounds",
    DestructionEnabled: "Enable Destruction",
    HighPerformanceReplication: "Enable high-performance updates on far away players",
    ServerBanner: "Set browser banner URL pointing to 1378x162 jpg",
    SetTeamTicketCount: "Set team ticket count for a team.",
    SquadSize: "Set max players per squad",
    SunFlareEnabled: "Enable sun flare",
    SuppressionMultiplier: "Set suppression intensity [0, infinite]",
    FriendlyFireSuppression: "Enable suppression of allies",
    TimeScale: "Slow down or speed up game [0.0, 2.0]",
    VehicleDisablingEnabled: "Enable mobility hits on vehicles",
    HttpAssetUrl: "Set URL pointing to remote [ui.vuic] instead of downloading from game server",
    DisablePreRound: "Disable waiting for players",
    TeamActivatedMines: "Enable mines to trigger on allies",
    CorpseDamageEnabled: "Enables corpse damage to prevent revives",
  },
  reservedSlots: {
    add: "list of players to add to reserved slot separated by comma ,"
  }
}