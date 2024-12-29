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
pub fn update_server_config(loadout: ServerLoadout) -> Result<bool, String> {
    let install_path = match reg_functions::get_install_path_registry() {
        Ok(val) => val,
        Err(err) => err.to_string(),
    };

    let mut loadout_path = PathBuf::new();
    loadout_path.push(install_path);
    loadout_path.push("servers");

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
