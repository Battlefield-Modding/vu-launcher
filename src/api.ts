import {invoke} from "@tauri-apps/api/core"
import { rust_fns } from "./config/config"
import { ServerLoadout } from "./routes/Servers/defaultServerConfig"

export async function firstTimeSetup(){
  await invoke(rust_fns.first_time_setup)
}

export async function saveUserCredentials({username, password}: {username: string, password:string}){
  const preferences = JSON.parse(await invoke(rust_fns.get_user_preferences));
  const accounts = preferences.accounts ?? []
  accounts.push({username, password})
  console.log(accounts)
  const newPreferences = {...preferences, accounts}
  console.log(newPreferences)
  const status = await invoke(rust_fns.set_user_preferences, {newPreferences})
  return status
}

export async function playVU(){
  invoke(rust_fns.play_vu)
}

function isValidCredential(cred: String){
  if (typeof cred === "string"){
    if (cred.length >= 2) {
      return true
    }
  }
  return false
}

export async function doesCredentialsExist(): Promise<boolean>{
  const {accounts} = await getUserPreferences()
  if(accounts[0]){
    if (isValidCredential(accounts[0].username) && isValidCredential(accounts[0].password)){
      return true
    }
  }
  return false
}

export async function getUserPreferences(){
  const info = JSON.parse(await invoke(rust_fns.get_user_preferences))
  return info
}

export async function getaccounts(){
  const {accounts} = await getUserPreferences()
  console.log(accounts)
  return accounts
}

export async function vuIsInstalled(): Promise<boolean> {
  const info = JSON.parse(await invoke(rust_fns.is_vu_installed))
  return info
}

export async function fetchVUData(){
  const info = JSON.parse(await invoke(rust_fns.get_vu_data))
  console.log(info)
}

export async function fetchVUDataDummy(){
  const info = { 
    buildnum: 20079, 
    installer_url: "https://veniceunleashed.net/files/vu.exe", 
    installer_size: 116838512, 
    zip_url: "https://veniceunleashed.net/files/vu.zip", 
    zip_size: 166447363 
  }
  return info
}

export async function updateServerConfig(loadout: ServerLoadout){
  const status = JSON.parse(await invoke(rust_fns.set_server_loadout, {loadout}))
  return status
}

export async function getLoadoutNames(){
  const info = await invoke(rust_fns.get_loadout_names)
  return info
}

export async function deleteServerLoadout(name: String){
  console.log(`Deleting: ${name}`)
  const info = await invoke(rust_fns.delete_server_loadout, {name})
  return info
}

export async function serverKeyExists(){
  const info = await invoke(rust_fns.server_key_exists)
  console.log(`Server Key Exists? ${info}`)
  return info
}

export async function serverKeySetup(path: String){
  const info = await invoke(rust_fns.server_key_setup, {path})
  console.log(`Server Key Created? ${info}`)
  return info
}