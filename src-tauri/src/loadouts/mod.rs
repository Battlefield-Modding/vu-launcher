use std::{
    fs::{self, read_dir, read_to_string, write},
    io::{self},
    os::windows::process::CommandExt,
    path::PathBuf,
    process::Command,
};

use loadout_structs::{GameMod, LaunchArguments, LoadoutJson, Map, ModJson};
use serde_json::Error;

use crate::{
    get_user_preferences_as_struct,
    loadouts::{
        launch_arg_selector::{
            loadout_common_launch_args_to_vec, loadout_server_launch_args_to_vec,
        },
        loadout_txt_handlers::{
            import_banlist_txt_into_loadout, import_maplist_txt_into_loadout,
            import_modlist_txt_into_loadout, import_startup_txt_into_loadout, make_txt_ready,
            write_to_txt_from_loadout,
        },
    },
    preferences, registry, CREATE_NEW_CONSOLE, CREATE_NO_WINDOW,
};

pub mod loadout_structs;

pub mod launch_arg_selector;
pub mod loadout_modification;
pub mod loadout_txt_handlers;

pub fn get_loadout_json_as_struct(loadout_name: &String) -> io::Result<LoadoutJson> {
    let mut path_to_loadout_json = get_loadout_path(&loadout_name);
    path_to_loadout_json.push("loadout.json");
    let json_info = read_to_string(&path_to_loadout_json)?;
    let loadout_struct: LoadoutJson = serde_json::from_str(&json_info)?;
    Ok(loadout_struct)
}

fn convert_loadout_json_to_string(loadout: &LoadoutJson) -> io::Result<String> {
    let loadout_string = serde_json::to_string_pretty(loadout)?;
    Ok(loadout_string)
}

pub fn write_loadout_json(loadout: &LoadoutJson) -> io::Result<bool> {
    let mut path_to_loadout_json = get_loadout_path(&loadout.name);
    path_to_loadout_json.push("loadout.json");

    let loadout_json_string = convert_loadout_json_to_string(&loadout)?;

    write(&path_to_loadout_json, loadout_json_string)?;

    Ok(true)
}

#[tauri::command]
pub fn refresh_loadout(loadout_name: String) -> bool {
    // this function will write loadout json again
    match write_to_txt_from_loadout(&loadout_name) {
        Ok(status) => return status,
        Err(err) => {
            println!(
                "Failed to write to txt from loadout when refreshing due to error:\n{:?}",
                err
            );
            return false;
        }
    };
}

fn is_loadout(path: &PathBuf) -> bool {
    let mut loadout_json_path = path.clone();
    loadout_json_path.push("Server");
    return loadout_json_path.exists();
}

pub fn has_loadout_json(path: &PathBuf) -> bool {
    let mut server_path = path.clone();
    server_path.push("loadout.json");
    return server_path.exists();
}

pub fn make_loadout_json_from_txt_files(loadout_name: &String) -> io::Result<bool> {
    let startup_args = import_startup_txt_into_loadout(&loadout_name)?;
    let maplist_args = match import_maplist_txt_into_loadout(&loadout_name) {
        Ok(info) => info,
        Err(_) => {
            let empty_vec: Vec<Map> = Vec::new();
            empty_vec
        }
    };
    let banlist_args = match import_banlist_txt_into_loadout(&loadout_name) {
        Ok(info) => info,
        Err(_) => {
            let empty_vec: Vec<String> = Vec::new();
            empty_vec
        }
    };
    let modlist_args = match import_modlist_txt_into_loadout(&loadout_name) {
        Ok(info) => info,
        Err(_) => {
            let empty_vec = Vec::new();
            empty_vec
        }
    };

    let mut loadout_path = get_loadouts_path();
    loadout_path.push(&loadout_name);
    loadout_path.push("Server");

    let mut launch_args = LaunchArguments::default();

    launch_args.server.serverInstancePath = Some(String::from(loadout_path.to_str().unwrap()));

    let loadout_json = LoadoutJson {
        name: String::from(loadout_name),
        startup: startup_args,
        launch: launch_args,
        maplist: maplist_args,
        banlist: banlist_args,
        modlist: modlist_args,
    };

    write_loadout_json(&loadout_json)?;
    write_to_txt_from_loadout(loadout_name)?;

    Ok(true)
}

