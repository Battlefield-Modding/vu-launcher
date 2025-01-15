use std::{
    env,
    fs::{self, read_to_string},
    io::{self},
    path::{Path, PathBuf},
    process::Command,
    os::windows::process::CommandExt,
};

use serde::{Deserialize, Serialize};
use serde_json::Error;

use crate::{
    reg_functions,
    servers::{get_loadouts_path, ServerLoadout}, CREATE_NO_WINDOW,
};

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct ModJson {
    pub Name: String,
    pub Authors: Option<Vec<String>>,
    pub Description: Option<String>,
    pub URL: Option<String>,
    pub Version: String,
    pub HasWebUI: bool,
    pub HasVeniceEXT: bool,
}

pub fn get_mod_cache_path() -> PathBuf {
    let install_path = match reg_functions::get_install_path_registry() {
        Ok(val) => val,
        Err(err) => err.to_string(),
    };

    let mut mod_cache_path = PathBuf::new();
    mod_cache_path.push(install_path);
    mod_cache_path.push("mod-cache");

    if !&mod_cache_path.exists() {
        fs::create_dir(&mod_cache_path);
    }
    return mod_cache_path;
}

pub fn make_folder_names_same_as_mod_json_names(loadout_name: &String) -> io::Result<Vec<String>> {
    let mods_path = get_mod_path_for_loadout(&loadout_name);
    let mut mod_list: Vec<String> = Vec::new();

    fs::read_dir(&mods_path)?.for_each(|item| {
        match item {
            Ok(info) => {
                let original_mod_path = info.path().clone();
                let mut mod_json_path = info.path().clone();
                mod_json_path.push("mod.json");

                if mod_json_path.exists() {
                    let mod_folder_name = match info.path().file_name().unwrap().to_str() {
                        Some(name) => name.to_owned(),
                        None => {
                            println!("Could not find folder name. Aborting renaming");
                            return;
                        }
                    };

                    let mod_json_contents_string = match fs::read_to_string(mod_json_path) {
                        Ok(text) => text,
                        Err(err) => {
                            println!("Failed to read modJSON for mod: {} due to reason: \n {:?}", &mod_folder_name, err);
                            return;
                        }
                    };
                    let mod_json_contents_struct: Result<ModJson, Error> =
                        serde_json::from_str(&mod_json_contents_string);

                    match mod_json_contents_struct {
                        Ok(mod_json) => {
                            if !mod_folder_name.eq(&mod_json.Name) {
                                let mut renamed_mod_path = mods_path.clone();
                                renamed_mod_path.push(&mod_json.Name);

                                match fs::rename(&original_mod_path, renamed_mod_path) {
                                    Ok(_) => {
                                        mod_list.push(String::from(&mod_json.Name));
                                        println!(
                                            "Successfully renamed mod folder for: {}",
                                            &mod_json.Name
                                        );
                                    }
                                    Err(_) => {
                                        println!("Failed to rename {}. Attempting to store inside MOD_DUMP", &mod_json.Name);

                                        let mut mod_dump_folder_path = mods_path.clone();
                                        mod_dump_folder_path.push("FAILED_TO_RENAME");

                                        if !mod_dump_folder_path.exists(){
                                            match fs::create_dir(&mod_dump_folder_path) {
                                                Ok(_) => {
                                                    println!("Created MOD_DUMP folder path");
                                                },
                                                Err(err) => {
                                                    println!("{:?}", err);
                                                    return;
                                                }
                                                
                                            }
                                        }
                                        
                                        mod_dump_folder_path.push(&mod_folder_name);

                                        match fs::rename(&original_mod_path, mod_dump_folder_path) {
                                            Ok(_) => {
                                                println!("Successfully moved {} into FAILED_TO_RENAME folder.", &mod_folder_name);
                                            }
                                            Err(_) => {
                                                println!("Error. Could not move {} into FAILED_TO_RENAME folder. DELETING!", &mod_folder_name);

                                                match fs::remove_dir_all(&original_mod_path){
                                                    Ok(_) => {
                                                        println!("Deleted unrenamable mod: {}", &mod_folder_name)
                                                    }, 
                                                    Err(err) => {
                                                        println!("{:?}", err);
                                                    }
                                                };
                                            }
                                        };
                                    }
                                };
                            }
                        }
                        Err(err) => {
                            println!("Mod JSON failed to convert to struct for {:?} due to reason: \n {:?}", info.path(), err);
                        }
                    }
                } else {
                    println!("Mod JSON does not exist for {:?}", mod_json_path);
                }
            }
            Err(_) => {
                println!("Error when reading mod JSONs")
            }
        };
    });
    Ok(mod_list)
}

