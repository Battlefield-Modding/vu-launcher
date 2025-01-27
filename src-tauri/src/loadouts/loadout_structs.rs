use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct LoadoutJson {
    pub name: String,
    pub startup: StartupArgs,
    pub maplist: Vec<Map>,
    pub banlist: Vec<String>,
    pub modlist: Vec<String>,
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct Map {
    pub mapCode: String,
    pub gameMode: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Admin {
    pub password: String, // This is RCON password for remote admin.
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct Vars {
    pub ranked: Option<bool>, // Change the server between ranked/unranked mode
    pub serverName: String,   // Set the server name
    pub gamePassword: Option<String>, // Set the game password for the server
    pub autoBalance: Option<bool>, // Set if the server should autobalance
    pub roundStartPlayerCount: Option<u32>, // Set minimum numbers of players to go from warm-up to pre-round/in-round
    pub roundRestartPlayerCount: Option<u32>, // Set minimum numbers of players to go from in-round to warm-up
    pub roundLockdownCountdown: Option<u32>,  // Set the duration of pre-round
    pub serverMessage: Option<String>,        // Set the server welcome message
    pub friendlyFire: Option<bool>,           // Set if the server should allow team damage
    pub maxPlayers: Option<u32>,              // Set desired maximum number of players
    pub serverDescription: Option<String>,    // Set server description
    pub killCam: Option<bool>,                // Set if killcam is enabled
    pub miniMap: Option<bool>,                // Set if minimap is enabled
    pub hud: Option<bool>,                    // Set if HUD is enabled
    pub crossHair: Option<bool>,              // Set if crosshair for all weapons is enabled
    pub _3dSpotting: Option<bool>,            // Set if spotted targets are visible in the 3d-world
    pub miniMapSpotting: Option<bool>,        // Set if spotted targets are visible on the minimap
    pub nameTag: Option<bool>,                // Set if nametags should be displayed
    pub _3pCam: Option<bool>, // Set if allowing to toggle to third person vehicle cameras
    pub regenerateHealth: Option<bool>, // Set if health regeneration should be active
    pub teamKillCountForKick: Option<u32>, // Set number of teamkills allowed during a round
    pub teamKillValueForKick: Option<u32>, // Set max kill-value allowed for a player before he/she is kicked
    pub teamKillValuelncrease: Option<u32>, // Set kill-value increase for a teamkill
    pub teamKillValueDecreasePerSecond: Option<u32>, // Set kill-value decrease per second
    pub teamKillKickForBan: Option<u32>, // Set number of team-kill kicks that will lead to permaban
    pub idleTimeout: Option<u32>,        // Set idle timeout
    pub idleBanRounds: Option<bool>,     // Set how many rounds idle timeout should ban (if at all)
    pub vehicleSpawnAllowed: Option<bool>, // Set whether vehicles should spawn in-game
    pub vehicleSpawnDelay: Option<u32>,  // Set vehicle spawn delay scale factor
    pub soldierHealth: Option<u32>,      // Set soldier max health scale factor
    pub playerRespawnTime: Option<u32>,  // Set player respawn time scale factor
    pub playerManDownTime: Option<u32>,  // Set player man-down time scale factor
    pub bulletDamage: Option<u32>,       // Set bullet damage scale factor
    pub gameModeCounter: Option<u32>,    // Set scale factor for number of tickets to end round
    pub onlySquadLeaderSpawn: Option<bool>, // Set if players can only spawn on their squad leader
    pub unlockMode: Option<Vec<String>>, // Set weapons & gadgets to be available on an unranked server
    pub premiumStatus: Option<bool>,     // Set if the server should be exclusive to Premium Players
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct StartupArgs {
    pub admin: Admin,
    pub vars: Vars,
    pub RM: Option<RM_Commands>,
    pub vu: Option<VU_Commands>,
    pub reservedSlots: Option<ReservedSlots>,
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct RM_Commands {
    pub setDevelopers: String,  // Set list of developers, separated by a space
    pub setAdmins: String,      // Set list of admins, separated by a space
    pub setLightAdmins: String, // Set list of light-admins, separated by a space
    pub serverInfo: String,     // a description for your server
    pub serverLicenseKey: String, // RM Server License Key
    pub ingameBanner: String,   // a link to an image
    pub pingLimitEnable: bool,  // activate ping limit
    pub pingLimitInMs: u32,     // time in ms
    pub autoPerfEnabled: bool,  // activate auto perf
    pub autoPerfMaxPlayers: u32, // cutoff for auto perf
    pub tempReservedSlotsEnabled: bool, // enable automatic rejoining
    pub tempReservedSlotsRejoinTime: u32, // how long before rejoin is removed
    pub defaultPreRoundTime: u32, // time before round starts
    pub setAutoBalancer: bool,  // autobalance
    pub battleCryLink: String,  // link to your battlecry JSON endpoint
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct VU_Commands {
    pub serverBanner: Option<String>, // link to your server banner image
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ReservedSlots {
    pub add: Vec<String>, // list of players to add to reserved slot
}
