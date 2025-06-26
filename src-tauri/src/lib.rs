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

pub mod preferences;
use preferences::{get_user_preferences, set_launcher_directory, set_user_preferences};

pub mod registry;
use registry::{
    get_install_path_registry, get_reg_vu_dev_branch_install_location, get_reg_vu_install_location,
    set_vu_dev_branch_install_location_registry, set_vu_install_location_registry,
};

mod web;
use web::{download_game, get_vu_info, VeniceEndpointData};

mod mods;
use mods::{
    get_mod_names_in_cache, get_mod_names_in_loadout, import_mod_folder_to_cache,
    import_mod_folder_to_loadout, import_zipped_mod_to_cache, import_zipped_mod_to_loadout,
    install_mod_to_loadout_from_cache, make_cache_folder_names_same_as_mod_json_names,
    open_mod_with_vscode, remove_mod_from_cache, remove_mod_from_loadout,
};

mod speed_calc;

mod loadouts;
use loadouts::{
    get_all_loadout_json, get_all_loadout_names, get_loadout_json, get_loadout_json_as_struct,
    get_loadout_names, get_loadouts_path,
    launch_arg_selector::{loadout_client_launch_args_to_vec, loadout_common_launch_args_to_vec},
    loadout_modification::{
        create_loadout, delete_loadout, edit_loadout, import_loadout_from_path,
    },
    refresh_loadout, save_server_guid, server_key_exists, server_key_setup, start_loadout,
};

use keyring::Entry;
use std::error::Error;

use crate::preferences::{
    get_user_preferences_as_struct, set_default_preferences, settings_json_exists,
};

pub const CREATE_NO_WINDOW: u32 = 0x08000000;
pub const CREATE_NEW_CONSOLE: u32 = 0x00000010;

#[tauri::command]
fn first_time_setup() -> bool {
    match settings_json_exists() {
        true => {
            println!("Settings JSON already exists.");
            return false;
        }
        false => {
            println!("Settings JSON does not exist. Doing first time setup now...");
            if set_default_preferences() {
                return true;
            } else {
                println!("Failed to complete first time setup.");
                return false;
            }
        }
    }
}