fn get_admin_path_for_loadout(name: &String) -> PathBuf {
    let mut admin_path = get_loadouts_path();
    admin_path.push(&name);
    admin_path.push("Server");
    admin_path.push("Admin");
    admin_path
}

fn get_mod_path_for_loadout(name: &String) -> PathBuf {
    let mut loadout_path = get_admin_path_for_loadout(name);
    loadout_path.push("Mods");
    loadout_path
}

#[tauri::command]
pub fn get_mod_names_in_cache() -> Vec<String> {
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

#[tauri::command]
pub fn get_mod_names_in_loadout(name: String) -> Vec<String> {
    let path = get_mod_path_for_loadout(&name);
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

pub fn install_mods(loadout: &ServerLoadout) -> Vec<String> {
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

    match make_folder_names_same_as_mod_json_names(&loadout.name) {
        Ok(mut info) => {
            mod_names.append(&mut info);
        }
        Err(err) => {
            println!("{:?}", err);
        }
    }
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

#[tauri::command]
pub fn remove_mod_from_loadout(name: String, modname: String) -> bool {
    if name.contains("mod-cache") {
        return remove_mod_from_cache(modname);
    }
    let mut mod_path = get_mod_path_for_loadout(&name);
    mod_path.push(&modname);
    match fs::remove_dir_all(mod_path) {
        Ok(_) => {
            match remove_mod_from_modlist(&name, &modname) {
                true => {
                    println!("Successfully deleted mod from loadout");
                    return true;
                }
                false => return false,
            };
        }
        Err(err) => {
            println!("{:?}", err);
            return false;
        }
    }
}

#[tauri::command]
pub fn open_mod_with_vscode(name: String, modname: String) -> bool {
    let mut path_to_mod = get_mod_path_for_loadout(&name);
    path_to_mod.push(modname);

    let path_to_workspace = match get_vs_code_workspace_file(path_to_mod.clone()) {
        Ok(info) => info,
        Err(_) => path_to_mod.clone(),
    };

    if path_to_mod.eq(&path_to_workspace) {
        match &path_to_mod.to_str() {
            Some(path) => {
                println!("Attempting to open in vscode");
                let mut args = Vec::new();
                args.push("/C");
                args.push("code");
                args.push(path);

                Command::new("cmd")
                    .args(args)
                    .creation_flags(CREATE_NO_WINDOW)
                    .spawn()
                    .expect("failed to execute process");

                return true;
            }
            None => return false,
        };
    } else {
        match path_to_workspace.to_str() {
            Some(final_path) => {
                println!("Attempting to VSCode Workspace");
                let mut args = Vec::new();
                args.push("/C");
                args.push("code");
                args.push(final_path);

                Command::new("cmd")
                    .args(args)
                    .creation_flags(CREATE_NO_WINDOW)
                    .spawn()
                    .expect("failed to execute process");

                return true;
            }
            None => return false,
        }
    }
}

fn get_vs_code_workspace_file(mod_path: PathBuf) -> io::Result<PathBuf> {
    for entry in fs::read_dir(&mod_path.as_path())? {
        let entry = entry?;
        if entry.path().is_file() {
            match entry.path().extension() {
                Some(name) => {
                    if name == "code-workspace" {
                        return Ok(entry.path());
                    }
                }
                None => {}
            }
        }
    }

    return Ok(mod_path);
}

fn remove_mod_from_modlist(loadout_name: &String, mod_name: &String) -> bool {
    let mut modlist_path = get_admin_path_for_loadout(&loadout_name);
    modlist_path.push("modlist.txt");

    let modlist_string = match read_to_string(&modlist_path) {
        Ok(info) => info,
        Err(err) => {
            println!("{:?}", err);
            err.to_string()
        }
    };

    let modlist_filtered = modlist_string.split("\n").filter(|x| x != &mod_name);
    let collected_modlist: Vec<&str> = modlist_filtered.collect();
    let final_string = collected_modlist.join("\n");
    match fs::write(&modlist_path, final_string) {
        Ok(_) => return true,
        Err(err) => {
            println!("{:?}", err);
            return false;
        }
    };
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
