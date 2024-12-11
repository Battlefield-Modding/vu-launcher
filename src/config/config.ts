export const DEFAULT_STALE_TIME = 60 * 1000 // 60 seconds

export enum rust_fns {
  get_random_number = 'get_random_number',
  set_launcher_directory = 'set_launcher_directory',
  set_sidebar_status = 'set_sidebar_status',
  first_time_setup = 'first_time_setup',
  get_user_preferences = 'get_user_preferences',
  set_user_preferences = 'set_user_preferences',
  play_vu = 'play_vu'
}