pub fn get_all_mod_json_in_loadout(loadout_name: &String) -> Vec<GameMod> {
    let mut loadout_path = get_loadouts_path();
    loadout_path.push(&loadout_name);
    loadout_path.push("Server");
    loadout_path.push("Admin");
    loadout_path.push("Mods");

    let dir_reader = fs::read_dir(&loadout_path);
    let mut mod_data: Vec<GameMod> = Vec::new();
    match dir_reader {
        Ok(reader) => {
            reader.for_each(|item| {
                match item {
                    Ok(info) => {
                        match info.path().is_dir() {
                            true => {
                                let mut path_to_mod_json = info.path().clone();
                                path_to_mod_json.push("mod.json");

                                match read_to_string(path_to_mod_json) {
                                    Ok(info) => {
                                        let game_mod: Result<ModJson, Error> =
                                            serde_json::from_str(&info);
                                        match game_mod {
                                            Ok(mod_info) => {
                                                let mod_info = GameMod {
                                                    name: mod_info.Name,
                                                    version: mod_info.Version,
                                                    image: None,
                                                    src: mod_info.URL,
                                                    enabled: false,
                                                };
                                                mod_data.push(mod_info);
                                            }
                                            Err(err) => {
                                                println!(
                                                    "Failed to read Game Mod due to error:\n{:?}",
                                                    err
                                                );
                                            }
                                        }
                                    }
                                    Err(_) => {
                                        println!("No mod.json in this folder. Ignoring.")
                                    }
                                }
                            }
                            false => {}
                        };
                    }
                    Err(_) => {
                        println!("Error when reading mod names.")
                    }
                };
            });
        }
        Err(err) => {
            println!("{:?}", err);
        }
    };
    mod_data
}

pub fn build_string(prefix: &String, key: &String, value: &String) -> String {
    let mut temp_string = String::new();
    temp_string.push_str(&prefix);
    temp_string.push_str(".");
    temp_string.push_str(key);
    temp_string.push_str(" ");
    temp_string.push_str(value);
    temp_string
}

fn get_startup_as_string_array(loadout: &LoadoutJson) -> Vec<String> {
    let mut all_args: Vec<String> = Vec::new();
    let vars = serde_json::to_value(&loadout.startup.vars);
    let rm = serde_json::to_value(&loadout.startup.RM);
    let admin = serde_json::to_value(&loadout.startup.admin);
    let vu = serde_json::to_value(&loadout.startup.vu);
    let reserved_slots = serde_json::to_value(&loadout.startup.reservedSlots);

    let mut vars_info = make_txt_ready(vars, String::from("vars"));
    let mut rm_info = make_txt_ready(rm, String::from("RM"));
    let mut admin_info = make_txt_ready(admin, String::from("admin"));
    let mut vu_info = make_txt_ready(vu, String::from("vu"));
    let mut reserved_slots_info = make_txt_ready(reserved_slots, String::from("reservedSlots"));

    all_args.append(&mut vars_info);
    all_args.append(&mut rm_info);
    all_args.append(&mut admin_info);
    all_args.append(&mut vu_info);
    all_args.append(&mut reserved_slots_info);

    all_args
}

fn get_maplist_as_string_array(loadout: &LoadoutJson) -> Vec<String> {
    let maplist = &loadout.maplist;

    let mut string_vec = Vec::new();

    for map in maplist {
        let mut temp_str = String::new();
        temp_str.push_str(&map.mapCode);
        temp_str.push_str(" ");
        temp_str.push_str(&map.gameMode);
        temp_str.push_str(" 1");
        string_vec.push(temp_str);
    }

    string_vec
}

fn get_modlist_as_string_array(loadout: &LoadoutJson) -> Vec<String> {
    let mut simple_mod_vec: Vec<String> = Vec::new();

    loadout.modlist.iter().for_each(|game_mod| {
        if game_mod.enabled {
            simple_mod_vec.push(String::from(game_mod.name.clone()))
        }
    });

    simple_mod_vec
}

#[tauri::command]
pub fn get_all_loadout_names() -> Vec<String> {
    let loadout_path = get_loadouts_path();

    let dir_reader = read_dir(&loadout_path);
    let mut loadouts: Vec<String> = Vec::new();
    match dir_reader {
        Ok(reader) => {
            reader.for_each(|item| {
                match item {
                    Ok(info) => {
                        if info.path().is_dir() {
                            if is_loadout(&info.path()) {
                                let temp = info.file_name();
                                let loadout_name = String::from(temp.to_string_lossy());
                                if has_loadout_json(&info.path()) {
                                    loadouts.push(loadout_name);
                                }
                            }
                        }
                    }
                    Err(_) => {
                        println!("Error when reading loadout Json.")
                    }
                };
            });
        }
        Err(err) => {
            println!(
                "Failed to get loadout JSON at path {:?} due to reason: \n{:?}",
                &loadout_path, err
            );
        }
    };
    println!("{:?}", loadouts);
    loadouts
}

