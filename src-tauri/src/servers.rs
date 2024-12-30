use std::{
    fs::{self, write},
    path::PathBuf,
};

use serde::{Deserialize, Serialize};

use crate::reg_functions;

#[derive(Serialize, Deserialize, Debug)]
pub struct ServerLoadout {
    name: String,
    startup: String,
    maplist: String,
    modlist: String,
    banlist: String,
}

#[tauri::command]
pub fn set_server_loadout(loadout: ServerLoadout) -> Result<bool, String> {
    let mut loadout_path = get_loadouts_path();

    match fs::exists(&loadout_path) {
        Ok(boolean) => {
            if !boolean {
                _ = fs::create_dir(&loadout_path)
            }
        }
        Err(_) => println!("Couldn't create /servers folder"),
    }

    loadout_path.push(&loadout.name);

    match fs::exists(&loadout_path) {
        Ok(boolean) => {
            if !boolean {
                _ = fs::create_dir(&loadout_path)
            }
        }
        Err(_) => println!("Couldn't create /{:?} folder", &loadout.name),
    }

    let mut startup_path = loadout_path.clone();
    let _ = startup_path.push("startup.txt");
    println!("{:?}", startup_path);
    let mut maplist_path = loadout_path.clone();
    let _ = maplist_path.push("maplist.txt");
    println!("{:?}", maplist_path);
    let mut modlist_path = loadout_path.clone();
    let _ = modlist_path.push("modlist.txt");
    println!("{:?}", modlist_path);
    let mut banlist_path = loadout_path.clone();
    let _ = banlist_path.push("banlist.txt");
    println!("{:?}", banlist_path);

    let _ = write(startup_path, loadout.startup);
    let _ = write(modlist_path, loadout.modlist);
    let _ = write(maplist_path, loadout.maplist);
    let _ = write(banlist_path, loadout.banlist);

    Ok(true)
}

#[tauri::command]
pub fn get_loadout_names() -> Vec<String> {
    // this function will return content from all server loadouts
    let loadout_path = get_loadouts_path();

    let dir_reader = fs::read_dir(&loadout_path).unwrap();
    let mut loadout_dirs: Vec<String> = Vec::new();
    dir_reader.for_each(|item| {
        let temp = item.unwrap().file_name();
        let temp_as_str = String::from(temp.to_string_lossy());
        loadout_dirs.push(temp_as_str);
    });

    loadout_dirs
}

#[tauri::command]
pub fn delete_server_loadout(name: String) -> bool {
    // this function will return content from all server loadouts
    let mut loadout_path = get_loadouts_path();
    println!("{:?}", loadout_path);
    loadout_path.push(&name);
    println!("{:?}", loadout_path);

    match fs::exists(&loadout_path) {
        Ok(folder_exists) => {
            if folder_exists {
                println!("Removing dir: {:?}", loadout_path);
                return fs::remove_dir_all(&loadout_path).is_ok();
            }
            return false;
        }
        Err(_) => return false,
    }
}

fn get_loadouts_path() -> PathBuf {
    let install_path = match reg_functions::get_install_path_registry() {
        Ok(val) => val,
        Err(err) => err.to_string(),
    };

    let mut loadout_path = PathBuf::new();
    loadout_path.push(install_path);
    loadout_path.push("servers");
    return loadout_path;
}