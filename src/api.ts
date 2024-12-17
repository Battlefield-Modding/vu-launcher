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

function isValidCredential(cred: String){
  if (typeof cred === "string"){
    if (cred.length >= 2) {
      return true
    }
  }
  return false
}

export async function doesCredentialsExist(): Promise<boolean>{
  const info = await getUserPreferences()
  if (isValidCredential(info.username) && isValidCredential(info.password)){
    return true
  }
  return false
}

export async function getUserPreferences(){
  const info = JSON.parse(await invoke(rust_fns.get_user_preferences))
  return info
}

export async function getUsers(){
  const info = await getUserPreferences()
  const users = [
    {username: info.username, password: info.password},
    {username: "TestOne", password: info.password},
    {username: "TestTwo", password: info.password},

  ]
  console.log(users)
  return users
}

export async function vuIsInstalled(): Promise<boolean> {
  const info = JSON.parse(await invoke(rust_fns.is_vu_installed))
  return info
}