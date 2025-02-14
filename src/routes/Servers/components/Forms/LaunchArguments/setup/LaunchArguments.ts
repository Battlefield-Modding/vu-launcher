export type LaunchArguments = {
  common?: CommonLaunchArguments,
  client?: ClientLaunchArguments,
  server: ServerLaunchArguments
}

export type CommonLaunchArguments = {
  gamepath?: string
  perftrace?: boolean,
  env?: string | "prod" | "dev",
  updateBranch?: string | "prod" | "dev",
  tracedc?: boolean,
  cacert?: string,
  // activateWithOrigin?: {email: string, password: string}
  // activateWithLSX?: boolean,
  // activateWithEaToken?: string,
  console?: boolean,
  debuglog?: boolean,
  trace?: boolean,
  vextdebug?: string,
  vexttrace?: boolean,
}

export type ClientLaunchArguments = {
  dwebui?: boolean,
  serverJoinString?: string,
  serverSpectateString?: string,
  cefdebug?: boolean,
  // credentials?: {username: string, password: string},
  disableUiHwAcceleration?: boolean,
}

export type ServerLaunchArguments = {
  requiredArgs: true,
  high60?: boolean,
  high120?: boolean,
  headless?: boolean,
  serverInstancePath?: string,
  highResTerrain?: boolean,
  disableTerrainInterpolation?: boolean,
  skipChecksum?: boolean,
  listen?: string,
  mHarmonyPort?: string,
  remoteAdminPort?: string,
  unlisted?: boolean,
  joinaddr?: string,
  joinhost?: string,
  noUpdate?: boolean,
  maxPlayers?: number,
}

export const LaunchArgumentDescriptions = {
  common: {
    gamepath: "-gamepath <path> Used to explicitly specify the Battlefield 3 installation directory.",
    perftrace: "-perftrace Writes a performance profile to perftrace-[server|client].csv",
    env: "-env [prod|dev] Specifies the Zeus environment to connect to. Defaults to prod.",
    updateBranch: "-updateBranch [prod|dev] Specifies the update branch to fetch updates from. Defaults to whatever -env is set to.",
    tracedc: "-tracedc Traces DataContainer usage in VEXT and prints any dangling DCs during level destuction.",
    cacert: "-cacert <path> Sets a custom CA certificate bundle to use for SSL verification.",
    activateWithOrigin: "-activate -o_mail <email> -o_pass <pass> Activates BF3 on the current machine using the specified Origin credentials.",
    activateWithLSX: "-activate -lsx Activates BF3 on the current machine using EA app / Origin (LSX), which must be running and be logged in to an account that owns BF3. It also prints the authentication token retrieved from the EA app.",
    activateWithEaToken: "-activate -ea_token <token> Activates BF3 on the current machine using the provided EA auth token. The token can be retrieved from another computer using the command above. Keep in mind that tokens expire.",
    console: "-console Allocates an external console window for debug logging.",
    debuglog: "-debuglog Saves logging output to a file in the logs folder. For servers, this folder will be in the server instance directory. For clients, it will be in the VU AppData installation folder.",
    trace: "-trace Enables verbose logging.",
    vextdebug: "-vextdebug <host:port> Enables VEXT remote debugging, connecting to the debugger at the specified host:port (this does not currently work). It also prevents the server / client connections from timing out and makes it so compiled VEXT modules sent to the client contain debug symbols.",
    vexttrace: "-vexttrace Enables VEXT execution tracing. When tracing is enabled and VU crashes, the last executed line of each loaded VEXT mod will be available from the crash dialog and in the submitted crash details. Keep in mind that this could adversely affect performance.",
  },
  client: {
    dwebui: "-dwebui Enables WebUI debugging at http://localhost:8884.",
    serverJoinString: "vu://join/<server-guid>[/<password>] Connect to a server with the given GUID (without dashes) and an optional password. This is the ID of a server key. You can also use this URL as a hyperlink on a website to join a server. \nExample: vu://join/4ffa57c1068540e59b9a25eb6b00dfcd \nExample (with password): vu://join/4ffa57c1068540e59b9a25eb6b00dfcd/amazingpass",
    serverSpectateString: "vu://spectate/<server-guid>[/<password>] Connect as a spectator to a server with the given GUID (without dashes) and an optional password. This is the ID of a server key. You can also use this URL as a hyperlink to join a server as a spectator. \nExample: vu://spectate/4ffa57c1068540e59b9a25eb6b00dfcd \nExample (with password): vu://spectate/4ffa57c1068540e59b9a25eb6b00dfcd/amazingpass",
    cefdebug: "-cefdebug Enable verbose debugging logging for CEF. Useful for catching issues with WebUI mods. When running with this argument, a debug.log file will be created in the directory of VU (usually %LocalAppData%\\VeniceUnleashed\\client).",
    credentials: "-username <username> -password <password> Logs you in to your VU account using the specified VU credentials.",
    disableUiHwAcceleration: "-disableUiHwAcceleration Force hardware acceleration for the WebUI off, falling back to software rendering. You can try this if you get a black loading screen when launching VU. Keep in mind that this will degrade your experience and your performance. This is enabled by default on unsupported operating systems."
  },
  server: {
    requiredArgs: "-server -dedicated The two required arguments for running a VU server.",
    high60: "-high60 Sets the VU server frequency to 60Hz.",
    high120: "-high120 Sets the VU server frequency to 120Hz.",
    headless: "-headless Runs the VU server in headless mode (without creating any windows).",
    serverInstancePath: "-serverInstancePath <path> Sets the server instance path (where the server configuration, logs, and mods are stored) for the VU server.",
    highResTerrain: "-highResTerrain Enables high resolution terrain. Useful for extending maps beyond their original play area.",
    disableTerrainInterpolation: "-disableTerrainInterp Disables interpolation between different terrain LODs.",
    skipChecksum: "-skipChecksum Disables level checksum validation on client connection.",
    listen: "-listen <host:port> Sets the host and port the VU server should listen for connections on. Defaults to 0.0.0.0:25200.",
    mHarmonyPort: "-mHarmonyPort <port> Sets the port the VU server should listen for MonitoredHarmony connections. Defaults to 7948.",
    remoteAdminPort: "-RemoteAdminPort <host:port> Sets the host and port the VU server should listen for RCON connections. Defaults to 0.0.0.0:47200.",
    unlisted: "-unlisted Makes the server not show up in the server list. Unlisted servers can only be joined by the connect console command or via the vu://join/server-id url scheme, which can also be added as a launch argument to vu.exe to auto-join as soon as the client loads.",
    joinaddr: "-joinaddr <ip> Specifies the IP address clients should connect to in order to join this server. Only IPv4 addresses are supported. If you don't specify this, the backend will attempt to automatically detect the server's IP address.",
    joinhost: "-joinhost <hostname> Specifies a hostname clients should use when connecting to this server. When this is specified -joinaddr has no effect and any clients attempting to connect will not attempt to perform any NAT detection.",
    noUpdate: "-noUpdate Disables automatic updates.",
    maxPlayers: "-maxPlayers <number> Sets the maximum players that are allowed to set with vars.maxPlayers & vars.maxSpectators combined. Example: -maxPlayers 64. When using the default spectator size of 24, you won't be able to set vars.maxPlayers higher then 40. Unless you reduce the spectator count before."
  }
}