fn get_settings_json_path() -> io::Result<PathBuf> {
    let install_path = get_install_path_registry()?;
    let mut path_to_settings_json = PathBuf::from(&install_path);
    path_to_settings_json.push("settings.json");
    return Ok(path_to_settings_json);
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
async fn play_vu(account_index: usize, use_dev_branch: bool) -> bool {
    let preferences_prematch = get_user_preferences_as_struct();
    let preferences = match preferences_prematch {
        Ok(info) => info,
        Err(_) => return false,
    };

    let mut args: Vec<&str> = Vec::new();

    args.push("/C");

    if use_dev_branch {
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
        args.push(&preferences.venice_unleashed_shortcut_location);
        args.push("-updateBranch");
        args.push("prod");
    }

    let mut server_join_string = String::from("vu://join/");

    match preferences.servers.len() {
        0 => {
            println!("No server GUID supplied.")
        }
        _ => match preferences.preferred_server_index {
            9001 => {
                println!("Continuing without an Quick-Join.");
            }
            _ => {
                let mut index = 0;
                for server in preferences.servers {
                    if index == preferences.preferred_server_index {
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
                    index += 1;
                }
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

    let mut password = String::from("");
    match preferences.usernames.len() {
        0 => {
            println!("No user credentials found.")
        }
        _ => {
            args.push("-username");
            args.push(&preferences.usernames[account_index]);

            let username = String::from(&preferences.usernames[account_index]);

            match get_vu_account_password(username) {
                Ok(pw) => {
                    password = pw.clone();
                    args.push("-password");
                    args.push(&password);
                }
                Err(err) => {
                    println!("Failed to fetch user password due to error:\n{:?}", err);
                    return false;
                }
            }
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

    let mut args = Vec::new();
    args.push("/C");

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

    let should_spawn_console = &loadout.launch.common.console.unwrap();

    let creation_flag = match should_spawn_console {
        true => CREATE_NEW_CONSOLE,
        false => CREATE_NO_WINDOW,
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
    args.append(&mut client);

    let mut password = String::from("");
    match users.len() {
        0 => {
            match preferences.usernames.len() {
                0 => {
                    println!("No user credentials found.")
                }
                _ => {
                    args.push("-username");
                    args.push(&preferences.usernames[0]);

                    let username = String::from(&preferences.usernames[0]);

                    match get_vu_account_password(username) {
                        Ok(pw) => {
                            password = pw.clone();
                            args.push("-password");
                            args.push(&password);
                        }
                        Err(err) => {
                            println!("Failed to fetch user password due to error:\n{:?}", err);
                            return false;
                        }
                    }

                    Command::new("cmd")
                        .args(args)
                        .creation_flags(creation_flag)
                        .spawn()
                        .expect("failed to execute process");
                }
            };
        }
        _ => {
            for index in users {
                let mut copied_args: Vec<&str> = args.clone();

                copied_args.push("-username");
                copied_args.push(&preferences.usernames[index]);

                let username = String::from(preferences.usernames[index].clone());

                match get_vu_account_password(username) {
                    Ok(pw) => {
                        password = pw.clone();
                        copied_args.push("-password");
                        copied_args.push(&password);
                    }
                    Err(err) => {
                        println!("Failed to fetch user password due to error:\n{:?}", err);
                        return false;
                    }
                }

                Command::new("cmd")
                    .args(copied_args)
                    .creation_flags(creation_flag)
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

fn store_vu_account_password(username: String, password: String) -> Result<(), Box<dyn Error>> {
    let service_name = "venice_unleashed_launcher";

    let keyring_entry = Entry::new(service_name, &username)?;

    keyring_entry.set_password(&password)?;

    let retrieved_password = keyring_entry.get_password()?;
    println!("Retrieved password: {}", retrieved_password);

    Ok(())
}

fn remove_vu_account_password(username: String) -> Result<(), Box<dyn Error>> {
    let service_name = "venice_unleashed_launcher";

    let keyring_entry = Entry::new(service_name, &username)?;

    keyring_entry.delete_credential()?;

    println!("Deleted Credentials for: {}", &username);

    Ok(())
}

fn get_vu_account_password(username: String) -> Result<String, Box<dyn Error>> {
    let service_name = "venice_unleashed_launcher";

    let keyring_entry = Entry::new(service_name, &username)?;

    let password = keyring_entry.get_password()?;

    Ok(password)
}

#[tauri::command]
async fn add_vu_credentials(username: String, password: String) -> bool {
    match store_vu_account_password(username, password) {
        Ok(_) => return true,
        Err(err) => {
            println!("Failed to add VU credentials due to reason:\n{:?}", err);
            return false;
        }
    }
}

#[tauri::command]
async fn remove_vu_credentials(username: String) -> bool {
    match remove_vu_account_password(username) {
        Ok(_) => return true,
        Err(err) => {
            println!("Failed to delete VU credentials due to reason:\n{:?}", err);
            return false;
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
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
            create_loadout,
            get_loadout_names,
            delete_loadout,
            server_key_exists,
            server_key_setup,
            start_loadout,
            save_server_guid,
            set_vu_install_location_registry,
            open_explorer_for_loadout,
            get_mod_names_in_cache,
            import_zipped_mod_to_cache,
            import_mod_folder_to_cache,
            import_zipped_mod_to_loadout,
            import_mod_folder_to_loadout,
            remove_mod_from_cache,
            edit_loadout,
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
            copy_vu_prod_to_folder,
            add_vu_credentials,
            remove_vu_credentials,
            install_mod_to_loadout_from_cache,
            get_all_loadout_names,
            get_loadout_json,
            make_cache_folder_names_same_as_mod_json_names
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
