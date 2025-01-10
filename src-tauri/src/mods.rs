use std::{
    env, fs,
    io::{self},
    path::{self, Path, PathBuf},
};

use serde::{Deserialize, Serialize};
use serde_json::Error;

use crate::{
    reg_functions,
    servers::{get_loadouts_path, ServerLoadout},
};

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct ModJson {
    pub Name: String,
    pub Authors: Vec<String>,
    pub Description: String,
    pub URL: String,
    pub Version: String,
    pub HasWebUI: bool,
    pub HasVeniceEXT: bool,
}

#[derive(Debug)]
pub struct ModFolderInfo {
    original_mod_name: String,
    mod_json: ModJson,
}

pub fn get_mod_cache_path() -> PathBuf {
    let install_path = match reg_functions::get_install_path_registry() {
        Ok(val) => val,
        Err(err) => err.to_string(),
    };

    let mut loadout_path = PathBuf::new();
    loadout_path.push(install_path);
    loadout_path.push("mod-cache");

    if !&loadout_path.exists() {
        fs::create_dir(&loadout_path);
    }
    return loadout_path;
}

// fn overwrite_extracted_folder_name_with_mod_json_name(
//     loadout_name: String,
//     extracted_folder_name: String,
// ) {
//     let info = get_mod_json_data(loadout_name, mod_folder_name);
//     println!("{:?}", info);
// }

fn make_folder_names_same_as_mod_json_names(loadout_name: &String) -> Vec<String> {
    let mods_path = get_mod_path_for_loadout(&loadout_name);
    let dir_reader = fs::read_dir(&mods_path);
    let mut mod_list: Vec<String> = Vec::new();
    match dir_reader {
        Ok(reader) => {
            reader.for_each(|item| {
                match item {
                    Ok(info) => {
                        // fs::rename(info.file_name(), info.file_name());
                        let mut inner_mod_json_path = info.path();
                        let original_mod_path = inner_mod_json_path.clone();
                        let original_mod_name =
                            match inner_mod_json_path.clone().file_name().unwrap().to_str() {
                                Some(name) => name.to_owned(),
                                None => {
                                    println!("Could not find folder name. Aborting renaming");
                                    return;
                                }
                            };

                        inner_mod_json_path.push("mod.json");
                        println!("{:?}", inner_mod_json_path);

                        if inner_mod_json_path.exists() {
                            let info = fs::read_to_string(inner_mod_json_path).unwrap();
                            let info_for_rust: Result<ModJson, Error> = serde_json::from_str(&info);
                            match info_for_rust {
                                Ok(matched_mod_json_info) => {
                                    if original_mod_name.eq(&matched_mod_json_info.Name) {
                                        println!("Folder name and ModJson [Name] match!")
                                    } else {
                                        let mut new_mod_path = mods_path.clone();
                                        new_mod_path.push(&matched_mod_json_info.Name);

                                        match fs::rename(&original_mod_path, new_mod_path) {
                                            Ok(_) => {
                                                mod_list.push(String::from(
                                                    &matched_mod_json_info.Name,
                                                ));
                                                println!(
                                                    "Successfully renamed mod folder for: {}",
                                                    &matched_mod_json_info.Name
                                                );
                                            }
                                            Err(err) => {
                                                println!(
                                                    "Failed to rename this mod."
                                                );
                                                println!("{:?}", err);

                                                match fs::remove_dir_all(&original_mod_path){
                                                    Ok(_) => {
                                                        println!("Successfully deleted unrenamable folder")
                                                    },
                                                    Err(inner_err) => {
                                                        println!("{:?}", inner_err)
                                                    }
                                                };

                                            }
                                        };
                                    }
                                }
                                Err(err) => {
                                    println!("{:?}", err);
                                }
                            }
                        } else {
                            println!("Mod JSON does not exist for {:?}", inner_mod_json_path);
                        }
                    }
                    Err(_) => {
                        println!("Error when reading mod JSONs")
                    }
                };
            });
        }
        Err(err) => {
            println!("{:?}", err);
        }
    };
    mod_list
}

