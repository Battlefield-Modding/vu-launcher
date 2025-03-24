use std::{ffi::OsString, io};

use winreg::{enums::HKEY_CURRENT_USER, RegKey};

use crate::{
    get_user_preferences_as_struct, update_vu_dev_shortcut_preference,
    update_vu_shortcut_preference,
};

pub fn get_settings_json_path_registry() -> io::Result<String> {
    let install_path = get_reg_value("SettingsJson");
    install_path
}

pub fn set_settings_json_path_registry() -> bool {
    let path_to_folder = get_install_path_registry();
    let mut path_to_settings_json = match path_to_folder {
        Ok(path) => path,
        Err(_) => return false,
    };
    path_to_settings_json.push_str("\\settings.json");

    match set_reg_value("SettingsJson", &OsString::from(path_to_settings_json)) {
        Ok(_) => return true,
        Err(err) => {
            println!(
                "Failed to set SettingsJSON reg value due to error:\n{:?}",
                err
            );
            return false;
        }
    }
}

pub fn get_install_path_registry() -> io::Result<String> {
    // TODO: make the .exe installer make installDir/installPath regkey
    let install_path = get_reg_value("");
    install_path
}

fn get_reg_value(keyname: &str) -> io::Result<String> {
    let hklm = RegKey::predef(HKEY_CURRENT_USER);
    let path = r"SOFTWARE\vu-launcher\vu-launcher";

    let key = hklm.open_subkey(path)?;
    let reg_value = key.get_value(keyname)?;
    Ok(reg_value)
}

fn set_reg_value(keyname: &str, keyvalue: &OsString) -> io::Result<bool> {
    let hklm = RegKey::predef(HKEY_CURRENT_USER);
    let path = r"SOFTWARE\vu-launcher\vu-launcher";

    let (key, _disp) = hklm.create_subkey(&path)?;

    let key_result = key.set_value(keyname, keyvalue);
    match key_result {
        Ok(_) => Ok(true),
        Err(err) => Err(err),
    }
}

pub fn get_reg_vu_install_location() -> io::Result<String> {
    let hklm = RegKey::predef(HKEY_CURRENT_USER);
    let path = r"SOFTWARE\Venice Unleashed";

    let key = hklm.open_subkey(path)?;
    let reg_value = key.get_value("InstallPath")?;

    Ok(reg_value)
}

pub fn get_reg_vu_dev_branch_install_location() -> io::Result<String> {
    let hklm = RegKey::predef(HKEY_CURRENT_USER);
    let path = r"SOFTWARE\Venice Unleashed";

    let key = hklm.open_subkey(path)?;
    let reg_value = key.get_value("InstallPathDev")?;

    Ok(reg_value)
}

#[tauri::command]
pub fn set_vu_install_location_registry(installdir: String) -> Result<bool, String> {
    let hklm = RegKey::predef(HKEY_CURRENT_USER);
    let path = r"SOFTWARE\Venice Unleashed";

    // incase this path does not exist
    let create_key_result = hklm.create_subkey(path);
    let (key, _disp) = match create_key_result {
        Ok(info) => info,
        Err(err) => return Err(err.to_string()),
    };
    println!("Fetched Venice Unleashed Key.");

    let set_key_result = key.set_value("InstallPath", &installdir);
    match set_key_result {
        Ok(_) => {
            println!("Set VU Key");
            match update_vu_shortcut_preference() {
                true => {
                    return Ok(true);
                }
                false => {
                    println!("Failed to update VU shortcut preference");
                    return Err(String::from("Failed to update VU shortcut preference"));
                }
            }
        }
        Err(err) => {
            println!("{:?}", err);
            return Err(err.to_string());
        }
    }
}

#[tauri::command]
pub fn set_vu_dev_branch_install_location_registry(installdir: String) -> Result<bool, String> {
    let hklm = RegKey::predef(HKEY_CURRENT_USER);
    let path = r"SOFTWARE\Venice Unleashed";

    // incase this path does not exist
    let create_key_result = hklm.create_subkey(path);
    let (key, _disp) = match create_key_result {
        Ok(info) => info,
        Err(err) => return Err(err.to_string()),
    };
    println!("Fetched Venice Unleashed Key.");

    let set_key_result = key.set_value("InstallPathDev", &installdir);
    match set_key_result {
        Ok(_) => {
            println!("Set VU Key");
            match update_vu_dev_shortcut_preference() {
                true => {
                    return Ok(true);
                }
                false => {
                    println!("Failed to update VU Dev shortcut preference");
                    return Err(String::from("Failed to update VU Dev shortcut preference"));
                }
            }
        }
        Err(err) => {
            println!("{:?}", err);
            return Err(err.to_string());
        }
    }
}
