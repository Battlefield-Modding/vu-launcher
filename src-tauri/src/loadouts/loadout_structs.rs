use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct LoadoutJson {
    pub name: String,
    pub maplist: Vec<Map>,
    pub banlist: Vec<String>,
    pub modlist: Vec<GameMod>,
    pub startup: StartupArgs,
    pub launch: LaunchArguments,
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct ModJson {
    pub Name: String,
    pub Authors: Vec<String>,
    pub Description: String,
    pub URL: Option<String>,
    pub Version: String,
    pub HasWebUI: bool,
    pub HasVeniceEXT: bool,
    pub Tags: Option<Vec<String>>,
    // Dependencies // Ignoring dependencies for now...
}

impl ModJson {
    pub fn default() -> ModJson {
        ModJson {
            Name: String::from(""),
            Authors: Vec::new(),
            Description: String::from(""),
            URL: Some(String::from("")),
            Version: String::from(""),
            HasWebUI: false,
            HasVeniceEXT: false,
            Tags: Some(Vec::new()),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GameMod {
    pub name: String,
    pub version: String,
    pub image: Option<String>,
    pub src: Option<String>,
    pub enabled: bool,
}

impl GameMod {
    pub fn default() -> GameMod {
        GameMod {
            name: String::from(""),
            version: String::from(""),
            image: Some(String::from("")),
            src: Some(String::from("")),
            enabled: false,
        }
    }
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

impl Admin {
    pub fn default() -> Admin {
        Admin {
            password: String::from(""),
        }
    }
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
    pub teamKillValueForKick: Option<f64>, // Set max kill-value allowed for a player before he/she is kicked
    pub teamKillValuelncrease: Option<f64>, // Set kill-value increase for a teamkill
    pub teamKillValueDecreasePerSecond: Option<f64>, // Set kill-value decrease per second
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
                                         // pub unlockMode: Option<Vec<String>>, // Set weapons & gadgets to be available on an unranked server
}

impl Vars {
    pub fn default() -> Vars {
        Vars {
            ranked: Some(false),
            serverName: String::from(""),
            gamePassword: Some(String::from("")),
            autoBalance: Some(false),
            roundStartPlayerCount: Some(8),
            roundRestartPlayerCount: Some(0),
            roundLockdownCountdown: Some(10),
            serverMessage: Some(String::from("")),
            friendlyFire: Some(false),
            maxPlayers: Some(64),
            serverDescription: Some(String::from("")),
            killCam: Some(true),
            miniMap: Some(true),
            hud: Some(true),
            crossHair: Some(true),
            _3dSpotting: Some(true),
            miniMapSpotting: Some(true),
            nameTag: Some(true),
            _3pCam: Some(true),
            regenerateHealth: Some(true),
            teamKillCountForKick: Some(0),
            teamKillValueForKick: Some(2.0),
            teamKillValuelncrease: Some(0.525),
            teamKillValueDecreasePerSecond: Some(0.01),
            teamKillKickForBan: Some(0),
            idleTimeout: Some(9000),
            idleBanRounds: Some(false),
            vehicleSpawnAllowed: Some(true),
            vehicleSpawnDelay: Some(1),
            soldierHealth: Some(1),
            playerRespawnTime: Some(1),
            playerManDownTime: Some(1),
            bulletDamage: Some(1),
            gameModeCounter: Some(1),
            onlySquadLeaderSpawn: Some(false),
            // unlockMode: None,
        }
    }
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct StartupArgs {
    pub admin: Admin,
    pub vars: Vars,
    pub RM: Option<RM_Commands>,
    pub vu: Option<VU_Commands>,
    pub reservedSlots: Option<Vec<String>>,
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct RM_Commands {
    pub setDevelopers: Vec<String>, // Set list of developers, separated by a space
    pub setAdmins: Vec<String>,     // Set list of admins, separated by a space
    pub setLightAdmins: Vec<String>, // Set list of light-admins, separated by a space
    pub serverInfo: String,         // a description for your server
    pub serverLicenseKey: String,   // RM Server License Key
    pub ingameBanner: String,       // a link to an image
    pub pingLimitEnable: bool,      // activate ping limit
    pub pingLimitInMs: u32,         // time in ms
    pub autoPerfEnabled: bool,      // activate auto perf
    pub autoPerfMaxPlayers: u32,    // cutoff for auto perf
    pub tempReservedSlotsEnabled: bool, // enable automatic rejoining
    pub tempReservedSlotsRejoinTime: u32, // how long before rejoin is removed
    pub defaultPreRoundTime: u32,   // time before round starts
    pub setAutoBalancer: bool,      // autobalance
    pub battleCryLink: String,      // link to your battlecry JSON endpoint
    pub enableEnemyLocalVoip: bool, // turn on enemy-voip feature
}

impl RM_Commands {
    pub fn default() -> RM_Commands {
        RM_Commands {
            setDevelopers: Vec::new(),
            setAdmins: Vec::new(),
            setLightAdmins: Vec::new(),
            serverInfo: String::from(""),
            serverLicenseKey: String::from("1234567890"),
            ingameBanner: String::from(""),
            pingLimitEnable: false,
            pingLimitInMs: 100,
            autoPerfEnabled: false,
            autoPerfMaxPlayers: 80,
            tempReservedSlotsEnabled: true,
            tempReservedSlotsRejoinTime: 180,
            defaultPreRoundTime: 300,
            setAutoBalancer: false,
            battleCryLink: String::from(""),
            enableEnemyLocalVoip: false,
        }
    }
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct VU_Commands {
    pub ColorCorrectionEnabled: Option<bool>, // "Enable blue-tint filter",
    pub DesertingAllowed: Option<bool>,       // "Disable Out Of Bounds",
    pub DestructionEnabled: Option<bool>,     // "Enable Destruction",
    pub HighPerformanceReplication: Option<bool>, // "Update far-away players at same rate as nearby players",
    pub ServerBanner: Option<String>, // "URL for 1378x162 .jpg that appears in server browser",
    pub SetTeamTicketCount: Option<Vec<SetTeamTicketCount>>, // "Sets team ticket count for a team. TeamId TicketCount",
    pub SquadSize: Option<u32>,                              // "Set max players per squad",
    pub SunFlareEnabled: Option<bool>,                       // "Enable sun flare",
    pub SuppressionMultiplier: Option<u32>, // "Set suppression intensity [0, infinite]. 0 means disable suppression.",
    pub FriendlyFireSuppression: Option<bool>, // "Enable suppression of allies",
    pub TimeScale: Option<f64>, // "Slow down or speed up game [0.0, 2.0]. Default is 1.0",
    pub VehicleDisablingEnabled: Option<bool>, // "Enable disabled state of vehicles (mobility down and burning)",
    pub HttpAssetUrl: Option<String>, // "A URL pointing to an external HTTP server hosting mod assets, or an empty string if assets should be sent directly from the game server. When this is set, any connecting clients will try to download any needed assets from that URL, following the file structure of the mod files. For example, if you have a mod called mymod and it has a WebUI container file (ui.vuic), and you set the URL to https://example.com/assets/, the client will try to download the file from https://example.com/assets/mymod/ui.vuic. If file downloads fail or their contents don't match what's on the game server, clients will be unable to join.",
    pub DisablePreRound: Option<bool>, // "Disable time before round starts (waiting for players 1/10)",
    pub TeamActivatedMines: Option<bool>, // "Enable mines killing allies",
    pub CorpseDamageEnabled: Option<bool>, // "Enables corpse damage, preventing revival.(Tip: Tweak VeniceSoldierHealthModuleData.manDownStateHealthPoints with a mod.)",
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct SetTeamTicketCount {
    pub teamId: String,
    pub ticketCount: u64,
}

impl VU_Commands {
    pub fn default() -> VU_Commands {
        VU_Commands {
            ColorCorrectionEnabled: Some(true),
            DesertingAllowed: Some(false),
            DestructionEnabled: Some(true),
            HighPerformanceReplication: Some(false),
            ServerBanner: Some(String::from("")),
            SetTeamTicketCount: Some(Vec::new()),
            SquadSize: Some(4),
            SunFlareEnabled: Some(true),
            SuppressionMultiplier: Some(100),
            FriendlyFireSuppression: Some(false),
            TimeScale: Some(1.0),
            VehicleDisablingEnabled: Some(true),
            HttpAssetUrl: Some(String::from("")),
            DisablePreRound: Some(false),
            TeamActivatedMines: Some(false),
            CorpseDamageEnabled: Some(false),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ParsedStartupTxtLine {
    pub category: String, // what section of startup key belongs to
    pub key: String,
    pub value: String,
}

impl StartupArgs {
    pub fn default() -> StartupArgs {
        StartupArgs {
            admin: Admin::default(),
            vars: Vars::default(),
            RM: Some(RM_Commands::default()),
            vu: Some(VU_Commands::default()),
            reservedSlots: Some(Vec::new()),
        }
    }
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct LaunchArguments {
    pub common: CommonLaunchArguments,
    pub client: ClientLaunchArguments,
    pub server: ServerLaunchArguments,
}

impl LaunchArguments {
    pub fn default() -> LaunchArguments {
        return LaunchArguments {
            common: CommonLaunchArguments::default(),
            client: ClientLaunchArguments::default(),
            server: ServerLaunchArguments::default(),
        };
    }
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct CommonLaunchArguments {
    pub gamepath: Option<String>,
    pub perftrace: Option<bool>,
    pub env: Option<String>,          // "prod" | "dev"
    pub updateBranch: Option<String>, //"prod" | "dev"
    pub tracedc: Option<bool>,
    pub cacert: Option<String>,
    // pub activateWithOrigin: Option<CredentialEmail>,
    // pub activateWithLSX: Option<bool>,
    // pub activateWithEaToken: Option<String>,
    pub console: Option<bool>,
    pub debuglog: Option<bool>,
    pub trace: Option<bool>,
    pub vextdebug: Option<String>,
    pub vexttrace: Option<bool>,
}

impl CommonLaunchArguments {
    pub fn default() -> CommonLaunchArguments {
        return CommonLaunchArguments {
            gamepath: Some(String::from("")),
            perftrace: Some(false),
            env: Some(String::from("prod")),
            updateBranch: Some(String::from("prod")),
            tracedc: Some(false),
            cacert: Some(String::from("")),
            // activateWithOrigin: Some(CredentialEmail::default()),
            // activateWithLSX: Some(false),
            // activateWithEaToken: Some(String::from("")),
            console: Some(false),
            debuglog: Some(false),
            trace: Some(false),
            vextdebug: Some(String::from("")),
            vexttrace: Some(false),
        };
    }
}

// #[derive(Serialize, Deserialize, Debug)]
// pub struct CredentialEmail {
//     email: Option<String>,
//     password: Option<String>,
// }

// impl CredentialEmail {
//     pub fn default() -> CredentialEmail {
//         return CredentialEmail {
//             email: Some(String::from("")),
//             password: Some(String::from("")),
//         };
//     }
// }

// #[derive(Serialize, Deserialize, Debug)]
// pub struct CredentialUsername {
//     username: Option<String>,
//     password: Option<String>,
// }

// impl CredentialUsername {
//     pub fn default() -> CredentialUsername {
//         return CredentialUsername {
//             username: Some(String::from("")),
//             password: Some(String::from("")),
//         };
//     }
// }

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct ClientLaunchArguments {
    pub dwebui: Option<bool>,
    pub serverJoinString: Option<String>,
    pub serverSpectateString: Option<String>,
    pub cefdebug: Option<bool>,
    // pub credentials: Option<CredentialUsername>,
    pub disableUiHwAcceleration: Option<bool>,
}

impl ClientLaunchArguments {
    pub fn default() -> ClientLaunchArguments {
        return ClientLaunchArguments {
            dwebui: Some(false),
            serverJoinString: Some(String::from("")),
            serverSpectateString: Some(String::from("")),
            cefdebug: Some(false),
            // credentials: Some(CredentialUsername::default()),
            disableUiHwAcceleration: Some(false),
        };
    }
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct ServerLaunchArguments {
    pub high60: Option<bool>,
    pub high120: Option<bool>,
    pub headless: Option<bool>,
    pub serverInstancePath: Option<String>,
    pub highResTerrain: Option<bool>,
    pub disableTerrainInterpolation: Option<bool>,
    pub skipChecksum: Option<bool>,
    pub listen: Option<String>,
    pub mHarmonyPort: Option<String>,
    pub remoteAdminPort: Option<String>,
    pub unlisted: Option<bool>,
    pub joinaddr: Option<String>,
    pub joinhost: Option<String>,
    pub noUpdate: Option<bool>,
    pub maxPlayers: Option<u32>,
}

impl ServerLaunchArguments {
    pub fn default() -> ServerLaunchArguments {
        return ServerLaunchArguments {
            high60: Some(false),
            high120: Some(false),
            headless: Some(true),
            serverInstancePath: Some(String::from("")),
            highResTerrain: Some(false),
            disableTerrainInterpolation: Some(false),
            skipChecksum: Some(false),
            listen: Some(String::from("")),
            mHarmonyPort: Some(String::from("")),
            remoteAdminPort: Some(String::from("")),
            unlisted: Some(false),
            joinaddr: Some(String::from("")),
            joinhost: Some(String::from("")),
            noUpdate: Some(false),
            maxPlayers: Some(0),
        };
    }
}
