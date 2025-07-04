import { LaunchArguments } from '@/routes/Servers/components/Forms/LaunchArguments/setup/LaunchArguments'
import { StartupArgs } from '@/routes/Servers/components/Forms/Startup/Setup/StartupTypes'

export const STALE = {
  default: 60 * 1000, // 60,
  medium: 30 * 1000, // 30s
  short: 15 * 1000, // 15s
  never: 0, // never stale
}

export type UserCredential = {
  username: string
  password: string
}

export enum rust_fns {
  get_random_number = 'get_random_number',
  set_launcher_directory = 'set_launcher_directory',
  set_sidebar_status = 'set_sidebar_status',
  first_time_setup = 'first_time_setup',
  get_user_preferences = 'get_user_preferences',
  set_user_preferences = 'set_user_preferences',
  play_vu = 'play_vu',
  is_vu_installed = 'is_vu_installed',
  is_vu_dev_installed = 'is_vu_dev_installed',
  get_vu_data = 'get_vu_data',
  download_game = 'download_game',
  create_loadout = 'create_loadout',
  get_loadout_names = 'get_loadout_names',
  delete_loadout = 'delete_loadout',
  server_key_exists = 'server_key_exists',
  server_key_setup = 'server_key_setup',
  start_loadout = 'start_loadout',
  save_server_guid = 'save_server_guid',
  set_vu_install_location_registry = 'set_vu_install_location_registry',
  set_vu_dev_branch_install_location_registry = 'set_vu_dev_branch_install_location_registry',
  open_explorer_for_loadout = 'open_explorer_for_loadout',
  get_mod_names_in_cache = 'get_mod_names_in_cache',
  import_zipped_mod_to_cache = 'import_zipped_mod_to_cache',
  import_mod_folder_to_cache = 'import_mod_folder_to_cache',
  import_zipped_mod_to_loadout = 'import_zipped_mod_to_loadout',
  import_mod_folder_to_loadout = 'import_mod_folder_to_loadout',
  remove_mod_from_cache = 'remove_mod_from_cache',
  edit_loadout = 'edit_loadout',
  import_loadout_from_path = 'import_loadout_from_path',
  get_mod_names_in_loadout = 'get_mod_names_in_loadout',
  remove_mod_from_loadout = 'remove_mod_from_loadout',
  open_mod_with_vscode = 'open_mod_with_vscode',
  play_vu_on_local_server = 'play_vu_on_local_server',
  get_all_loadout_json = 'get_all_loadout_json',
  refresh_loadout = 'refresh_loadout',
  activate_bf3_lsx = 'activate_bf3_lsx',
  activate_bf3_ea_auth_token = 'activate_bf3_ea_auth_token',
  copy_vu_prod_to_folder = 'copy_vu_prod_to_folder',
  add_vu_credentials = 'add_vu_credentials',
  remove_vu_credentials = 'remove_vu_credentials',
  install_mod_to_loadout_from_cache = 'install_mod_to_loadout_from_cache',
  get_all_loadout_names = 'get_all_loadout_names',
  get_loadout_json = 'get_loadout_json',
  make_cache_folder_names_same_as_mod_json_names = 'make_cache_folder_names_same_as_mod_json_names',
}

export enum QueryKey {
  UserList = 'UserList',
  IsVuInstalled = 'IsVuInstalled',
  ServerLoadouts = 'ServerLoadouts',
  ServerKeyExists = 'ServerKeyExists',
  GetServerLoadout = 'GetServerLoadout',
  GetModNamesInCache = 'GetModNamesInCache',
  CredentialsExist = 'CredentialsExist',
  ServerList = 'ServerList',
  PlayVUInformation = 'PlayVUInformation',
  UserPreferences = 'UserPreferences',
  GetAllLoadoutJSON = 'GetAllLoadoutJSON',
  GetAllModNames = 'GetAllModNames',
  GetAllLoadoutNames = 'GetAllLoadoutNames',
  GetLoadoutJSON = 'GetLoadoutJSON',
}

export enum routes {
  HOME = '/',
  SERVERS = '/servers',
  MODS = '/mods',
  SETTINGS = '/settings',
  ONBOARDING = '/onboarding',
}

export type Loadout = {
  name: string
  startup: string
  maplist: string
  modlist: string
  banlist: string
  mods: string[]
}

export type Map = {
  mapCode: string
  gameMode: string
}

export type LoadoutJSON = {
  name: string
  startup: StartupArgs
  launch: LaunchArguments
  maplist: Map[]
  banlist?: string[]
  modlist?: GameMod[]
}

export type GameMod = {
  name: string
  version: string
  image?: string
  src?: string
  enabled: boolean
}

export type LoadoutJSON_AndMods = LoadoutJSON & { mods?: string[] }

export type DragDropEventTauri = {
  event: string
  payload: {
    paths: string[]
    position: {
      x: number
      y: number
    }
  }
  id: number
}

export type UserPreferences = {
  is_sidebar_enabled: boolean
  venice_unleashed_shortcut_location: string
  dev_venice_unleashed_shortcut_location: string
  usernames: string[]
  servers: SavedServer[]
  server_guid: string
  show_multiple_account_join: boolean
  is_onboarded: boolean
  use_dev_branch: boolean
  preferred_player_index: number
  preferred_server_index: number
  last_visted_route: string
  automatically_check_for_updates: boolean
  automatically_install_update_if_found: boolean
}

export type SavedServer = {
  nickname: string
  guid: string
}
