import { invoke } from '@tauri-apps/api/core'
import { GameMod, LoadoutJSON, rust_fns, SavedServer, UserPreferences } from './config/config'

export async function firstTimeSetup(): Promise<boolean> {
  const status = (await invoke(rust_fns.first_time_setup)) as boolean
  return status
}

export async function saveUserPreferences(newPreferences: UserPreferences): Promise<boolean> {
  const status = (await invoke(rust_fns.set_user_preferences, { newPreferences })) as boolean
  return status
}

export async function saveUserCredentials({
  username,
  password,
}: {
  username: string
  password: string
}) {
  const preferences = JSON.parse(await invoke(rust_fns.get_user_preferences))
  const usernames = preferences.usernames ?? []
  usernames.push(username)
  const newPreferences = { ...preferences, usernames }
  const pwStatus = await invoke(rust_fns.add_vu_credentials, { username, password })
  if (pwStatus) {
    const prefStatus = await invoke(rust_fns.set_user_preferences, { newPreferences })
    if (prefStatus) {
      return true
    }
  }

  return false
}

export async function playVU({
  accountIndex,
  useDevBranch,
}: {
  accountIndex: number
  useDevBranch: boolean
}): Promise<boolean> {
  const status = (await invoke(rust_fns.play_vu, {
    accountIndex,
    useDevBranch,
  })) as boolean
  return status
}

export async function playVUOnLocalServer(loadoutName: string, users?: number[]) {
  if (users) {
    invoke(rust_fns.play_vu_on_local_server, { name: loadoutName, users })
  } else {
    invoke(rust_fns.play_vu_on_local_server, { name: loadoutName, users: [] })
  }
}

export async function doesCredentialsExist(): Promise<boolean> {
  const { usernames } = await getUserPreferences()
  if (usernames[0]) {
    return true
  }
  return false
}

export async function getUserPreferences(): Promise<UserPreferences> {
  const info = JSON.parse(await invoke(rust_fns.get_user_preferences)) as UserPreferences
  return info
}

export async function getUsers(): Promise<string[]> {
  const { usernames } = await getUserPreferences()
  return usernames
}

export async function vuProdIsInstalled(): Promise<boolean> {
  const info = JSON.parse(await invoke(rust_fns.is_vu_installed))
  return info
}

export async function vuDevIsInstalled(): Promise<boolean> {
  const info = JSON.parse(await invoke(rust_fns.is_vu_dev_installed))
  console.log(`VU Dev installation status: ${info}`)
  return info
}

export async function fetchVUData() {
  const info = JSON.parse(await invoke(rust_fns.get_vu_data))
  console.log(info)
}

export async function fetchVUDataDummy() {
  const info = {
    buildnum: 20079,
    installer_url: 'https://veniceunleashed.net/files/vu.exe',
    installer_size: 116838512,
    zip_url: 'https://veniceunleashed.net/files/vu.zip',
    zip_size: 166447363,
  }
  return info
}

export async function createServerLoadout(loadout: LoadoutJSON) {
  const status = JSON.parse(await invoke(rust_fns.create_loadout, { loadout }))
  return status
}

export async function editServerLoadout(loadout: any) {
  const status = JSON.parse(await invoke(rust_fns.edit_loadout, { loadout }))
  return status
}

export async function getLoadoutNames(): Promise<string[]> {
  const info = (await invoke(rust_fns.get_loadout_names)) as string[]
  return info
}

export async function deleteServerLoadout(name: string): Promise<boolean> {
  const info = (await invoke(rust_fns.delete_loadout, { name })) as boolean
  return info
}

export async function serverKeyExists(): Promise<boolean> {
  const info = (await invoke(rust_fns.server_key_exists)) as boolean
  return info
}

export async function serverKeySetup(path: string) {
  const info = await invoke(rust_fns.server_key_setup, { path })
  return info
}

export async function startServerLoadout(name: string) {
  const info = await invoke(rust_fns.start_loadout, { name })
  return info
}

export async function saveServerGUID(guid: string) {
  const status = await invoke(rust_fns.save_server_guid, { guid })
  return status
}

export async function setVUInstallLocationRegistry(installdir: string) {
  const info = await invoke(rust_fns.set_vu_install_location_registry, { installdir })
  return info
}

