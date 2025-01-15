use std::{ffi::OsString, io};

use winreg::{enums::HKEY_CURRENT_USER, RegKey};

pub fn get_settings_json_path_registry() -> io::Result<String> {
    let install_path = get_reg_value("SettingsJson");
    install_path
}

pub fn set_settings_json_path_registry() {
    let path_to_folder = get_install_path_registry();
    let mut path_to_settings_json = match path_to_folder {
        Ok(path) => path,
        Err(_) => return,
    };
    path_to_settings_json.push_str("\\settings.json");

    set_reg_value("SettingsJson", &OsString::from(path_to_settings_json));
}

pub fn get_install_path_registry() -> io::Result<String> {
    let install_path = get_reg_value("InstallDir");
    install_path
}

fn get_reg_value(keyname: &str) -> io::Result<String> {
    let hklm = RegKey::predef(HKEY_CURRENT_USER);
    let path = r"SOFTWARE\vu-launcher";

    let key = hklm.open_subkey(path)?;
    let reg_value = key.get_value(keyname)?;
    Ok(reg_value)
}

fn set_reg_value(keyname: &str, keyvalue: &OsString) -> io::Result<bool> {
    let hklm = RegKey::predef(HKEY_CURRENT_USER);
    let path = r"SOFTWARE\vu-launcher";

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
            return Ok(true);
        }
        Err(err) => {
            println!("{:?}", err);
            return Err(err.to_string());
        }
    }
}
