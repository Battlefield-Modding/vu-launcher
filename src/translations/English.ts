export type TranslationObject = typeof EnglishTranslations

export const EnglishTranslations = {
  home: {
    playerCredentials: {
      loading: 'Loading Users...',
      error: 'Error loading Player Credentials',
      sheet: {
        login: 'Login',
        addUser: 'Add User',
        title: 'Save VU Credentials',
        description: 'No account? Sign up here:',
      },
      form: {
        username: {
          title: 'VU Username',
          description: "Stored using your Operating System's native credential manager.",
        },
        password: {
          title: 'VU Password',
          description: "Stored using your Operating System's native credential manager.",
        },
        button: 'submit',
      },
    },
  },
  onboarding: {
    loading: 'Loading Onboarding component',
    error: 'Failed to load Onboarding component',
    header: 'First Time Setup',
    button: {
      continue: 'Skip / Continue',
      complete: 'Skip / Complete Onboarding',
    },
    activate: {
      header: 'Activate BF3 with EA App / Origin',
      step1: 'Please launch your EA App / Origin and sign in.',
      step2: 'Once signed-in click on the Activate BF3 button:',
      step3: 'After it succeeds click continue.',
      button: 'Activate BF3',
    },
    install: {
      prod: {
        locate: {
          header: 'VU already installed?',
          button: 'Find VU',
        },
        download: {
          header: 'Download VU',
          button: 'Choose Install Location',
        },
        progress: {
          header: 'Downloading VU',
          extractingPrefix: 'Extracting Files',
          extractingSuffix: 'remaining',
        },
        dialog: {
          title: 'Install VU to:',
          description: 'This will install VU to the above directory.',
          button: {
            confirmOne: 'Install VU Prod',
            confirmBoth: 'Install VU Prod AND Dev',
            cancel: 'Cancel',
          },
        },
      },
      dev: {
        header: 'Found VU Prod. Install VU Dev also?',
        button: 'Choose Install Location',
        dialog: {
          title: 'Install VU Dev to',
          description: 'This will install VU Dev to the above directory.',
          button: {
            confirm: 'Install VU Dev',
            cancel: 'Cancel',
          },
        },
      },
    },
    account: {
      add: 'Add a VU account',
    },
  },
  startupDescriptions: {
    admin: {
      password: 'Set RCON Password for Procon',
    },
    vars: {
      ranked: 'Enable ranked',
      serverName: 'Set server name',
      gamePassword: 'Set password for joining server',
      autoBalance: 'Enable Autobalance',
      roundStartPlayerCount: 'Set min players to activate pre-round/in-round',
      roundRestartPlayerCount: 'Set min players numbers to revert to warm-up',
      roundLockdownCountdown: 'Set pre-round duration',
      serverMessage: 'Set server welcome message',
      friendlyFire: 'Enable team damage',
      maxPlayers: 'Set max players',
      serverDescription: 'Set server description',
      killCam: 'Enable killcam',
      miniMap: 'Enable minimap',
      hud: 'Enable HUD',
      crossHair: 'Enable crosshair for all weapons',
      _3dSpotting: 'Enable 3d markers over spotted enemies',
      miniMapSpotting: 'Enable spotted enemies on minimap',
      nameTag: 'Enable nametags',
      _3pCam: 'Enable 3rd person vehicle camera',
      regenerateHealth: 'Enable health regeneration',
      teamKillCountForKick: 'Set number of teamkills allowed during a round',
      teamKillValueForKick: 'Set max kill-value allowed for a player before he/she is kicked',
      teamKillValuelncrease: 'Set kill-value increase for a teamkill',
      teamKillValueDecreasePerSecond: 'Set kill-value decrease per second',
      teamKillKickForBan: 'Set number of team-kill kicks that will lead to permaban',
      idleTimeout: 'Set idle timeout',
      idleBanRounds: 'Set how many rounds idle timeout should ban (if at all)',
      vehicleSpawnAllowed: 'Enable vehicles to spawn',
      vehicleSpawnDelay: 'Set vehicle spawn delay scale factor',
      soldierHealth: 'Set soldier max health scale factor',
      playerRespawnTime: 'Set player respawn time scale factor',
      playerManDownTime: 'Set player man-down time scale factor',
      bulletDamage: 'Set bullet damage scale factor',
      gameModeCounter: 'Set scale factor for number of tickets to end round',
      onlySquadLeaderSpawn: 'Disable squadmate spawns except squadleader',
      // unlockMode:  "Set weapons & gadgets to be available on an unranked server",
    },
    RM: {
      setDevelopers: 'Set list of developers, separated by a space',
      setAdmins: 'Set list of admins, separated by a space',
      setLightAdmins: 'Set list of light-admins, separated by a space',
      serverInfo: 'a description for your server',
      serverLicenseKey: 'RM Server License Key',
      ingameBanner: 'a link to an image',
      pingLimitEnable: 'activate ping limit',
      pingLimitInMs: 'time in ms',
      autoPerfEnabled: 'activate auto perf',
      autoPerfMaxPlayers: 'cutoff for auto perf',
      tempReservedSlotsEnabled: 'enable automatic rejoining',
      tempReservedSlotsRejoinTime: 'how long before rejoin is removed',
      defaultPreRoundTime: 'time before round starts',
      setAutoBalancer: 'autobalance',
      battleCryLink: 'link to your battlecry JSON endpoint',
    },
    vu: {
      ColorCorrectionEnabled: 'Enable blue-tint filter',
      DesertingAllowed: 'Disable Out of Bounds',
      DestructionEnabled: 'Enable Destruction',
      HighPerformanceReplication: 'Enable high-performance updates on far away players',
      ServerBanner: 'Set browser banner URL pointing to 1378x162 jpg',
      SetTeamTicketCount: 'Set team ticket count for a team.',
      SquadSize: 'Set max players per squad',
      SunFlareEnabled: 'Enable sun flare',
      SuppressionMultiplier: 'Set suppression intensity [0, infinite]',
      FriendlyFireSuppression: 'Enable suppression of allies',
      TimeScale: 'Slow down or speed up game [0.0, 2.0]',
      VehicleDisablingEnabled: 'Enable mobility hits on vehicles',
      HttpAssetUrl: 'Set URL pointing to remote [ui.vuic] instead of downloading from game server',
      DisablePreRound: 'Disable waiting for players',
      TeamActivatedMines: 'Enable mines to trigger on allies',
      CorpseDamageEnabled: 'Enables corpse damage to prevent revives',
    },
    reservedSlots: {
      add: 'list of players to add to reserved slot separated by comma ,',
    },
  },
  launchArgumentDescriptions: {
    common: {
      gamepath: 'Set custom Battlefield 3 installation directory.',
      perftrace: 'Enable performance logging to perftrace-[server|client].csv',
      env: 'Set Zeus environment. Defaults to prod.',
      updateBranch: 'Set update branch. Defaults to whatever -env is set to.',
      tracedc:
        'Enable DataContainer Trace usage in VEXT and print any dangling DCs during level destuction.',
      cacert: 'Set a custom CA certificate bundle to use for SSL verification.',
      activateWithOrigin:
        '-activate -o_mail <email> -o_pass <pass> Activates BF3 on the current machine using the specified Origin credentials.',
      activateWithLSX:
        '-activate -lsx Activates BF3 on the current machine using EA app / Origin (LSX), which must be running and be logged in to an account that owns BF3. It also prints the authentication token retrieved from the EA app.',
      activateWithEaToken:
        '-activate -ea_token <token> Activates BF3 on the current machine using the provided EA auth token. The token can be retrieved from another computer using the command above. Keep in mind that tokens expire.',
      console: 'Enable external console window for debug logging.',
      debuglog:
        'Enable logging. Server logs are in server instance directory. Clients logs are in the VU AppData installation folder.',
      trace: 'Enable verbose logging.',
      vextdebug:
        'Set VEXT remote debugging host:port (this does not currently work). It also prevents the server / client connections from timing out and makes it so compiled VEXT modules sent to the client contain debug symbols.',
      vexttrace:
        'Enable VEXT execution tracing. When tracing is enabled and VU crashes, the last executed line of each loaded VEXT mod will be available from the crash dialog and in the submitted crash details. Keep in mind that this could adversely affect performance.',
    },
    client: {
      dwebui: 'Enable WebUI debugging at http://localhost:8884.',
      serverJoinString:
        'Connect to a server with the given GUID and an optional password. Can be used as hyperlink to join. If join AND spectate strings are empty, VU Launcher will automatically create a join string in backend. vu://join/4ffa57c1068540e59b9a25eb6b00dfcd/amazingpass',
      serverSpectateString:
        ' Connect as a spectator to a server with the given GUID and an optional password. Can be used as hyperlink to join as a spectator. If join AND spectate strings are empty, VU Launcher will automatically create a join string in backend. vu://spectate/4ffa57c1068540e59b9a25eb6b00dfcd/amazingpass',
      cefdebug:
        'Enable verbose debugging logging for CEF for WebUI mods. A debug.log file will be created in the directory of VU (usually %LocalAppData%\\VeniceUnleashed\\client).',
      credentials:
        '-username <username> -password <password> Logs you in to your VU account using the specified VU credentials.',
      disableUiHwAcceleration:
        'Disable hardware acceleration for WebUI. Use only if launching VU gives a black loading screen. Enabled by default on unsupported operating systems.',
    },
    server: {
      high60: 'Set VU server frequency to 60Hz.',
      high120: 'Set VU server frequency to 120Hz.',
      headless: 'Run VU server in headless mode (without creating any windows).',
      serverInstancePath:
        'Set server instance path (where the server configuration, logs, and mods are stored) for the VU server.',
      highResTerrain:
        'Enable high resolution terrain. Useful for extending maps beyond their original play area.',
      disableTerrainInterpolation: 'Disable interpolation between different terrain LODs.',
      skipChecksum: 'Disable level checksum validation on client connection.',
      listen:
        'Set the host and port the VU server should listen for connections on. Defaults to 0.0.0.0:25200',
      mHarmonyPort:
        'Set the port the VU server should listen for MonitoredHarmony connections. Defaults to 7948',
      remoteAdminPort:
        'Set the host and port the VU server should listen for RCON connections. Defaults to 0.0.0.0:47200',
      unlisted:
        'Hide server from server list. Join requires connect console command or vu join string.',
      joinaddr:
        "Set IPv4 address clients should connect to. If empty backend will attempt to automatically detect the server's IP address.",
      joinhost:
        'Set a hostname clients should use when connecting. When this is specified -joinaddr has no effect and any clients attempting to connect will not attempt to perform any NAT detection.',
      noUpdate: 'Disable automatic updates.',
      maxPlayers:
        "Set maximum players (vars.maxPlayers + vars.maxSpectators). When using the default spectator size of 24, you won't be able to set vars.maxPlayers higher then 40.",
    },
  },
}