export async function setVUDevInstallLocationRegistry(installdir: string) {
  const info = await invoke(rust_fns.set_vu_dev_branch_install_location_registry, { installdir })
  return info
}

export async function setVUInstallLocationPreference(installPath: string) {
  const preferences = await getUserPreferences()
  preferences.venice_unleashed_shortcut_location = installPath
  const status = await saveUserPreferences(preferences)
  return status
}

export async function setVUDevInstallLocationPreference(installPath: string) {
  const preferences = await getUserPreferences()
  preferences.dev_venice_unleashed_shortcut_location = installPath
  const status = await saveUserPreferences(preferences)
  return status
}

export async function openExplorerAtLoadout(loadoutName: string) {
  await invoke(rust_fns.open_explorer_for_loadout, { loadoutName })
}

export async function getModNamesInCache(): Promise<GameMod[]> {
  const names = (await invoke(rust_fns.get_mod_names_in_cache)) as GameMod[]
  return names
}

export async function importZippedModToCache(modLocation: string): Promise<boolean> {
  const status = (await invoke(rust_fns.import_zipped_mod_to_cache, { modLocation })) as boolean
  return status
}

export async function importZippedModToLoadout({
  modLocation,
  loadoutName,
}: {
  modLocation: string
  loadoutName: string
}): Promise<boolean> {
  const status = (await invoke(rust_fns.import_zipped_mod_to_loadout, {
    modLocation,
    loadoutName,
  })) as boolean
  return status
}

export async function importModFolderToCache(modLocation: string): Promise<boolean> {
  const status = (await invoke(rust_fns.import_mod_folder_to_cache, { modLocation })) as boolean
  return status
}

export async function importModFolderToLoadout({
  modLocation,
  loadoutName,
}: {
  modLocation: string
  loadoutName: string
}): Promise<boolean> {
  const status = (await invoke(rust_fns.import_mod_folder_to_loadout, {
    modLocation,
    loadoutName,
  })) as boolean
  return status
}

export async function removeModFromCache(modName: string): Promise<boolean> {
  const status = (await invoke(rust_fns.remove_mod_from_cache, { modName })) as boolean
  return status
}

export async function importLoadoutFromPath(name: string, path: string): Promise<boolean> {
  const status = (await invoke(rust_fns.import_loadout_from_path, { name, path })) as boolean
  return status
}

export async function getModNamesInLoadout(name: string): Promise<GameMod[]> {
  const status = (await invoke(rust_fns.get_mod_names_in_loadout, { name })) as GameMod[]
  return status
}

export async function removeModFromLoadout(name: string, modname: string): Promise<boolean> {
  const status = (await invoke(rust_fns.remove_mod_from_loadout, { name, modname })) as boolean
  return status
}

export async function openModWithVsCode({
  name,
  modname,
}: {
  name: string
  modname: string
}): Promise<boolean> {
  const status = (await invoke(rust_fns.open_mod_with_vscode, { name, modname })) as boolean
  return status
}

export async function deleteUserCredentials({ username }: { username: string }) {
  const preferences = JSON.parse(await invoke(rust_fns.get_user_preferences)) as UserPreferences
  const usernames = preferences.usernames ?? []
  const filteredUsernames = usernames.filter((name) => {
    if (username !== name) {
      return name
    }
  })
  const newPreferences = { ...preferences, usernames: filteredUsernames }
  const accStatus = await invoke(rust_fns.remove_vu_credentials, { username })
  if (accStatus) {
    const prefStatus = await invoke(rust_fns.set_user_preferences, { newPreferences })
    if (prefStatus) {
      return true
    }
  }
  return false
}

export async function getAllServers(): Promise<SavedServer[]> {
  const { servers } = await getUserPreferences()
  return servers
}

export async function getServersAndAccounts(): Promise<{
  servers: SavedServer[]
  usernames: string[]
}> {
  const { servers, usernames } = await getUserPreferences()
  return { servers, usernames }
}

