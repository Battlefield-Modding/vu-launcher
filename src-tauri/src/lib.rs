use std::{
    fs,
    io::{self, Write},
    os::windows::process::CommandExt,
    path::{self, Path, PathBuf},
    process::{Command, Stdio},
};

use tauri_plugin_window_state::StateFlags;

use serde::{Deserialize, Serialize};
use serde_json;

use tauri::{Manager, WindowEvent};
use walkdir::WalkDir;

use tauri_plugin_positioner::{Position, WindowExt};

use dirs_next;

mod reg_functions;
use reg_functions::{
    get_install_path_registry, get_reg_vu_dev_branch_install_location, get_reg_vu_install_location,
    get_settings_json_path_registry, set_settings_json_path_registry,
    set_vu_dev_branch_install_location_registry, set_vu_install_location_registry,
};

mod web;
use web::{download_game, get_vu_info, VeniceEndpointData};

mod servers;
use servers::{
    create_server_loadout, delete_server_loadout, edit_server_loadout, get_loadout_names,
    get_loadouts_path, get_server_loadout, import_loadout_from_path, save_server_guid,
    server_key_exists, server_key_setup, start_server_loadout,
};

mod mods;
use mods::{
    get_mod_names_in_cache, get_mod_names_in_loadout, import_mod_to_cache, open_mod_with_vscode,
    remove_mod_from_cache, remove_mod_from_loadout,
};

mod speed_calc;

mod loadouts;
use loadouts::{
    get_all_loadout_json, get_loadout_json_as_struct, loadout_client_launch_args_to_vec,
    loadout_common_launch_args_to_vec, refresh_loadout,
};

pub const CREATE_NO_WINDOW: u32 = 0x08000000;
pub const CREATE_NEW_CONSOLE: u32 = 0x00000010;

