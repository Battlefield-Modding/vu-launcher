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


