use std::{
    fs, io,
    path::{Path, PathBuf},
};
pub mod preference_structs;

use crate::{
    get_settings_json_path,
    preferences::preference_structs::{OptionalUserPreferences, UserPreferences},
    registry::{
        get_install_path_registry, get_reg_vu_dev_branch_install_location,
        get_reg_vu_install_location,
    },
};

pub fn set_default_preferences() -> bool {
    let path_to_vu_client = match get_reg_vu_install_location() {
        Ok(info) => String::from(Path::new(&info).join("vu.exe").to_str().unwrap()),
        Err(_) => String::from(""),
    };

    let path_to_vu_dev_client = match get_reg_vu_dev_branch_install_location() {
        Ok(info) => String::from(Path::new(&info).join("vu.exe").to_str().unwrap()),
        Err(_) => String::from(""),
    };
    match get_user_preferences_as_struct() {
        Ok(mut prefs) => {
            prefs.venice_unleashed_shortcut_location = path_to_vu_client;
            prefs.dev_venice_unleashed_shortcut_location = path_to_vu_dev_client;

            match save_user_preferences(prefs) {
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
        Err(_) => {
            println!("Preferences do not exist, setting defaults");
            let mut sample_preferences = UserPreferences::default();
            sample_preferences.venice_unleashed_shortcut_location = path_to_vu_client;
            sample_preferences.dev_venice_unleashed_shortcut_location = path_to_vu_dev_client;

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
    }
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

pub fn save_user_preferences(preferences: UserPreferences) -> io::Result<bool> {
    let str = serde_json::to_string_pretty(&preferences);
    let settings_json_path = get_settings_json_path()?;

    fs::write(settings_json_path, str.unwrap())?;
    Ok(true)
}

pub fn get_user_preferences_as_struct() -> io::Result<UserPreferences> {
    let settings_path = get_settings_json_path()?;

    let info = fs::read_to_string(&settings_path)?;
    let info_for_rust = serde_json::from_str(&info);

    match info_for_rust {
        Ok(clean_info) => return Ok(clean_info),
        Err(_) => {
            match serde_json::from_str(&info) {
                Ok(old_preferences) => {
                    let new_preferences = upgrade_preferences_object(old_preferences);
                    save_user_preferences(new_preferences)?;

                    let info_attempt = fs::read_to_string(&settings_path)?;
                    let info_for_rust_attempt = serde_json::from_str(&info_attempt)?;

                    return Ok(info_for_rust_attempt);
                }
                Err(err) => {
                    println!("Failed to upgrade {:?}", err);
                    set_default_preferences();

                    let info_attempt = fs::read_to_string(&settings_path)?;
                    let info_for_rust_attempt = serde_json::from_str(&info_attempt)?;

                    return Ok(info_for_rust_attempt);
                }
            };
        }
    }
}

pub fn upgrade_preferences_object(old_preferences: OptionalUserPreferences) -> UserPreferences {
    let mut new_preferences = UserPreferences::default();
    match old_preferences.dev_venice_unleashed_shortcut_location {
        Some(info) => {
            new_preferences.dev_venice_unleashed_shortcut_location = info;
        }
        None => {}
    }
    match old_preferences.last_visted_route {
        Some(info) => {
            new_preferences.last_visted_route = info;
        }
        None => {}
    }
    match old_preferences.server_guid {
        Some(info) => {
            new_preferences.server_guid = info;
        }
        None => {}
    }
    match old_preferences.venice_unleashed_shortcut_location {
        Some(info) => {
            new_preferences.venice_unleashed_shortcut_location = info;
        }
        None => {}
    }
    match old_preferences.is_onboarded {
        Some(info) => {
            new_preferences.is_onboarded = info;
        }
        None => {}
    }
    match old_preferences.is_sidebar_enabled {
        Some(info) => {
            new_preferences.is_sidebar_enabled = info;
        }
        None => {}
    }
    match old_preferences.preferred_player_index {
        Some(info) => {
            new_preferences.preferred_player_index = info;
        }
        None => {}
    }
    match old_preferences.preferred_server_index {
        Some(info) => {
            new_preferences.preferred_server_index = info;
        }
        None => {}
    }
    match old_preferences.servers {
        Some(info) => {
            new_preferences.servers = info;
        }
        None => {}
    }
    match old_preferences.show_multiple_account_join {
        Some(info) => {
            new_preferences.show_multiple_account_join = info;
        }
        None => {}
    }
    match old_preferences.use_dev_branch {
        Some(info) => {
            new_preferences.use_dev_branch = info;
        }
        None => {}
    }
    match old_preferences.usernames {
        Some(info) => {
            new_preferences.usernames = info;
        }
        None => {}
    }
    match old_preferences.automatically_check_for_updates {
        Some(info) => {
            new_preferences.automatically_check_for_updates = info;
        }
        None => {}
    }
    match old_preferences.automatically_install_update_if_found {
        Some(info) => {
            new_preferences.automatically_install_update_if_found = info;
        }
        None => {}
    }
    match old_preferences.ignore_update_version {
        Some(info) => {
            new_preferences.ignore_update_version = info;
        }
        None => {}
    }

    new_preferences
}

pub fn get_user_preferences_as_string() -> io::Result<String> {
    let settings_path = get_settings_json_path()?;

    let info = fs::read_to_string(&settings_path)?;
    let info_for_rust: Result<UserPreferences, serde_json::Error> = serde_json::from_str(&info);
    match info_for_rust {
        Ok(clean_info) => {
            let final_string = serde_json::to_string(&clean_info)?;
            return Ok(final_string);
        }
        Err(_) => {
            match serde_json::from_str(&info) {
                Ok(old_preferences) => {
                    let new_preferences: UserPreferences =
                        upgrade_preferences_object(old_preferences);
                    save_user_preferences(new_preferences)?;

                    let info_attempt = fs::read_to_string(&settings_path)?;

                    return Ok(info_attempt);
                }
                Err(err) => {
                    println!("Failed to upgrade {:?}", err);
                    set_default_preferences();

                    let info_attempt = fs::read_to_string(&settings_path)?;

                    return Ok(info_attempt);
                }
            };
        }
    }
}

#[tauri::command]
pub fn get_user_preferences() -> String {
    let preferences = get_user_preferences_as_string();
    match preferences {
        Ok(info) => return info,
        Err(err) => return err.to_string(),
    }
}

#[tauri::command]
pub fn set_launcher_directory(dir: String) -> bool {
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

pub fn settings_json_exists() -> bool {
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
pub fn set_user_preferences(new_preferences: UserPreferences) -> bool {
    let status = save_user_preferences(new_preferences);
    match status {
        Ok(_) => {
            return true;
        }
        Err(_) => {
            return false;
        }
    }
}
