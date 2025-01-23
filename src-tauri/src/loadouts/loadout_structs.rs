pub struct LoadoutJson {
    startup: StartupArgs,
    // TODO: add rest of loadout to this struct
}

pub struct Admin {
    password: String, // This is RCON password for remote admin.
}

#[allow(non_snake_case)]
pub struct Vars {
    ranked: Option<bool>,         // Change the server between ranked/unranked mode
    serverName: String,           // Set the server name
    gamePassword: Option<String>, // Set the game password for the server
    autoBalance: Option<bool>,    // Set if the server should autobalance
    roundStartPlayerCount: Option<u32>, // Set minimum numbers of players to go from warm-up to pre-round/in-round
    roundRestartPlayerCount: Option<u32>, // Set minimum numbers of players to go from in-round to warm-up
    roundLockdownCountdown: Option<u32>,  // Set the duration of pre-round
    serverMessage: Option<String>,        // Set the server welcome message
    friendlyFire: Option<bool>,           // Set if the server should allow team damage
    maxPlayers: Option<u32>,              // Set desired maximum number of players
    serverDescription: Option<String>,    // Set server description
    killCam: Option<bool>,                // Set if killcam is enabled
    miniMap: Option<bool>,                // Set if minimap is enabled
    hud: Option<bool>,                    // Set if HUD is enabled
    crossHair: Option<bool>,              // Set if crosshair for all weapons is enabled
    _3dSpotting: Option<bool>,            // Set if spotted targets are visible in the 3d-world
    miniMapSpotting: Option<bool>,        // Set if spotted targets are visible on the minimap
    nameTag: Option<bool>,                // Set if nametags should be displayed
    _3pCam: Option<bool>, // Set if allowing to toggle to third person vehicle cameras
    regenerateHealth: Option<bool>, // Set if health regeneration should be active
    teamKillCountForKick: Option<u32>, // Set number of teamkills allowed during a round
    teamKillValueForKick: Option<u32>, // Set max kill-value allowed for a player before he/she is kicked
    teamKillValuelncrease: Option<u32>, // Set kill-value increase for a teamkill
    teamKillValueDecreasePerSecond: Option<u32>, // Set kill-value decrease per second
    teamKillKickForBan: Option<u32>,   // Set number of team-kill kicks that will lead to permaban
    idleTimeout: Option<u32>,          // Set idle timeout
    idleBanRounds: Option<bool>,       // Set how many rounds idle timeout should ban (if at all)
    vehicleSpawnAllowed: Option<bool>, // Set whether vehicles should spawn in-game
    vehicleSpawnDelay: Option<u32>,    // Set vehicle spawn delay scale factor
    soldierHealth: Option<u32>,        // Set soldier max health scale factor
    playerRespawnTime: Option<u32>,    // Set player respawn time scale factor
    playerManDownTime: Option<u32>,    // Set player man-down time scale factor
    bulletDamage: Option<u32>,         // Set bullet damage scale factor
    gameModeCounter: Option<u32>,      // Set scale factor for number of tickets to end round
    onlySquadLeaderSpawn: Option<bool>, // Set if players can only spawn on their squad leader
    unlockMode: Option<Vec<String>>, // Set weapons & gadgets to be available on an unranked server
    premiumStatus: Option<bool>,     // Set if the server should be exclusive to Premium Players
}

#[allow(non_snake_case)]
pub struct StartupArgs {
    admin: Admin,
    vars: Vars,
    RM: Option<RM_Commands>,
    vu: VU_Commands,
    reservedSlots: ReservedSlots,
}

#[allow(non_snake_case)]
pub struct RM_Commands {
    setDevelopers: String,          // Set list of developers, separated by a space
    setAdmins: String,              // Set list of admins, separated by a space
    setLightAdmins: String,         // Set list of light-admins, separated by a space
    serverInfo: String,             // a description for your server
    serverLicenseKey: String,       // RM Server License Key
    ingameBanner: String,           // a link to an image
    pingLimitEnable: bool,          // activate ping limit
    pingLimitInMs: u32,             // time in ms
    autoPerfEnabled: bool,          // activate auto perf
    autoPerfMaxPlayers: u32,        // cutoff for auto perf
    tempReservedSlotsEnabled: bool, // enable automatic rejoining
    tempReservedSlotsRejoinTime: u32, // how long before rejoin is removed
    defaultPreRoundTime: u32,       // time before round starts
    setAutoBalancer: bool,          // autobalance
    battleCryLink: String,          // link to your battlecry JSON endpoint
}

#[allow(non_snake_case)]
pub struct VU_Commands {
    serverBanner: Option<String>, // link to your server banner image
}

pub struct ReservedSlots {
    add: Vec<String>, // list of players to add to reserved slot
}