#[tauri::command]
pub fn get_loadout_json(loadout_name: String) -> Vec<LoadoutJson> {
    let mut loadout_json = Vec::new();
    match get_loadout_json_as_struct(&loadout_name) {
        Ok(loadout) => {
            loadout_json.push(loadout);
            return loadout_json;
        }
        Err(err) => {
            println!(
                "Failed to get loadout json for {} due to error: \n{:?}",
                loadout_name, err
            );
            // sleep for 100ms to allow for creation of new maplist/modlist/etc
            match make_loadout_json_from_txt_files(&loadout_name) {
                Ok(_) => {
                    println!("Successfully made loadout JSON from txt files.");

                    match get_loadout_json_as_struct(&loadout_name) {
                        Ok(loadout) => {
                            loadout_json.push(loadout);
                        }
                        Err(err) => {
                            println!(
                                "Failed to get loadout json for {} due to error: \n{:?}",
                                loadout_name, err
                            );
                        }
                    }
                }
                Err(err) => {
                    println!(
                        "Failed to create loadout JSON from txt files due to error:\n{:?}",
                        err
                    );
                }
            };
        }
    }
    loadout_json
}

#[tauri::command]
pub fn get_all_loadout_json() -> Vec<LoadoutJson> {
    // this function will return content from all server loadouts
    let loadout_path = get_loadouts_path();

    let dir_reader = read_dir(&loadout_path);
    let mut loadouts: Vec<LoadoutJson> = Vec::new();
    match dir_reader {
        Ok(reader) => {
            reader.for_each(|item| {
                match item {
                    Ok(info) => {
                        if info.path().is_dir() {
                            if is_loadout(&info.path()) {
                                let temp = info.file_name();
                                let loadout_name = String::from(temp.to_string_lossy());
                                if has_loadout_json(&info.path()){
                                    match get_loadout_json_as_struct(&loadout_name){
                                        Ok(loadout) => {
                                            loadouts.push(loadout);
                                        },
                                        Err(err) => {
                                            println!("Failed to get loadout json for {} due to error: \n{:?}", loadout_name, err);
                                        }
                                    }
                                } else {
                                    println!("Did not find loadout.json for loadout {}. Creating one now...", &loadout_name);
                                    match make_loadout_json_from_txt_files(&loadout_name){
                                        Ok(_)=>{
                                            println!("Successfully made loadout JSON from txt files.");

                                            if has_loadout_json(&info.path()){
                                                match get_loadout_json_as_struct(&loadout_name){
                                                    Ok(loadout) => {
                                                        loadouts.push(loadout);
                                                    },
                                                    Err(err) => {
                                                        println!("Failed to get loadout json for {} due to error: \n{:?}", loadout_name, err);
                                                    }
                                                }
                                            }
                                        },
                                        Err(err) => {
                                            println!("Failed to create loadout JSON from txt files due to error:\n{:?}", err);
                                        }
                                    };
                                }
                            }
                        }
                    },
                    Err(_) => {
                        println!("Error when reading loadout Json.")
                    }
                };
            });
        }
        Err(err) => {
            println!(
                "Failed to get loadout JSON at path {:?} due to reason: \n{:?}",
                &loadout_path, err
            );
        }
    };
    loadouts
}