export const defaultLaunchArguments: LaunchArguments = {
  common: {
    gamepath: "",
    perftrace: false,
    env: "prod",
    updateBranch: "prod",
    tracedc: false,
    cacert: "",
    // activateWithOrigin: {email: "", password: ""},
    // activateWithLSX: false,
    // activateWithEaToken: "",
    console: false,
    debuglog: false,
    trace: false,
    vextdebug: "",
    vexttrace: false,
  },
  client: {
    dwebui: false,
    serverJoinString: "",
    serverSpectateString: "",
    cefdebug: false,
    // credentials: {username: "", password: ""},
    disableUiHwAcceleration: false,
  },
  server: {
    requiredArgs: true,
    high60: false,
    high120: false,
    headless: false,
    serverInstancePath: "",
    highResTerrain: false,
    disableTerrainInterpolation: false,
    skipChecksum: false,
    listen: "",
    mHarmonyPort: "",
    remoteAdminPort: "",
    unlisted: false,
    joinaddr: "",
    joinhost: "",
    noUpdate: false,
    maxPlayers: 0,
  }
}

export const defaultLaunchArgumentInputTypes = {
  common: {
    gamepath: "textarea",
    perftrace: "checkbox",
    env: "select",
    updateBranch: "select",
    tracedc: "checkbox",
    cacert: "textarea",
    // activateWithOrigin: "credentials",
    // activateWithLSX: "checkbox",
    // activateWithEaToken: "textarea",
    console: "checkbox",
    debuglog: "checkbox",
    trace: "checkbox",
    vextdebug: "textarea",
    vexttrace: "checkbox",
  },
  client: {
    dwebui: "checkbox",
    serverJoinString: "textarea",
    serverSpectateString: "textarea",
    cefdebug: "checkbox",
    // credentials: "credentials",
    disableUiHwAcceleration: "checkbox",
  },
  server: {
    requiredArgs: "checkbox",
    high60: "checkbox",
    high120: "checkbox",
    headless: "checkbox",
    serverInstancePath: "textarea",
    highResTerrain: "checkbox",
    disableTerrainInterpolation: "checkbox",
    skipChecksum: "checkbox",
    listen: "textarea",
    mHarmonyPort: "textarea",
    remoteAdminPort: "textarea",
    unlisted: "checkbox",
    joinaddr: "textarea",
    joinhost: "textarea",
    noUpdate: "checkbox",
    maxPlayers: "number",
  }
}


