use std::fs;

use crate::{
    loadouts::{
        copy_server_key, get_admin_path, get_loadouts_path, get_server_path,
        loadout_structs::LoadoutJson, loadout_txt_handlers::write_to_txt_from_loadout,
        write_loadout_json,
    },
    mods::{install_mods_on_loadout_creation, make_folder_names_same_as_mod_json_names},
};

#[tauri::command]
pub async fn create_loadout(mut loadout: LoadoutJson) -> Result<bool, String> {
    let server_path = get_server_path(&loadout.name);
    let admin_path = get_admin_path(&loadout.name);

    match fs::exists(&admin_path) {
        Ok(boolean) => {
            if !boolean {
                _ = fs::create_dir_all(&admin_path);
            } else {
                println!("Couldn't create loadout: {}", &loadout.name);
                return Err(String::from("Cannot overwrite an existing loadout."));
            }
        }
        Err(err) => {
            println!("Couldn't create loadout: {}", &loadout.name);
            return Err(err.to_string());
        }
    }

    // move the server key over once folders are made
    copy_server_key(&server_path);

    let mut modlist_path = admin_path.clone();
    modlist_path.push("modlist.txt");

    let mut mods_path = admin_path.clone();
    mods_path.push("Mods");

    match fs::create_dir(mods_path) {
        Ok(_) => {}
        Err(err) => {
            println!(
                "Failed to create mods folder for loadout due to error:\n{:?}",
                err
            );
            return Err(err.to_string());
        }
    };
    let mod_list = install_mods_on_loadout_creation(&loadout).await;

    loadout.launch.server.serverInstancePath = Some(String::from(server_path.to_str().unwrap()));

    loadout.modlist = mod_list;
    match write_loadout_json(&loadout) {
        Ok(_) => {}
        Err(err) => {
            println!("Failed to create loadoutJSON due to error:\n{:?}", err);
            return Err(err.to_string());
        }
    }

    match write_to_txt_from_loadout(&loadout.name) {
        Ok(_) => {
            println!("Successfully updated Startup / Modlist / Maplist / Banlist");
        }
        Err(err) => {
            println!(
                "Failed to update Startup / Modlist / Maplist / Banlist due to error:\n{:?}",
                err
            );
            return Err(err.to_string());
        }
    };

    Ok(true)
}

#[tauri::command]
pub async fn import_loadout_from_path(name: String, path: String) -> bool {
    let mut target_path = get_loadouts_path();
    target_path.push(&name);
    target_path.push("Server");

    if !path.ends_with("Server") {
        println!("This isn't server???");
        return false;
    }

    if !target_path.exists() {
        match fs::create_dir_all(&target_path) {
            Ok(_) => match dircpy::copy_dir(path, target_path) {
                Ok(_) => {
                    println!("Successfully copied over loadout!");
                    match make_folder_names_same_as_mod_json_names(&name) {
                        Ok(_) => {
                            println!("Successfully renamed folders based on modjson, upon loadout import.");
                        }
                        Err(err) => {
                            println!("{:?}", err);
                        }
                    }
                    return true;
                }
                Err(err) => {
                    println!("{:?}", err);
                    return false;
                }
            },
            Err(err) => {
                println!("{:?}", err);
                return false;
            }
        }
    }
    return false;
}

#[tauri::command]
pub async fn edit_loadout(loadout: LoadoutJson) -> Result<bool, String> {
    match write_loadout_json(&loadout) {
        Ok(_) => {}
        Err(err) => {
            println!("Failed to update loadoutJSON due to error:\n{:?}", err);
            return Err(err.to_string());
        }
    }

    match write_to_txt_from_loadout(&loadout.name) {
        Ok(_) => {
            println!("Successfully updated Startup / Modlist / Maplist / Banlist");
        }
        Err(err) => {
            println!(
                "Failed to update Startup / Modlist / Maplist / Banlist due to error:\n{:?}",
                err
            );
            return Err(err.to_string());
        }
    };

    Ok(true)
}

#[tauri::command]
pub async fn delete_loadout(name: String) -> bool {
    let mut loadout_path = get_loadouts_path();
    loadout_path.push(&name);

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
