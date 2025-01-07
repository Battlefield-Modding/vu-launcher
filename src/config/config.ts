export const STALE =
{
  default: 60 * 1000, // 60,
  medium: 30 * 1000, // 30s
  short: 15 * 1000, // 15s
  never: 0 // never stale
}

export enum rust_fns {
  get_random_number = 'get_random_number',
  set_launcher_directory = 'set_launcher_directory',
  set_sidebar_status = 'set_sidebar_status',
  first_time_setup = 'first_time_setup',
  get_user_preferences = 'get_user_preferences',
  set_user_preferences = 'set_user_preferences',
  play_vu = 'play_vu',
  is_vu_installed = "is_vu_installed",
  get_vu_data = "get_vu_data",
  download_game = "download_game",
  set_server_loadout = 'set_server_loadout',
  get_loadout_names = 'get_loadout_names',
  delete_server_loadout = 'delete_server_loadout',
  server_key_exists = 'server_key_exists',
  server_key_setup = 'server_key_setup',
  start_server_loadout = 'start_server_loadout',
  save_server_guid = 'save_server_guid',
  get_server_loadout = 'get_server_loadout',
  set_vu_install_location_registry = 'set_vu_install_location_registry',
  open_explorer_for_loadout = 'open_explorer_for_loadout'
}

export enum QueryKey {
  UserList = 'UserList',
  IsVuInstalled = 'IsVuInstalled',
  ServerLoadouts = 'ServerLoadouts',
  ServerKeyExists = 'ServerKeyExists',
  GetServerLoadout = "GetServerLoadout"
}

export enum routes {
  HOME = "/",
  SERVERS = "/servers",
  MODS = "/mods",
  SETTINGS = "/settings"
}

export type Loadout = {
  name: string,
  startup: string,
  maplist: string,
  modlist: string,
  banlist: string,
}