export const defaultServerConfig = {
  "name": "",
  "startup": "# Server\nvars.serverName \"YOUR_SERVER_NAME_HERE\"\nvars.gamePassword \"YOUR_SERVER_PASSWORD_HERE\"\nvars.maxPlayers 32\n#vu.serverbanner \"YOUR_URL_HERE\"\nvars.idleTimeout 9999\n\n# RCON Password\nadmin.password \"YOUR_RCON_PASSWORD_HERE\"\n\n# Teamkilling\nvars.teamKillCountForKick 0\nvars.teamKillValueForKick 2\nvars.teamKillValueIncrease 0.525\nvars.teamKillValueDecreasePerSecond 0.01\nvars.teamKillKickForBan 0\n\n# Reserved Slots\nreservedSlotsList.add \"PlayerName1\"\nreservedSlotsList.add \"PlayerName2\"\n\n# Misc\nvu.DestructionEnabled true\nvu.DesertingAllowed false",
  "maplist": "XP1_002 ConquestLarge0 1 # This will play \"Gulf of Oman\" on CQL once.",
  "modlist": "# funbots",
  "banlist": "# playerNameOne\n# playerNameTwo"
}

export type ServerLoadout = {
  name: string,
  startup: string,
  maplist: string,
  modlist: string,
  banlist: string
}