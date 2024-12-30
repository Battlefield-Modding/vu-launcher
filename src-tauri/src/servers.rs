use std::{
    fs::{self, write},
    path::PathBuf,
    process::Command,
};

use serde::{Deserialize, Serialize};

use crate::{get_user_preferences_as_struct, reg_functions};

#[derive(Serialize, Deserialize, Debug)]
pub struct ServerLoadout {
    name: String,
    startup: String,
    maplist: String,
    modlist: String,
    banlist: String,
}

#[tauri::command]
pub fn server_key_exists() -> bool {
    let install_path = match reg_functions::get_install_path_registry() {
        Ok(val) => val,
        Err(_) => return false,
    };

    let mut key_path = PathBuf::new();
    key_path.push(install_path);
    key_path.push("server.key");

    return key_path.exists();
}

#[tauri::command]
pub fn server_key_setup(path: String) -> bool {
    let mut path_to_key = PathBuf::new();
    path_to_key.push(path);

    let install_path = match reg_functions::get_install_path_registry() {
        Ok(val) => val,
        Err(err) => err.to_string(),
    };

    let mut destination_path = PathBuf::new();
    destination_path.push(install_path);
    destination_path.push("server.key");

    let result = fs::copy(path_to_key, destination_path);

    match result {
        Ok(_) => return true,
        Err(_) => return false,
    };
}

fn copy_server_key(path: &PathBuf) {
    let install_path = match reg_functions::get_install_path_registry() {
        Ok(val) => val,
        Err(err) => err.to_string(),
    };

    let mut key_path = PathBuf::new();
    key_path.push(install_path);
    key_path.push("server.key");

    let mut copied_key_path = path.clone();
    let _ = copied_key_path.push("server.key");
    println!("{:?}", copied_key_path);

    match fs::copy(key_path, copied_key_path) {
        Ok(_) => println!("Copied successfully"),
        Err(err) => println!("{:?}", err),
    };
}

#[tauri::command]
pub fn set_server_loadout(loadout: ServerLoadout) -> Result<bool, String> {
    let mut loadout_path = get_loadouts_path();
    loadout_path.push(&loadout.name);

    loadout_path.push("Server");
    let server_path = loadout_path.clone();
    loadout_path.push("Admin");

    match fs::exists(&loadout_path) {
        Ok(boolean) => {
            if !boolean {
                _ = fs::create_dir_all(&loadout_path);
            }
        }
        Err(_) => println!("Couldn't create loadout: {}", &loadout.name),
    }

    // move the server key over once folders are made
    copy_server_key(&server_path);

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

    let dir_reader = fs::read_dir(&loadout_path);
    let mut loadout_dirs: Vec<String> = Vec::new();
    match dir_reader {
        Ok(reader) => {
            reader.for_each(|item| {
                let temp = item.unwrap().file_name();
                let temp_as_str = String::from(temp.to_string_lossy());
                loadout_dirs.push(temp_as_str);
            });
        }
        Err(err) => {
            println!("{:?}", err);
        }
    };
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

#[tauri::command]
pub async fn start_server_loadout(name: String) -> bool {
    let mut loadout_path = get_loadouts_path();
    loadout_path.push(&name);
    loadout_path.push("Server");

    let preferences_prematch = get_user_preferences_as_struct();
    let preferences = match preferences_prematch {
        Ok(info) => info,
        Err(_) => return false,
    };

    let loadout_path_as_str = loadout_path.to_str().unwrap();
    println!("{:?}", loadout_path_as_str);

    Command::new("cmd")
        .args([
            "/C",
            &preferences.venice_unleashed_shortcut_location,
            "-server",
            "-dedicated",
            "-serverInstancePath",
            loadout_path_as_str,
        ])
        .output()
        .expect("failed to execute process");

    return true;
}

fn get_loadouts_path() -> PathBuf {
    let install_path = match reg_functions::get_install_path_registry() {
        Ok(val) => val,
        Err(err) => err.to_string(),
    };

    let mut loadout_path = PathBuf::new();
    loadout_path.push(install_path);
    loadout_path.push("loadouts");
    return loadout_path;
}