export async function deleteServer({ server }: { server: SavedServer }): Promise<boolean> {
  const preferences = JSON.parse(await invoke(rust_fns.get_user_preferences)) as UserPreferences
  const servers = preferences.servers ?? []

  const filteredServers = servers.filter((item) => {
    if (item.guid !== server.guid) {
      return item
    }
  })

  const newPreferences = { ...preferences, servers: filteredServers }
  const status = (await invoke(rust_fns.set_user_preferences, { newPreferences })) as boolean

  return status
}

export async function addServer({
  nickname,
  guid,
  password,
}: {
  nickname: string
  guid: string
  password: string
}): Promise<boolean> {
  const preferences = JSON.parse(await invoke(rust_fns.get_user_preferences))
  const servers = preferences.servers ?? []
  servers.push({ nickname, guid, password })
  const newPreferences = { ...preferences, servers }
  const status = (await invoke(rust_fns.set_user_preferences, { newPreferences })) as boolean
  return status
}

export async function getAllLoadoutJson(): Promise<LoadoutJSON[]> {
  const loadoutJson = (await invoke(rust_fns.get_all_loadout_json)) as LoadoutJSON[]
  return loadoutJson
}

export async function refreshLoadout(loadoutName: string) {
  const status = await invoke(rust_fns.refresh_loadout, { loadoutName: loadoutName })
  return status
}

export async function activateBf3LSX() {
  const status = await invoke(rust_fns.activate_bf3_lsx)
  return status
}

export async function activateBf3EaAuthToken(token: string) {
  const status = await invoke(rust_fns.activate_bf3_ea_auth_token, { token })
  return status
}

export async function finishOnboarding(): Promise<boolean> {
  const preferences = await getUserPreferences()
  preferences.is_onboarded = true
  const status = await saveUserPreferences(preferences)
  return status
}

export async function toggleDevBranch(state: boolean): Promise<boolean> {
  const preferences = await getUserPreferences()
  preferences.use_dev_branch = state
  const status = await saveUserPreferences(preferences)
  return status
}

export async function setPreferredPlayer(index: number): Promise<boolean> {
  const preferences = await getUserPreferences()
  preferences.preferred_player_index = index
  const status = await saveUserPreferences(preferences)
  return status
}

export async function setPreferredServer(index: number): Promise<boolean> {
  const preferences = await getUserPreferences()
  preferences.preferred_server_index = index
  const status = await saveUserPreferences(preferences)
  return status
}

export async function setIgnoreUpdateVersion(version: string): Promise<boolean> {
  const preferences = await getUserPreferences()
  preferences.ignore_update_version = version
  const status = await saveUserPreferences(preferences)
  return status
}

export async function installModToLoadoutFromCache({
  loadoutName,
  gameMod,
}: {
  loadoutName: string
  gameMod: GameMod
}) {
  const status = await invoke(rust_fns.install_mod_to_loadout_from_cache, { loadoutName, gameMod })
  return status
}

export async function installModToLoadout({
  loadoutName,
  modName,
}: {
  loadoutName: string
  modName: string
}) {
  const status = await invoke(rust_fns.install_mod_to_loadout_from_cache, { loadoutName, modName })
  return status
}

export async function getAllLoadoutNames(): Promise<Array<string>> {
  const names = (await invoke(rust_fns.get_all_loadout_names, {})) as string[]
  return names
}

export async function getLoadoutJson(loadoutName: string): Promise<Array<LoadoutJSON>> {
  const loadoutJson = (await invoke(rust_fns.get_loadout_json, {
    loadoutName,
  })) as Array<LoadoutJSON>

  return loadoutJson
}

export async function refreshModCacheFolderNames() {
  const status = await invoke(rust_fns.make_cache_folder_names_same_as_mod_json_names, {})
  return status
}

export async function toggleMod({
  gameMod,
  loadoutName,
}: {
  gameMod: GameMod
  loadoutName: string
}) {
  const status = await invoke(rust_fns.toggle_mod, { gameMod, loadoutName })
  return status
}

export async function getLauncherInstallPath(): Promise<string> {
  const path = (await invoke(rust_fns.get_launcher_install_path)) as string
  return path
}

export async function openExplorerAtLauncherInstallPath(): Promise<boolean> {
  const status = (await invoke(rust_fns.open_explorer_at_launcher_install_path)) as boolean
  return status
}
