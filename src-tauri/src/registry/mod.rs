use std::{ffi::OsString, fs::create_dir_all, io, path::PathBuf};

use dirs_next::cache_dir;
use winreg::{enums::HKEY_CURRENT_USER, RegKey};

use crate::preferences::{update_vu_dev_shortcut_preference, update_vu_shortcut_preference};

fn set_launcher_install_path() -> io::Result<String> {
    let hklm = RegKey::predef(HKEY_CURRENT_USER);
    let path = r"SOFTWARE\vu-launcher\vu-launcher";

    let (key, _disp) = hklm.create_subkey(&path)?;

    // should always exist
    let mut appdata_path = cache_dir().unwrap();
    appdata_path.push("vu-launcher");

    let string_form = appdata_path.as_os_str();
    let actual_string = string_form.to_str().unwrap().to_owned();

    key.set_value(String::from(""), &actual_string)?;
    key.get_value(String::from(""))
}

pub fn make_default_install_folder() {
    let mut default_install_folder = cache_dir().unwrap();
    default_install_folder.push("vu-launcher");

    if !default_install_folder.exists() {
        match create_dir_all(default_install_folder) {
            Ok(_) => {
                println!("Successfully created default launcher install folder.");
            }
            Err(err) => {
                println!(
                    "Failed to create default launcher install folder due to error:\n{:?}",
                    err
                );
            }
        }
    }
}

pub fn install_path_folder_exists() -> bool {
    match get_reg_value("") {
        Ok(install_path) => {
            let path = PathBuf::from(&install_path);
            return path.exists();
        }
        Err(_) => return false,
    }
}

pub fn get_install_path_registry() -> io::Result<String> {
    match get_reg_value("") {
        Ok(install_path) => {
            if install_path.is_empty() {
                println!("Install_path was an empty string. Creating manually...");
                make_default_install_folder();
                return set_launcher_install_path();
            }
            if !install_path_folder_exists() {
                make_default_install_folder();
                return set_launcher_install_path();
            }
            return Ok(install_path);
        }
        Err(_) => {
            println!("Error reading install_path. Creating manually...");
            make_default_install_folder();
            return set_launcher_install_path();
        }
    }
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
