use std::{
    fs::{self, read_to_string, write},
    path::PathBuf,
    process::Command,
};

use serde::{Deserialize, Serialize};

use crate::{
    get_user_preferences_as_struct,
    mods::{get_mod_names_in_loadout, install_mods_on_loadout_creation},
    reg_functions, save_user_preferences,
};

#[derive(Serialize, Deserialize, Debug)]
pub struct ServerLoadout {
    pub name: String,
    pub startup: String,
    pub maplist: String,
    pub modlist: String,
    pub banlist: String,
    pub mods: Vec<String>,
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
pub fn create_server_loadout(loadout: ServerLoadout) -> Result<bool, String> {
    let mut loadout_path = get_loadouts_path();
    loadout_path.push(&loadout.name);

    loadout_path.push("Server");
    let server_path = loadout_path.clone();
    loadout_path.push("Admin");

    match fs::exists(&loadout_path) {
        Ok(boolean) => {
            if !boolean {
                _ = fs::create_dir_all(&loadout_path);
            } else {
                println!("Couldn't create loadout: {}", &loadout.name);
                return Ok(false);
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
    let mut mods_path = loadout_path.clone();
    let _ = mods_path.push("Mods");

    let _ = fs::create_dir(mods_path);
    let mod_list = install_mods_on_loadout_creation(&loadout);

    let _ = write(startup_path, loadout.startup);
    let _ = write(modlist_path, mod_list.join("\n"));
    let _ = write(maplist_path, loadout.maplist);
    let _ = write(banlist_path, loadout.banlist);

    println!("{:?}", loadout.mods);

    Ok(true)
}

#[tauri::command]
pub fn edit_server_loadout(loadout: ServerLoadout) -> Result<bool, String> {
    let loadout_path = get_loadout_path(&loadout.name);

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
    let mut mods_path = loadout_path.clone();
    let _ = mods_path.push("Mods");

    let mod_list = install_mods_on_loadout_creation(&loadout);

    let _ = write(startup_path, loadout.startup);
    let _ = write(modlist_path, mod_list.join("\n"));
    let _ = write(maplist_path, loadout.maplist);
    let _ = write(banlist_path, loadout.banlist);

    println!("{:?}", loadout.mods);

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
                match item {
                    Ok(info) => {
                        if info.path().is_dir() {
                            let temp = info.file_name();
                            let temp_as_str = String::from(temp.to_string_lossy());
                            loadout_dirs.push(temp_as_str);
                        }
                    }
                    Err(_) => {
                        println!("Error when reading loadout names.")
                    }
                };
            });
        }
        Err(err) => {
            println!("{:?}", err);
        }
    };
    loadout_dirs
}

#[tauri::command]
pub fn get_server_loadout(name: String) -> String {
    let mut loadout_path: PathBuf = get_loadouts_path();
    loadout_path.push(&name);

    loadout_path.push("Server");
    loadout_path.push("Admin");

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

    let startup_string = match read_to_string(startup_path) {
        Ok(info) => info,
        Err(err) => {
            println!("{:?}", err);
            err.to_string()
        }
    };
    let modlist_string = match read_to_string(modlist_path) {
        Ok(info) => info,
        Err(err) => {
            println!("{:?}", err);
            err.to_string()
        }
    };
    let maplist_string = match read_to_string(maplist_path) {
        Ok(info) => info,
        Err(err) => {
            println!("{:?}", err);
            err.to_string()
        }
    };
    let banlist_string = match read_to_string(banlist_path) {
        Ok(info) => info,
        Err(err) => {
            println!("{:?}", err);
            err.to_string()
        }
    };

    let mods = get_mod_names_in_loadout(&name);
    let my_loadout = ServerLoadout {
        name,
        banlist: banlist_string,
        modlist: modlist_string,
        maplist: maplist_string,
        startup: startup_string,
        mods,
    };

    serde_json::to_string(&my_loadout).unwrap()
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
                match fs::remove_dir_all(&loadout_path) {
                    Ok(_) => {
                        println!("Successfully deleted loadout {}", &name);
                        return true;
                    }
                    Err(err) => {
                        println!("Failed to delete loadout {}", &name);
                        println!("{:?}", err);
                        return false;
                    }
                };
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
        .spawn()
        .expect("failed to execute process");

    return true;
}

#[tauri::command]
pub fn save_server_guid(guid: String) -> bool {
    let preferences = get_user_preferences_as_struct();
    match preferences {
        Ok(mut pref) => {
            pref.server_guid = guid;
            match save_user_preferences(pref) {
                Ok(_) => return true,
                Err(err) => {
                    println!("{:?}", err);
                    return false;
                }
            };
        }
        Err(err) => {
            println!("{:?}", err);
            return false;
        }
    };
}

pub fn get_loadouts_path() -> PathBuf {
    let install_path = match reg_functions::get_install_path_registry() {
        Ok(val) => val,
        Err(err) => err.to_string(),
    };

    let mut loadout_path = PathBuf::new();
    loadout_path.push(install_path);
    loadout_path.push("loadouts");
    return loadout_path;
}

fn get_loadout_path(name: &String) -> PathBuf {
    let mut loadout_path: PathBuf = get_loadouts_path();
    loadout_path.push(&name);

    loadout_path.push("Server");
    loadout_path.push("Admin");
    return loadout_path;
}