#[derive(Serialize, Deserialize, Debug)]
struct Account {
    username: String,
    password: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct Server {
    nickname: String,
    guid: String,
    password: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct UserPreferences {
    is_sidebar_enabled: bool,
    venice_unleashed_shortcut_location: String,
    dev_venice_unleashed_shortcut_location: String,
    accounts: Vec<Account>,
    servers: Vec<Server>,
    server_guid: String,
    show_multiple_account_join: bool,
    is_onboarded: bool,
}

fn set_default_preferences() -> bool {
    let path_to_vu_client = match get_reg_vu_install_location() {
        Ok(info) => String::from(Path::new(&info).join("vu.exe").to_str().unwrap()),
        Err(_) => String::from(""),
    };

    let path_to_vu_dev_client = match get_reg_vu_dev_branch_install_location() {
        Ok(info) => String::from(Path::new(&info).join("vu.exe").to_str().unwrap()),
        Err(_) => String::from(""),
    };

    let sample_preferences = UserPreferences {
        is_sidebar_enabled: false,
        venice_unleashed_shortcut_location: path_to_vu_client,
        dev_venice_unleashed_shortcut_location: path_to_vu_dev_client,
        accounts: Vec::new(),
        servers: Vec::new(),
        server_guid: String::from(""),
        show_multiple_account_join: false,
        is_onboarded: false,
    };

    match save_user_preferences(sample_preferences) {
        Ok(_) => {
            println!("Successfully saved user preferences!");
            return true;
        }
        Err(err) => {
            println!("Failed to save user preferences due to reason:\n{:?}", err);
            return false;
        }
    };
}

pub fn update_vu_shortcut_preference() -> bool {
    match get_user_preferences_as_struct() {
        Ok(mut preferences) => {
            let path_prematch = get_reg_vu_install_location();
            let path = match path_prematch {
                Ok(info) => info,
                Err(err) => {
                    println!(
                        "Failed to update VU Dev shortcute due to reason:\n{:?}",
                        err
                    );
                    return false;
                }
            };
            let path_to_vu_client = String::from(Path::new(&path).join("vu.exe").to_str().unwrap());
            preferences.venice_unleashed_shortcut_location = path_to_vu_client;

            match save_user_preferences(preferences) {
                Ok(_) => {
                    println!("Successfully saved user preferences!");
                    return true;
                }
                Err(err) => {
                    println!("Failed to save user preferences due to reason:\n{:?}", err);
                    return false;
                }
            };
        }
        Err(err) => {
            println!(
                "Failed to update VU shortcut preference due to error:\n{:?}",
                err
            );
            return false;
        }
    }
}

pub fn update_vu_dev_shortcut_preference() -> bool {
    match get_user_preferences_as_struct() {
        Ok(mut preferences) => {
            let path_prematch = get_reg_vu_dev_branch_install_location();
            let path = match path_prematch {
                Ok(info) => info,
                Err(err) => {
                    println!(
                        "Failed to update VU Dev shortcute due to reason:\n{:?}",
                        err
                    );
                    return false;
                }
            };
            let path_to_vu_client = String::from(Path::new(&path).join("vu.exe").to_str().unwrap());
            preferences.dev_venice_unleashed_shortcut_location = path_to_vu_client;

            match save_user_preferences(preferences) {
                Ok(_) => {
                    println!("Successfully saved user preferences!");
                    return true;
                }
                Err(err) => {
                    println!("Failed to save user preferences due to reason:\n{:?}", err);
                    return false;
                }
            };
        }
        Err(err) => {
            println!(
                "Failed to update VU shortcut preference due to error:\n{:?}",
                err
            );
            return false;
        }
    }
}

fn save_user_preferences(preferences: UserPreferences) -> io::Result<()> {
    let str = serde_json::to_string_pretty(&preferences);

    let path_string = get_settings_json_path_registry()?;
    let new_path = Path::new(&path_string);

    let result = fs::write(new_path, str.unwrap())?;

    Ok(result)
}

fn settings_json_exists() -> bool {
    match get_install_path_registry() {
        Ok(info) => {
            let mut path_to_settings_json = PathBuf::from(info);
            path_to_settings_json.push("settings.json");
            if path_to_settings_json.exists() {
                return true;
            } else {
                return false;
            }
        }
        Err(_) => return false,
    };
}

#[tauri::command]
fn first_time_setup() -> bool {
    match settings_json_exists() {
        true => {
            println!("Settings JSON already exists.");
            return false;
        }
        false => {
            println!("Settings JSON does not exist. Doing first time setup now...");
            if set_settings_json_path_registry() && set_default_preferences() {
                return true;
            } else {
                println!("Failed to complete first time setup.");
                return false;
            }
        }
    }
}

fn get_user_preferences_as_struct() -> io::Result<UserPreferences> {
    let settings_string = get_settings_json_path_registry()?;
    let settings_path = Path::new(&settings_string);

    let info = fs::read_to_string(settings_path)?;
    let info_for_rust = serde_json::from_str(&info);
    match info_for_rust {
        Ok(clean_info) => return Ok(clean_info),
        Err(_) => {
            // nuke the preferences to save user the trouble of going in and deleting it themselves
            println!("Resetting user preferences. Invalid data structure was detected");
            set_default_preferences();
            let info_attempt = fs::read_to_string(settings_path)?;
            let info_for_rust_attempt = serde_json::from_str(&info_attempt)?;

            return Ok(info_for_rust_attempt);
        }
    }
}

fn get_user_preferences_as_string() -> io::Result<String> {
    let settings_string = get_settings_json_path_registry()?;
    let settings_path = Path::new(&settings_string);

    let info = fs::read_to_string(settings_path)?;
    let info_for_rust: Result<UserPreferences, serde_json::Error> = serde_json::from_str(&info);
    match info_for_rust {
        Ok(clean_info) => {
            let final_string = serde_json::to_string(&clean_info)?;
            return Ok(final_string);
        }
        Err(_) => {
            // nuke the preferences to save user the trouble of going in and deleting it themselves
            println!("Resetting user preferences. Invalid data structure was detected");
            set_default_preferences();
            let info_attempt: String = fs::read_to_string(settings_path)?;
            let info_for_rust_attempt: Result<UserPreferences, serde_json::Error> =
                serde_json::from_str(&info_attempt);

            match info_for_rust_attempt {
                Ok(data) => {
                    let final_string = serde_json::to_string(&data)?;
                    return Ok(final_string);
                }
                Err(err) => {
                    println!(
                        "Failed to get user preferences as string due to error:\n{:?}",
                        err
                    );
                }
            }
        }
    }
    Ok(String::from("Failed to get user preferences."))
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
async fn play_vu(account_index: usize, server_index: usize) -> bool {
    let preferences_prematch = get_user_preferences_as_struct();
    let preferences = match preferences_prematch {
        Ok(info) => info,
        Err(_) => return false,
    };

    let mut args: Vec<&str> = Vec::new();
    args.push("/C");
    args.push(&preferences.venice_unleashed_shortcut_location);

    let mut server_join_string = String::from("vu://join/");

    match preferences.servers.len() {
        0 => {
            println!("No server GUID supplied.")
        }
        _ => match server_index {
            9001 => {
                println!("Continuing without an Quick-Join.");
            }
            _ => {
                let server = &preferences.servers[server_index];
                server_join_string.push_str(&server.guid);
                server_join_string.push_str("/");

                match &server.password.len() {
                    0 => {
                        println!("No server password supplied")
                    }
                    _ => {
                        server_join_string.push_str(&server.password);
                    }
                };
            }
        },
    };

    match server_join_string.len() {
        10 => {
            println!("Server join string is empty.")
        }
        _ => {
            args.push(&server_join_string);
        }
    };

    match preferences.accounts.len() {
        0 => {
            println!("No user credentials found.")
        }
        _ => {
            args.push("-username");
            args.push(&preferences.accounts[account_index].username);
            args.push("-password");
            args.push(&preferences.accounts[account_index].password);
        }
    };

    Command::new("cmd")
        .args(args)
        .creation_flags(CREATE_NO_WINDOW)
        .spawn()
        .expect("failed to execute process");

    return true;
}

#[tauri::command]
async fn play_vu_on_local_server(name: String, users: Vec<usize>) -> bool {
    let preferences = match get_user_preferences_as_struct() {
        Ok(info) => info,
        Err(err) => {
            println!(
                "Failed to get user preferences in start_vu_client {:?}",
                err
            );
            return false;
        }
    };

    let loadout = match get_loadout_json_as_struct(&name) {
        Ok(info) => info,
        Err(err) => {
            println!("Failed to get loadoutJSON in start_vu_client {:?}", err);
            return false;
        }
    };

    let mut common = loadout_common_launch_args_to_vec(&loadout.launch.common);
    let mut client = loadout_client_launch_args_to_vec(&loadout.launch.client);

    let mut server_join_string = String::from("vu://join/");

    if &loadout.launch.client.serverSpectateString.clone().unwrap() == "" {
        if &loadout.launch.client.serverJoinString.clone().unwrap() == "" {
            match preferences.server_guid.len() {
                0 => {
                    println!("No server GUID supplied.")
                }
                _ => {
                    server_join_string.push_str(&preferences.server_guid);
                    server_join_string.push_str("/");
                    server_join_string.push_str(&loadout.startup.vars.gamePassword.unwrap());
                    client.push(&server_join_string);
                }
            };
        }
    }

    client.append(&mut common);

    match users.len() {
        0 => {
            match preferences.accounts.len() {
                0 => {
                    println!("No user credentials found.")
                }
                _ => {
                    client.push("-username");
                    client.push(&preferences.accounts[0].username);
                    client.push("-password");
                    client.push(&preferences.accounts[0].password);

                    Command::new(&preferences.venice_unleashed_shortcut_location)
                        .args(client)
                        .creation_flags(CREATE_NO_WINDOW)
                        .spawn()
                        .expect("failed to execute process");
                }
            };
        }
        _ => {
            for index in users {
                let mut copied_args: Vec<&str> = client.clone();

                copied_args.push("-username");
                copied_args.push(&preferences.accounts[index].username);
                copied_args.push("-password");
                copied_args.push(&preferences.accounts[index].password);

                Command::new(&preferences.venice_unleashed_shortcut_location)
                    .args(copied_args)
                    .creation_flags(CREATE_NO_WINDOW)
                    .spawn()
                    .expect("failed to execute process");
            }
        }
    };

    true
}

#[tauri::command]
fn open_explorer_for_loadout(loadout_name: String) {
    let mut path_to_loadout = get_loadouts_path();
    path_to_loadout.push(loadout_name);

    Command::new("explorer")
        .args(&path_to_loadout.to_str())
        .creation_flags(CREATE_NO_WINDOW)
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

#[tauri::command]
fn is_vu_dev_installed() -> bool {
    match get_reg_vu_dev_branch_install_location() {
        Ok(_) => return true,
        Err(_) => return false,
    }
}

#[tauri::command]
async fn activate_bf3_lsx() -> bool {
    let preferences_prematch = get_user_preferences_as_struct();
    let preferences = match preferences_prematch {
        Ok(info) => info,
        Err(_) => return false,
    };

    let mut args: Vec<&str> = Vec::new();
    args.push("/C");
    args.push(&preferences.venice_unleashed_shortcut_location);
    args.push("-activate");
    args.push("-lsx");
    args.push("-wait");

    Command::new("cmd")
        .args(args)
        .creation_flags(CREATE_NEW_CONSOLE)
        .spawn()
        .expect("failed to execute process");

    true
}

#[tauri::command]
async fn activate_bf3_ea_auth_token(token: String) -> bool {
    let preferences_prematch = get_user_preferences_as_struct();
    let preferences = match preferences_prematch {
        Ok(info) => info,
        Err(_) => return false,
    };

    let mut args: Vec<&str> = Vec::new();
    args.push("/C");
    args.push(&preferences.venice_unleashed_shortcut_location);
    args.push("-activate");
    args.push("-ea_token");
    args.push(&token);
    args.push("-wait");

    Command::new("cmd")
        .args(args)
        .creation_flags(CREATE_NEW_CONSOLE)
        .spawn()
        .expect("failed to execute process");

    true
}

#[tauri::command]
async fn copy_vu_prod_to_folder(mut path: String) -> bool {
    path.push_str("\\VeniceUnleashedDev");

    let vu_install_path_result = get_reg_vu_install_location();
    match vu_install_path_result {
        Ok(vu_path) => {
            let vu_pathbuf = PathBuf::from(&vu_path);
            let target_pathbuf = PathBuf::from(&path);

            if !target_pathbuf.exists() {
                match fs::create_dir_all(&target_pathbuf) {
                    Ok(_) => match dircpy::copy_dir(vu_pathbuf, target_pathbuf) {
                        Ok(_) => {
                            println!("Successfully copied over loadout!");
                            match set_vu_dev_branch_install_location_registry(path) {
                                Ok(_) => return true,
                                Err(err) => {
                                    println!(
                                            "Failed to update VU Dev regKey after copying due to error:\n{:?}",
                                            err
                                        );
                                    return false;
                                }
                            }
                        }
                        Err(err) => {
                            println!(
                                "Failed to copy VU PROD -> VU Dev folder due to error:\n{:?}",
                                err
                            );
                            return false;
                        }
                    },
                    Err(err) => {
                        println!(
                            "Failed to create all dirs for VeniceUnleashedDev due to error:\n{:?}",
                            err
                        );
                        return false;
                    }
                }
            }
            return false;
        }
        Err(err) => {
            println!("Failed to find VU install path to error:\n{:?}", err);
            return false;
        }
    }
}

// Ugly HACK! Remove when possible see:
// https://github.com/tauri-apps/tauri/issues/1564
// https://github.com/tauri-apps/tauri/issues/5170
#[tauri::command]
fn show_window(app: tauri::AppHandle) {
    println!("Attempting to show window after dom loaded!");
    app.get_webview_window("main").unwrap().show().unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_state_flags(StateFlags::all() & !StateFlags::VISIBLE)
                .build(),
        )
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
            edit_server_loadout,
            import_loadout_from_path,
            get_mod_names_in_loadout,
            remove_mod_from_loadout,
            open_mod_with_vscode,
            play_vu_on_local_server,
            get_all_loadout_json,
            refresh_loadout,
            activate_bf3_lsx,
            activate_bf3_ea_auth_token,
            show_window,
            is_vu_dev_installed,
            set_vu_dev_branch_install_location_registry,
            copy_vu_prod_to_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