#[tauri::command]
pub fn server_key_exists() -> bool {
    let install_path = match registry::get_install_path_registry() {
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

    let install_path = match registry::get_install_path_registry() {
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
    match registry::get_install_path_registry() {
        Ok(install_path) => {
            let mut key_path = PathBuf::new();
            key_path.push(install_path);
            key_path.push("server.key");

            let mut copied_key_path = path.clone();
            let _ = copied_key_path.push("server.key");
            println!("{:?}", copied_key_path);

            match fs::copy(key_path, copied_key_path) {
                Ok(_) => println!("Copied server.key successfully"),
                Err(err) => println!("Failed to copy server.key due to error {:?}", err),
            };
        }
        Err(err) => println!(
            "Failed to copy server.key because fetching registry key failed due to error:\n{:?}",
            err
        ),
    };
}

fn get_server_path(loadout_name: &String) -> PathBuf {
    let mut server_path = get_loadouts_path();
    server_path.push(loadout_name);
    server_path.push("Server");
    server_path
}

fn get_admin_path(loadout_name: &String) -> PathBuf {
    let mut admin_path = get_server_path(&loadout_name);
    admin_path.push("Admin");
    admin_path
}

#[tauri::command]
pub fn get_loadout_names() -> Vec<String> {
    let loadout_path = get_loadouts_path();

    let mut loadout_dirs: Vec<String> = Vec::new();
    match fs::read_dir(&loadout_path) {
        Ok(reader) => {
            reader.for_each(|item| {
                match item {
                    Ok(info) => {
                        if info.path().is_dir() {
                            let temp = info.file_name();
                            let temp_as_str = String::from(temp.to_string_lossy());
                            match has_loadout_json(&info.path()) {
                                true => {}
                                false => {
                                    println!("Trying to make loadoutJSON from txt files");
                                    match make_loadout_json_from_txt_files(&temp_as_str) {
                                        Ok(_) => println!(
                                            "Succesfully made loadout_json for {:?}",
                                            &temp_as_str
                                        ),
                                        Err(err) => println!(
                                            "Failed to make loadout_json for {:?} due to error:\n{:?}",
                                            &temp_as_str, err
                                        ),
                                    }
                                }
                            }
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
            println!(
                "Failed to get loadout names at path {:?} due to reason: \n{:?}",
                &loadout_path, err
            );
        }
    };
    loadout_dirs
}

#[tauri::command]
pub async fn start_loadout(name: String) -> bool {
    let mut args: Vec<&str> = Vec::new();

    args.push("/C");

    let loadout = match get_loadout_json_as_struct(&name) {
        Ok(info) => info,
        Err(err) => {
            println!(
                "Failed to loadoutJSON when starting server due to error: \n{:?}",
                err
            );
            return false;
        }
    };

    let preferences_prematch = get_user_preferences_as_struct();
    let preferences = match preferences_prematch {
        Ok(info) => info,
        Err(_) => return false,
    };

    if &loadout.launch.common.gamepath == &Some(String::from("")) {
        println!("Gamepath arg was empty!");
        if preferences.use_dev_branch {
            if preferences.dev_venice_unleashed_shortcut_location.len() > 1 {
                args.push(&preferences.dev_venice_unleashed_shortcut_location);
                args.push("-updateBranch");
                args.push("dev");
            } else {
                args.push(&preferences.venice_unleashed_shortcut_location);
                args.push("-updateBranch");
                args.push("dev");
            }
        } else {
            args.push(&preferences.venice_unleashed_shortcut_location)
        }
    } else {
        // if there is a gamepath specified, make sure to give a valid vu.exe to pass the gamepath arg to
        args.push(&preferences.venice_unleashed_shortcut_location)
    }

    args.push("-server");
    args.push("-dedicated");

    let mut server = loadout_server_launch_args_to_vec(&loadout.launch.server);
    args.append(&mut server);
    let mut common = loadout_common_launch_args_to_vec(&loadout.launch.common);
    args.append(&mut common);

    let mut console_status = CREATE_NO_WINDOW;

    match loadout.launch.server.headless {
        Some(status) => {
            if status {
                console_status = CREATE_NEW_CONSOLE
            }
        }
        None => {}
    }

    Command::new("cmd")
        .args(args)
        .creation_flags(console_status)
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
            match preferences::save_user_preferences(pref) {
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
    let install_path = match registry::get_install_path_registry() {
        Ok(val) => val,
        Err(err) => err.to_string(),
    };

    let mut loadouts_path = PathBuf::new();
    loadouts_path.push(install_path);
    loadouts_path.push("loadouts");

    if !loadouts_path.exists() {
        fs::create_dir(&loadouts_path);
    }

    return loadouts_path;
}

pub fn get_loadout_admin_path(name: &String) -> PathBuf {
    let mut loadout_path: PathBuf = get_loadouts_path();
    loadout_path.push(&name);

    loadout_path.push("Server");
    loadout_path.push("Admin");
    return loadout_path;
}

pub fn get_loadout_path(loadout_name: &String) -> PathBuf {
    let mut loadout_path: PathBuf = get_loadouts_path();
    loadout_path.push(&loadout_name);
    loadout_path
}
