export type LaunchArguments = {
  common?: CommonLaunchArguments,
  client?: ClientLaunchArguments,
  server?: ServerLaunchArguments
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
    gamepath: "Set custom Battlefield 3 installation directory.",
    perftrace: "Enable performance logging to perftrace-[server|client].csv",
    env: "Set Zeus environment. Defaults to prod.",
    updateBranch: "Set update branch. Defaults to whatever -env is set to.",
    tracedc: "Enable DataContainer Trace usage in VEXT and print any dangling DCs during level destuction.",
    cacert: "Set a custom CA certificate bundle to use for SSL verification.",
    activateWithOrigin: "-activate -o_mail <email> -o_pass <pass> Activates BF3 on the current machine using the specified Origin credentials.",
    activateWithLSX: "-activate -lsx Activates BF3 on the current machine using EA app / Origin (LSX), which must be running and be logged in to an account that owns BF3. It also prints the authentication token retrieved from the EA app.",
    activateWithEaToken: "-activate -ea_token <token> Activates BF3 on the current machine using the provided EA auth token. The token can be retrieved from another computer using the command above. Keep in mind that tokens expire.",
    console: "Enable external console window for debug logging.",
    debuglog: "Enable logging. Server logs are in server instance directory. Clients logs are in the VU AppData installation folder.",
    trace: "Enable verbose logging.",
    vextdebug: "Set VEXT remote debugging host:port (this does not currently work). It also prevents the server / client connections from timing out and makes it so compiled VEXT modules sent to the client contain debug symbols.",
    vexttrace: "Enable VEXT execution tracing. When tracing is enabled and VU crashes, the last executed line of each loaded VEXT mod will be available from the crash dialog and in the submitted crash details. Keep in mind that this could adversely affect performance.",
  },
  client: {
    dwebui: "Enable WebUI debugging at http://localhost:8884.",
    serverJoinString: "Connect to a server with the given GUID and an optional password. Can be used as hyperlink to join. If join AND spectate strings are empty, VU Launcher will automatically create a join string in backend. vu://join/4ffa57c1068540e59b9a25eb6b00dfcd/amazingpass",
    serverSpectateString: " Connect as a spectator to a server with the given GUID and an optional password. Can be used as hyperlink to join as a spectator. If join AND spectate strings are empty, VU Launcher will automatically create a join string in backend. vu://spectate/4ffa57c1068540e59b9a25eb6b00dfcd/amazingpass",
    cefdebug: "Enable verbose debugging logging for CEF for WebUI mods. A debug.log file will be created in the directory of VU (usually %LocalAppData%\\VeniceUnleashed\\client).",
    credentials: "-username <username> -password <password> Logs you in to your VU account using the specified VU credentials.",
    disableUiHwAcceleration: "Disable hardware acceleration for WebUI. Use only if launching VU gives a black loading screen. Enabled by default on unsupported operating systems."
  },
  server: {
    high60: "Set VU server frequency to 60Hz.",
    high120: "Set VU server frequency to 120Hz.",
    headless: "Run VU server in headless mode (without creating any windows).",
    serverInstancePath: "Set server instance path (where the server configuration, logs, and mods are stored) for the VU server.",
    highResTerrain: "Enable high resolution terrain. Useful for extending maps beyond their original play area.",
    disableTerrainInterpolation: "Disable interpolation between different terrain LODs.",
    skipChecksum: "Disable level checksum validation on client connection.",
    listen: "Set the host and port the VU server should listen for connections on. Defaults to 0.0.0.0:25200",
    mHarmonyPort: "Set the port the VU server should listen for MonitoredHarmony connections. Defaults to 7948",
    remoteAdminPort: "Set the host and port the VU server should listen for RCON connections. Defaults to 0.0.0.0:47200",
    unlisted: "Hide server from server list. Join requires connect console command or vu join string.",
    joinaddr: "Set IPv4 address clients should connect to. If empty backend will attempt to automatically detect the server's IP address.",
    joinhost: "Set a hostname clients should use when connecting. When this is specified -joinaddr has no effect and any clients attempting to connect will not attempt to perform any NAT detection.",
    noUpdate: "Disable automatic updates.",
    maxPlayers: "Set maximum players (vars.maxPlayers + vars.maxSpectators). When using the default spectator size of 24, you won't be able to set vars.maxPlayers higher then 40."
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
    gamepath: "text",
    perftrace: "checkbox",
    env: "select",
    updateBranch: "select",
    tracedc: "checkbox",
    cacert: "text",
    // activateWithOrigin: "credentials",
    // activateWithLSX: "checkbox",
    // activateWithEaToken: "text",
    console: "checkbox",
    debuglog: "checkbox",
    trace: "checkbox",
    vextdebug: "text",
    vexttrace: "checkbox",
  },
  client: {
    dwebui: "checkbox",
    serverJoinString: "text",
    serverSpectateString: "text",
    cefdebug: "checkbox",
    // credentials: "credentials",
    disableUiHwAcceleration: "checkbox",
  },
  server: {
    high60: "checkbox",
    high120: "checkbox",
    headless: "checkbox",
    serverInstancePath: "text",
    highResTerrain: "checkbox",
    disableTerrainInterpolation: "checkbox",
    skipChecksum: "checkbox",
    listen: "text",
    mHarmonyPort: "text",
    remoteAdminPort: "text",
    unlisted: "checkbox",
    joinaddr: "text",
    joinhost: "text",
    noUpdate: "checkbox",
    maxPlayers: "number",
  }
}