fn update_modlist(loadout_name: &String, mod_list: Vec<String>) {
    let mut modlist_path = get_admin_path_for_loadout(loadout_name);
    modlist_path.push("modlist.txt");

    let string_to_write = mod_list.join("\n");
    match fs::write(modlist_path, string_to_write) {
        Ok(_) => {
            println!("Successfully update Modlist.txt")
        }
        Err(err) => {
            println!("{:?}", err);
        }
    }
}

// fn get_mod_json_data(loadout_name: String, mod_folder_name: String) -> ModJson {
//     let mut mods_path = get_mod_path_for_loadout(&loadout_name);
//     mods_path.push(&mod_folder_name);
//     mods_path.push("mod.json");

//     let info = fs::read_to_string(mods_path)?;
//     let info_for_rust = serde_json::from_str(&info)?;
//     info_for_rust
// }

fn get_admin_path_for_loadout(name: &String) -> PathBuf {
    let mut admin_path = get_loadouts_path();
    admin_path.push(&name);
    admin_path.push("Server");
    admin_path.push("Admin");
    admin_path
}

fn get_mod_path_for_loadout(name: &String) -> PathBuf {
    let mut loadout_path = get_loadouts_path();
    loadout_path.push(&name);
    loadout_path.push("Server");
    loadout_path.push("Admin");
    loadout_path.push("Mods");
    loadout_path
}

