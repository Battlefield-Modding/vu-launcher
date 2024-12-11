import {invoke} from "@tauri-apps/api/core"
import { rust_fns } from "./config/config"

// if a rust fn param is `param_one`
// then js invoke param is `paramOne`

export async function getRandomNumber(){
  const num = await invoke(rust_fns.get_random_number)
  return num
}

export async function firstTimeSetup(){
  await invoke(rust_fns.first_time_setup)
}

export async function saveUserCredentials({username, password}: {username: string, password:string}){
  const preferences = JSON.parse(await invoke(rust_fns.get_user_preferences));
  const newPreferences = {...preferences, username, password}
  const status = await invoke(rust_fns.set_user_preferences, {newPreferences})
  return status
}

export async function playVU(){
  invoke(rust_fns.play_vu)
}