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
  download_game = "download_game"
}

export enum routes {
  HOME = "/",
  SERVERS = "/servers",
  MODS = "/mods",
  SETTINGS = "/settings"
}