import {invoke} from "@tauri-apps/api/core"

export async function getRandomNumber(){
  const num = await invoke("get_random_number")
  return num
}