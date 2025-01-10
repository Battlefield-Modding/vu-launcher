use std::{
    fs, io,
    path::{self, Path, PathBuf},
    process::Command,
};

use serde::{Deserialize, Serialize};
use serde_json;

use tauri::{Manager, WindowEvent};
use walkdir::WalkDir;

use tauri_plugin_positioner::{Position, WindowExt};

use dirs_next;

mod reg_functions;
use reg_functions::{
    get_install_path_registry, get_reg_vu_install_location, get_settings_json_path_registry,
    set_install_path_registry, set_settings_json_path_registry, set_vu_install_location_registry,
};

mod web;
use web::{download_game, get_vu_info, VeniceEndpointData};

mod servers;
use servers::{
    create_server_loadout, delete_server_loadout, get_loadout_names, get_loadouts_path,
    get_server_loadout, save_server_guid, server_key_exists, server_key_setup,
    start_server_loadout,
};

mod mods;
use mods::{get_mod_names_in_cache, import_mod_to_cache, remove_mod_from_cache};

mod speed_calc;

#[derive(Serialize, Deserialize, Debug)]
struct Account {
    username: String,
    password: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct UserPreferences {
    is_sidebar_enabled: bool,
    venice_unleashed_shortcut_location: String,
    accounts: Vec<Account>,
    server_guid: String,
}

fn config_folder_exists() -> bool {
    let doc_dir = dirs_next::document_dir();
    let mut path_to_documents = match doc_dir {
        Some(info) => info,
        None => return false,
    };

    path_to_documents.push("venice_unleashed_launcher");
    if path_to_documents.exists() {
        return true;
    } else {
        return false;
    }
}

fn set_default_preferences() {
    let path_prematch = get_reg_vu_install_location();
    let path = match path_prematch {
        Ok(info) => info,
        Err(_) => {
            println!("Could not VU install location. Aborting creation of Preferences File.");
            return;
        }
    };
    let path_to_vu_client = String::from(Path::new(&path).join("vu.exe").to_str().unwrap());

    let sample_preferences = UserPreferences {
        is_sidebar_enabled: false,
        venice_unleashed_shortcut_location: path_to_vu_client,
        accounts: Vec::new(),
        server_guid: String::from(""),
    };
    save_user_preferences(sample_preferences);
}

fn save_user_preferences(preferences: UserPreferences) -> io::Result<bool> {
    let str = serde_json::to_string(&preferences);

    let path_string = get_settings_json_path_registry()?;
    let new_path = Path::new(&path_string);

    let result = fs::write(new_path, str.unwrap());

    match result {
        Ok(_) => return Ok(true),
        Err(error) => return Err(error),
    }
}

fn make_config_folder() {
    let doc_dir = dirs_next::document_dir();
    let mut path_to_documents = match doc_dir {
        Some(info) => info,
        None => return,
    };

    path_to_documents.push("venice_unleashed_launcher");
    let new_path = fs::create_dir(path_to_documents);
    match new_path {
        Ok(_) => println!("Successfully made the new directory"),
        Err(error) => println!("{:?}", error),
    }
}

#[tauri::command]
fn first_time_setup() {
    if !config_folder_exists() {
        make_config_folder();
        set_install_path_registry();
        set_settings_json_path_registry();
        set_default_preferences()
    }
}

fn get_user_preferences_as_struct() -> io::Result<UserPreferences> {
    let settings_string = get_settings_json_path_registry()?;
    let settings_path = Path::new(&settings_string);

    let info = fs::read_to_string(settings_path)?;
    let info_for_rust = serde_json::from_str(&info)?;
    Ok(info_for_rust)
}

fn get_user_preferences_as_string() -> io::Result<String> {
    let settings_string = get_settings_json_path_registry()?;
    let settings_path = Path::new(&settings_string);

    let info = fs::read_to_string(settings_path)?;
    Ok(info)
}

#[tauri::command]
fn get_user_preferences() -> String {
    let preferences = get_user_preferences_as_string();
    match preferences {
        Ok(info) => return info,
        Err(err) => return err.to_string(),
    }
}

#[tauri::command]
fn set_launcher_directory(dir: String) -> bool {
    println!("{:?}", dir);

    let preferences = get_user_preferences_as_struct();
    let mut preferences_object = match preferences {
        Ok(info) => info,
        Err(_) => return false,
    };

    preferences_object.venice_unleashed_shortcut_location = dir;
    let status = save_user_preferences(preferences_object);
    match status {
        Ok(_) => return true,
        Err(_) => return false,
    }
}

// fn set_sidebar_status(status: bool) -> bool {
//     let preferences = get_user_preferences_as_struct();
//     let mut preferences_object = match preferences {
//         Ok(info) => info,
//         Err(_) => return false,
//     };

//     preferences_object.is_sidebar_enabled = status;
//     let status = save_user_preferences(preferences_object);
//     match status {
//         Ok(_) => return true,
//         Err(_) => return false,
//     }
// }

#[tauri::command]
fn set_user_preferences(new_preferences: UserPreferences) -> bool {
    let status = save_user_preferences(new_preferences);
    match status {
        Ok(_) => return true,
        Err(_) => return false,
    }
}

#[tauri::command]
fn get_random_number() -> i32 {
    set_default_preferences();
    let num = rand::random();
    return num;
}

#[tauri::command]
async fn get_vu_data() -> String {
    let info = get_vu_info().await;
    let proper = match info {
        Ok(data) => data,
        Err(_) => VeniceEndpointData {
            buildnum: -1,
            installer_size: -1,
            zip_size: -1,
            installer_url: String::from("-1"),
            zip_url: String::from("-1"),
        },
    };
    serde_json::to_string(&proper).unwrap()
}

#[tauri::command]
async fn play_vu(server_password: String, users: Vec<usize>) -> bool {
    let preferences_prematch = get_user_preferences_as_struct();
    let preferences = match preferences_prematch {
        Ok(info) => info,
        Err(_) => return false,
    };

    let mut args: Vec<&str> = Vec::new();
    args.push("/C");
    args.push(&preferences.venice_unleashed_shortcut_location);

    let mut server_join_string = String::from("vu://join/");

    match preferences.server_guid.len() {
        0 => {
            println!("No server GUID supplied.")
        }
        _ => {
            server_join_string.push_str(&preferences.server_guid);
            server_join_string.push_str("/");

            match server_password.len() {
                0 => {
                    println!("No server password supplied")
                }
                _ => {
                    server_join_string.push_str(&server_password);
                }
            };
        }
    };

    match server_join_string.len() {
        10 => {
            println!("Server join string is empty.")
        }
        _ => {
            args.push(&server_join_string);
        }
    };

    match users.len() {
        0 => {
            match preferences.accounts.len() {
                0 => {
                    println!("No user credentials found.")
                }
                _ => {
                    args.push("-username");
                    args.push(&preferences.accounts[0].username);
                    args.push("-password");
                    args.push(&preferences.accounts[0].password);

                    Command::new("cmd")
                        .args(args)
                        .spawn()
                        .expect("failed to execute process");
                }
            };
        }
        _ => {
            for index in users {
                let mut copied_args: Vec<&str> = args.clone();

                copied_args.push("-username");
                copied_args.push(&preferences.accounts[index].username);
                copied_args.push("-password");
                copied_args.push(&preferences.accounts[index].password);

                Command::new("cmd")
                    .args(copied_args)
                    .spawn()
                    .expect("failed to execute process");
            }
        }
    };

    return true;
}

#[tauri::command]
fn open_explorer_for_loadout(loadout_name: String) {
    let mut path_to_loadout = get_loadouts_path();
    path_to_loadout.push(loadout_name);
    path_to_loadout.push("Server");
    path_to_loadout.push("Admin");

    Command::new("explorer")
        .args(&path_to_loadout.to_str())
        .spawn()
        .expect("failed to execute process");
}

#[tauri::command]
fn is_vu_installed() -> bool {
    match get_reg_vu_install_location() {
        Ok(_) => return true,
        Err(_) => return false,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_random_number,
            set_launcher_directory,
            first_time_setup,
            get_user_preferences,
            set_user_preferences,
            play_vu,
            is_vu_installed,
            get_vu_data,
            download_game,
            create_server_loadout,
            get_loadout_names,
            delete_server_loadout,
            server_key_exists,
            server_key_setup,
            start_server_loadout,
            save_server_guid,
            get_server_loadout,
            set_vu_install_location_registry,
            open_explorer_for_loadout,
            get_mod_names_in_cache,
            import_mod_to_cache,
            remove_mod_from_cache,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
