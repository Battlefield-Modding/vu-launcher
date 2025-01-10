use std::{
    env, fs, io,
    path::{self, Path, PathBuf},
};

use crate::{
    reg_functions,
    servers::{get_loadouts_path, ServerLoadout},
};

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

pub fn get_mod_names_for_loadout(name: &String) -> Vec<String> {
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
                                let temp = info.file_name();
                                let temp_as_str = String::from(temp.to_string_lossy());
                                mod_names.push(temp_as_str);
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

pub fn install_mods_on_loadout_creation(loadout: &ServerLoadout) {
    let path_to_mods_folder = get_mod_path_for_loadout(&loadout.name);
    let mods = &loadout.mods;

    for mod_name in mods {
        install_mod_to_loadout(mod_name, path_to_mods_folder.clone());
    }

    // extract from source to dest
}

fn install_mod_to_loadout(mod_name: &String, path_to_mods_folder: PathBuf) {
    // install mod to loadout
    let mut path_to_mod = get_mod_cache_path();
    path_to_mod.push(mod_name);

    let destination = path_to_mods_folder.clone();

    match extract_zip(path_to_mod.as_path(), destination.as_path()) {
        Ok(_) => println!("Zip successfully extracted!"),
        Err(err) => panic!("{}{}", "Error while extracting Zip", err),
    }

    // make sure the mod doesn't already exist in loadout
    // take zip folder from cache
    // extract it to the loadout
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
    println!("*******************EXTRACT ZIP*******************");
    println!("{:?}", zip_path);
    println!("{:?}", path);
    println!("*******************EXTRACT ZIP*******************");
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

    Ok(())
}