#[tauri::command]
pub fn get_mod_names_in_cache() -> Vec<String> {
    // this function will return content from all server loadouts
    let mod_cache_path = get_mod_cache_path();
    let dir_reader = fs::read_dir(&mod_cache_path);
    let mut mod_names: Vec<String> = Vec::new();
    match dir_reader {
        Ok(reader) => {
            reader.for_each(|item| {
                match item {
                    Ok(info) => {
                        match info.path().extension() {
                            Some(file_type) => {
                                if file_type == "zip" {
                                    let temp = info.file_name();
                                    let temp_as_str = String::from(temp.to_string_lossy());
                                    mod_names.push(temp_as_str);
                                }
                            }
                            None => {}
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
    mod_names
}

#[tauri::command]
pub fn import_mod_to_cache(mod_location: String) -> bool {
    // import mod to cache
    let mut target_path = get_mod_cache_path();

    let mod_location_as_path = PathBuf::from(mod_location);

    let mod_name = mod_location_as_path.file_name();
    match mod_name {
        Some(info) => {
            target_path.push(info);
            if target_path.exists() {
                println!("Could not copy. File with exact name already exists.");
                return false;
            }
        }
        None => {
            println!("Could not get mod's file name.");
            return false;
        }
    };

    match fs::copy(mod_location_as_path, target_path) {
        Ok(_) => return true,
        Err(err) => {
            println!("{:?}", err);
            return false;
        }
    };
}

#[tauri::command]
pub fn remove_mod_from_cache(mod_name: String) -> bool {
    let mut target_path = get_mod_cache_path();
    target_path.push(mod_name);

    if target_path.exists() {
        match fs::remove_file(target_path) {
            Ok(_) => {
                return true;
            }
            Err(err) => {
                println!("{:?}", err);
                return false;
            }
        };
    } else {
        return false;
    }
}

pub fn get_mod_names_in_loadout(name: &String) -> Vec<String> {
    // get mod names for loadout
    let path = get_mod_path_for_loadout(name);
    let dir_reader = fs::read_dir(&path);
    let mut mod_names: Vec<String> = Vec::new();
    match dir_reader {
        Ok(reader) => {
            reader.for_each(|item| {
                match item {
                    Ok(info) => {
                        match info.path().is_dir() {
                            true => {
                                let mut path_to_mod_json = info.path().clone();
                                path_to_mod_json.push("mod.json");

                                match path_to_mod_json.exists() {
                                    true => {
                                        let temp = info.file_name();
                                        let temp_as_str = String::from(temp.to_string_lossy());
                                        mod_names.push(temp_as_str);
                                    }
                                    false => {
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
    mod_names
}

pub fn install_mods_on_loadout_creation(loadout: &ServerLoadout) -> Vec<String> {
    let path_to_mods_folder = get_mod_path_for_loadout(&loadout.name);
    let mods = &loadout.mods;

    let mut mod_names: Vec<String> = Vec::new();
    for mod_name in mods {
        if mod_name.contains(".zip") {
            install_mod_to_loadout(mod_name, path_to_mods_folder.clone());
        } else {
            mod_names.push(String::from(mod_name));
        }
    }

    let mut newly_installed_mod_names = make_folder_names_same_as_mod_json_names(&loadout.name);
    mod_names.append(&mut newly_installed_mod_names);
    mod_names
}

fn install_mod_to_loadout(mod_name: &String, path_to_mods_folder: PathBuf) {
    let mut path_to_mod = get_mod_cache_path();
    path_to_mod.push(mod_name);

    let destination = path_to_mods_folder.clone();

    match extract_zip(path_to_mod.as_path(), destination.as_path()) {
        Ok(_) => {
            println!("Zip successfully extracted!");
        }
        Err(err) => {
            panic!("{}{}", "Error while extracting Zip", err);
        }
    }
}

pub fn remove_mod_from_loadout() {
    // remove mod from loadout
}

pub fn update_mod_within_loadout() {
    // update mod within loadout
    // if mod doesn't already exist, install to loadout
    // if mod exists, extract to same place and overwrite existing files
}

pub fn open_explorer_in_mod_folder() {
    // open explorer in mod folder
}

pub fn open_mod_within_loadot_in_vscode() {
    // open vscode within loadout within mod
}

// *********************************
// copied from Limit Theory Launcher
// *********************************
fn extract_zip(zip_path: &Path, path: &Path) -> Result<(), String> {
    let initial_dir = match env::current_dir() {
        Ok(info) => info,
        Err(_) => get_mod_cache_path(),
    };

    if !path.exists() {
        match std::fs::create_dir(&path) {
            Ok(_) => match env::set_current_dir(&path) {
                Ok(_) => println!(
                    "Successfully changed working directory to {}!",
                    path.display()
                ),
                Err(e) => panic!("Error while switching working directory: {}", e),
            },
            Err(e) => panic!("{}", e),
        };
    } else {
        match env::set_current_dir(&path) {
            Ok(_) => println!(
                "Successfully changed working directory to {}!",
                path.display()
            ),
            Err(e) => panic!("Error while switching working directory: {}", e),
        }
    }

    let file = std::fs::File::open(&zip_path).unwrap();

    let mut archive = zip::ZipArchive::new(file).unwrap();

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        let outpath = match file.enclosed_name() {
            Some(path) => path.to_owned(),
            None => continue,
        };

        {
            let comment = file.comment();
            if !comment.is_empty() {
                println!("File {i} comment: {comment}");
            }
        }

        if (*file.name()).ends_with('/') {
            println!("File {} extracted to \"{}\"", i, outpath.display());
            std::fs::create_dir_all(&outpath).unwrap();
        } else {
            println!(
                "File {} extracted to \"{}\" ({} bytes)",
                i,
                outpath.display(),
                file.size()
            );
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    std::fs::create_dir_all(p).unwrap();
                }
            }
            let mut outfile = std::fs::File::create(&outpath).unwrap();
            io::copy(&mut file, &mut outfile).unwrap();
        }
    }

    match env::set_current_dir(initial_dir) {
        Ok(_) => {
            println!("Successfully reset env dir");
        }
        Err(err) => println!("{:?}", err),
    };
    Ok(())
}
