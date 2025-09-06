use std::{
    env,
    fs::{self, read_to_string},
    io::{self},
    os::windows::process::CommandExt,
    path::{Path, PathBuf},
    process::Command,
};

use serde_json::Error;

use crate::{
    loadouts::{
        get_loadout_json_as_struct, get_loadouts_path,
        get_mods_and_delete_invalid_folders_in_loadout,
        loadout_structs::{GameMod, LoadoutJson, ModJson},
        write_loadout_json_and_txt_files,
    },
    registry, CREATE_NO_WINDOW,
};

pub fn get_mod_cache_path() -> PathBuf {
    let install_path = match registry::get_install_path_registry() {
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

pub fn get_mod_json_for_mod_in_loadout(
    loadout_name: &String,
    mod_name: &String,
) -> io::Result<ModJson> {
    let mut mod_json_path = get_mod_path_for_loadout(&loadout_name);
    mod_json_path.push(mod_name);
    mod_json_path.push("mod.json");
    let text = fs::read_to_string(mod_json_path)?;
    let final_struct = serde_json::from_str(&text)?;
    Ok(final_struct)
}

pub fn get_mod_json_for_mod_in_cache(mod_name: &String) -> io::Result<ModJson> {
    println!("Trying to get mod JSON for the Cache mod: {:?}", &mod_name);
    let mut mod_json_path = get_mod_cache_path();
    mod_json_path.push(mod_name);
    mod_json_path.push("mod.json");

    println!(
        "The path we are trying to read from is: {:?}",
        &mod_json_path
    );
    let text = fs::read_to_string(mod_json_path)?;
    let final_struct = serde_json::from_str(&text)?;
    Ok(final_struct)
}

pub fn get_mod_json_path(loadout_name: &String, dir_entry: &fs::DirEntry) -> io::Result<PathBuf> {
    let meta_data = dir_entry.metadata()?;
    if meta_data.is_dir() {
        let mut default_mod_json_path = dir_entry.path();
        default_mod_json_path.push("mod.json");

        if default_mod_json_path.exists() {
            Ok(default_mod_json_path)
        } else {
            // If I want to check for nested modJson at the same time?
            // let dir_reader = fs::read_dir(&dir_entry.path()).unwrap();
            // let mut number_of_files = 0;
            // let mut last_path = PathBuf::new();
            // for path_result in dir_reader {
            //     last_path = path_result.unwrap().path();
            //     number_of_files += 1;
            // }

            // if number_of_files == 1 {
            //     // there's a nested folder. Grab that nested folder, shift contents up one?
            //     last_path.push("mod.json");
            //     if last_path.exists() {
            //         return Ok(last_path);
            //     } else {
            //         return Ok(PathBuf::new());
            //     }
            // }
            return Ok(PathBuf::new());
        }
    } else {
        return Ok(PathBuf::new());
    }
}

pub fn make_folder_names_same_as_mod_json_names(loadout_name: &String) -> io::Result<Vec<GameMod>> {
    let mods_path = get_mod_path_for_loadout(&loadout_name);
    let mut mod_list: Vec<GameMod> = Vec::new();

    let empty_path_buf = PathBuf::new();

    fs::read_dir(&mods_path)?.for_each(|item| {
        match item {
            Ok(info) => {
                let original_mod_path = info.path().clone();
                match get_mod_json_path(loadout_name, &info){
                    Ok(mod_json_path) => {
                        if mod_json_path != empty_path_buf {
                            let mod_folder_name: String = match info.path().file_name().unwrap().to_str() {
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
                                                println!(
                                                    "Successfully renamed mod folder for: {}",
                                                    &mod_json.Name
                                                );
                                                mod_list.push(GameMod{
                                                    name: mod_json.Name,
                                                    enabled: true,
                                                    version: mod_json.Version,
                                                    image: None,
                                                    src: mod_json.URL
                                                });
                                            }
                                            Err(_) => {
                                                println!("Failed to rename {}. Attempting to store inside MOD_DUMP", &mod_json.Name);

                                                let mut mod_dump_folder_path = mods_path.clone();
                                                mod_dump_folder_path.push("FAILED_TO_RENAME");

                                                if !mod_dump_folder_path.exists(){
                                                    match fs::create_dir(&mod_dump_folder_path){
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
                            println!("Mod JSON does not exist at {:?}. Attempting to search ONE level deeper...", mod_json_path);

                            let mut num_dirs = 0;
                            let mut is_dir = false;
                            let mut path = PathBuf::new();

                            fs::read_dir(&info.path().clone()).unwrap().for_each(|item| {
                                match item {
                                    Ok(inner) => {
                                        if inner.metadata().unwrap().is_dir(){
                                            is_dir = true;
                                            path = inner.path();
                                        }
                                        num_dirs += 1;
                                    },
                                    Err(_) => {}
                                }
                            });

                            if num_dirs == 1 && is_dir {
                                // move the contents of the folder up one level. Delete the original subfolder that contained the stuff.
                                let mut nested_mod_json_path = path.clone();
                                nested_mod_json_path.push("mod.json");
                                if nested_mod_json_path.exists() {
                                    // do stuff
                                    let string = fs::read_to_string(nested_mod_json_path).unwrap();
                                    let mod_json_result: Result<ModJson, Error> = serde_json::from_str(&string);
                                    match mod_json_result {
                                        Ok(mod_json_struct) => {
                                            let mut final_path = mods_path.clone();
                                            final_path.push(mod_json_struct.Name);

                                            let _ = dircpy::copy_dir(&path, &final_path);
                                            // rename stuff
                                            println!("Successfully copied files over. Removing old mod folder: {:?}", &info);
                                            let _ = fs::remove_dir_all(info.path());
                                        },
                                        Err(err) => {

                                        }
                                    }
                                } else {
                                    println!("There was no modJSON in the nested folder. Deleting the folder: {:?}", &info);
                                    let _ = fs::remove_dir_all(info.path());
                                }
                            }
                        }
                    },
                    Err(err) => {
                    }
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
pub fn get_mod_names_in_cache() -> Vec<GameMod> {
    let mod_cache_path = get_mod_cache_path();
    let dir_reader = fs::read_dir(&mod_cache_path);
    let mut mod_names: Vec<GameMod> = Vec::new();
    match dir_reader {
        Ok(reader) => {
            reader.for_each(|item| {
                match item {
                    Ok(info) => {
                        if info.path().is_dir() {
                            let mut path_to_mod_json = info.path().clone();
                            path_to_mod_json.push("mod.json");

                            if path_to_mod_json.exists() {
                                match read_to_string(path_to_mod_json) {
                                    Ok(info) => {
                                        let game_mod: Result<ModJson, Error> =
                                            serde_json::from_str(&info);
                                        match game_mod {
                                            Ok(mod_info) => {
                                                let mod_info = GameMod {
                                                    name: mod_info.Name,
                                                    version: mod_info.Version,
                                                    image: None,
                                                    src: mod_info.URL,
                                                    enabled: false,
                                                };
                                                mod_names.push(mod_info);
                                            }
                                            Err(err) => {
                                                println!(
                                                    "Failed to read Game Mod due to error:\n{:?}",
                                                    err
                                                );
                                            }
                                        }
                                    }
                                    Err(_) => {}
                                }
                            }
                        }
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
    println!("{:?}", mod_names);
    mod_names
}

#[tauri::command]
pub async fn import_zipped_mod_to_cache(mod_location: String) -> bool {
    let mut target_path = get_mod_cache_path();
    target_path.push("temporary_zip_folder");

    let mod_location_as_path = PathBuf::from(mod_location);

    match extract_zip(&mod_location_as_path, &target_path) {
        Ok(_) => {
            make_cache_folder_names_same_as_mod_json_names();
            return true;
        }
        Err(err) => {
            println!("{:?}", err);
            return false;
        }
    }
}

#[tauri::command]
pub async fn import_mod_folder_to_cache(mod_location: String) -> bool {
    let mut target_path = get_mod_cache_path();

    let mod_location_as_path = PathBuf::from(mod_location);
    if mod_location_as_path.is_dir() {
        let mut mod_json_path = PathBuf::from(&mod_location_as_path);
        mod_json_path.push("mod.json");
        if mod_json_path.exists() {
            // this is a proper mod. Let's import it
            match mod_location_as_path.file_name() {
                Some(mod_name) => {
                    target_path.push(mod_name);

                    match dircpy::copy_dir(mod_location_as_path, target_path) {
                        Ok(_) => {
                            make_cache_folder_names_same_as_mod_json_names();
                            return true;
                        }
                        Err(err) => {
                            println!(
                                "Failed to copy mod folder into mod_cach due to error:\n{:?}",
                                err
                            );
                        }
                    }
                }
                None => return false,
            }
        }
        return false;
    }
    return false;
}

#[tauri::command]
pub async fn remove_mod_from_cache(mod_name: String) -> bool {
    let mut target_path = get_mod_cache_path();
    target_path.push(mod_name);

    if target_path.exists() {
        if target_path.is_dir() {
            match fs::remove_dir_all(target_path) {
                Ok(_) => {
                    return true;
                }
                Err(err) => {
                    println!("{:?}", err);
                    return false;
                }
            };
        } else {
            match fs::remove_file(target_path) {
                Ok(_) => {
                    return true;
                }
                Err(err) => {
                    println!("{:?}", err);
                    return false;
                }
            };
        }
    } else {
        return false;
    }
}

#[tauri::command]
pub fn get_mod_names_in_loadout(name: String) -> Vec<GameMod> {
    match get_loadout_json_as_struct(&name) {
        Ok(mut loadout) => {
            if loadout.modlist.len() == 0
                || !same_number_of_mods_in_loadout_and_mods_folder(&loadout)
            {
                let mods = get_mods_and_delete_invalid_folders_in_loadout(&name, &loadout.modlist);
                loadout.modlist = mods;
                match write_loadout_json_and_txt_files(&loadout) {
                    Ok(_) => {
                        return loadout.modlist;
                    }
                    Err(err) => {
                        println!("Failed to write loadout Json after updating modlist due to error:\n{:?}", err);
                        return Vec::new();
                    }
                }
            } else {
                return loadout.modlist;
            }
        }
        Err(err) => {
            println!(
                "Failed to fetch loadoutJSON while updating modlist due to error:\n{:?}",
                err
            );
            return Vec::new();
        }
    }
}

#[tauri::command]
pub async fn install_mod_to_loadout_from_cache(loadout_name: String, game_mod: GameMod) -> bool {
    if copy_mod_to_loadout_from_cache(&game_mod, &loadout_name).await {
        return true;
    } else {
        return false;
    }
}

pub async fn install_mods_on_loadout_creation(loadout: &LoadoutJson) -> Vec<GameMod> {
    let mut mod_names: Vec<GameMod> = Vec::new();
    for mod_info in &loadout.modlist {
        if !copy_mod_to_loadout_from_cache(mod_info, &loadout.name).await {
            println!("Failed to install mod:\n${:?}", &mod_info.name);
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

async fn copy_mod_to_loadout_from_cache(mod_info: &GameMod, loadout_name: &String) -> bool {
    let mut path_to_mod = get_mod_cache_path();
    let mut string_mod_name = String::from("");
    string_mod_name.push_str(&mod_info.name);
    string_mod_name.push_str("-");
    string_mod_name.push_str(&mod_info.version);

    path_to_mod.push(&string_mod_name);

    let mut destination = get_mod_path_for_loadout(&loadout_name);
    destination.push(&mod_info.name);

    if destination.exists() {
        println!(
            "The destination {:?} already exists. Not copying from cache to loadout.",
            &destination
        );
        return false;
    }

    match dircpy::copy_dir(path_to_mod, destination) {
        Ok(_) => match get_loadout_json_as_struct(&loadout_name) {
            Ok(mut loadout_json) => {
                let new_struct = GameMod {
                    enabled: true,
                    image: None,
                    name: mod_info.name.clone(),
                    src: mod_info.src.clone(),
                    version: mod_info.version.clone(),
                };
                loadout_json.modlist.push(new_struct);
                match write_loadout_json_and_txt_files(&loadout_json) {
                    Ok(_) => return true,
                    Err(err) => {
                        println!("Failed to update loadout.json after importing mod to loadout from cache due to error:\n{:?}", err);
                        return false;
                    }
                }
            }
            Err(err) => {
                println!("Failed to insert newly installed mod into loadoutJSON modlist due to error:\n{:?}", err);
                return false;
            }
        },
        Err(err) => {
            println!("Failed to install mod to loadout due to error:\n{:?}", err);
            return false;
        }
    }
}

#[tauri::command]
pub async fn remove_mod_from_loadout(name: String, modname: String) -> bool {
    if name.contains("mod-cache") {
        println!("Trying to delete the mod called [{:?}]", &modname);
        return remove_mod_from_cache(modname).await;
    }
    let mut mod_path = get_mod_path_for_loadout(&name);
    mod_path.push(&modname);
    if !mod_path.exists() {
        match remove_mod_from_modlist(&name, &modname) {
            true => {
                println!("Successfully deleted mod from loadout");
                return true;
            }
            false => return false,
        };
    }
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
    let loadout = get_loadout_json_as_struct(&loadout_name);
    match loadout {
        Ok(mut info) => {
            let index = info
                .modlist
                .iter()
                .position(|r| r.name.to_lowercase().eq(&mod_name.to_lowercase()))
                .unwrap();
            info.modlist.remove(index);

            match write_loadout_json_and_txt_files(&info) {
                Ok(_) => return true,
                Err(err) => {
                    println!(
                        "Failed to write loadoutJSON after deleting a mod due to error:\n{:?}",
                        err
                    );
                    return false;
                }
            }
        }
        Err(err) => {
            println!("Failed to get loadout due to error: \n{:?}", err);
            return false;
        }
    }
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

pub fn extract_mod_cache_zip_folders() -> bool {
    let mods_path = get_mod_cache_path();
    match fs::read_dir(&mods_path) {
        Ok(data) => {
            data.for_each(|item| {
                match item {
                    Ok(info) => {
                        let original_mod_path = info.path().clone();
                        if original_mod_path.is_file(){
                            let file_name = original_mod_path.file_name().unwrap().to_str().unwrap();
                            if info.path().extension().unwrap() == "zip" {
                                let target_path = mods_path.clone();

                                let mut zip_path = mods_path.clone();
                                zip_path.push(file_name);

                                match extract_zip(&zip_path, &target_path){
                                    Ok(_) => {
                                        println!("Extraction of {:?} is successfull!", &zip_path);
                                        match fs::remove_file(&zip_path){
                                            Ok(_) => {println!("Successfully removed zip file: {:?}", &zip_path)},
                                            Err(err) => {println!("Failed to remove zip filed at {:?} due to error:\n{:?}", &zip_path, err)}
                                        }
                                    },
                                    Err(err) => {println!("Failed to extract zip at {:?} due to error:\n{:?}", zip_path, err); return}
                                };
                            }
                        }
                    },
                    Err(_) => {
                        println!("Error when trying to extract zips");
                    }
                };
            });
        }
        Err(_) => return false,
    }
    true
}

#[tauri::command]
pub fn make_cache_folder_names_same_as_mod_json_names() -> bool {
    extract_mod_cache_zip_folders();
    let mods_path = get_mod_cache_path();
    match fs::read_dir(&mods_path) {
        Ok(data) => {
            data.for_each(|item| {
                match item {
                    Ok(info) => {
                        let original_mod_path = info.path().clone();
                        if original_mod_path.is_dir() {
                            let mod_name = original_mod_path.file_name().unwrap().to_str().unwrap().to_owned();
                            match get_mod_json_for_mod_in_cache(&mod_name){
                                Ok(mod_json) => {
                                    let mut new_mod_name = mod_json.Name.clone();
                                    new_mod_name.push_str("-");
                                    new_mod_name.push_str(&mod_json.Version);
                                    let mut new_mod_path = mods_path.clone();
                                    new_mod_path.push(&new_mod_name);
                                    match fs::rename(&original_mod_path, &new_mod_path){
                                        Ok(_)=>{
                                            println!("Successfully renamed mod folder from {:?} to {:?}!", &original_mod_path, &new_mod_path);
                                        },
                                        Err(err) => {
                                            println!("Failed to rename {:?} into {:?} due to error\n{:?}", original_mod_path, new_mod_path, err);
                                            match fs::remove_dir_all(&original_mod_path){
                                                Ok(_)=>{
                                                    println!("Successfully deleted un-renamable mod folder: {:?}", &original_mod_path)
                                                },
                                                Err(err) => {
                                                    println!("Failed to delete {:?}  due to error\n{:?}", &original_mod_path, err)
                                                }
                                            }
                                        }
                                    }
                                },
                                Err(err) => {
                                    println!("Failed to rename the folder mod {} into its mod JSON name due to error:\n{:?}", mod_name, err);
                                    match fs::remove_dir_all(&original_mod_path){
                                        Ok(_)=>{
                                            println!("Successfully deleted un-renamable mod folder: {:?}", &original_mod_path)
                                        },
                                        Err(err) => {
                                            println!("Failed to delete {:?}  due to error\n{:?}", &original_mod_path, err)
                                        }
                                    }
                                }
                            }
                        }
                    }
                    Err(_) => {
                        println!("Error when reading mod JSONs")
                    }
                };
            });
        }
        Err(_) => return false,
    }
    true
}

#[tauri::command]
pub async fn import_zipped_mod_to_loadout(mod_location: String, loadout_name: String) -> bool {
    let mut target_path = get_mod_path_for_loadout(&loadout_name);
    target_path.push("temporary_zip_folder");

    let mod_location_as_path = PathBuf::from(mod_location);
    match get_loadout_json_as_struct(&loadout_name) {
        Ok(loadout) => match extract_zip(&mod_location_as_path, &target_path) {
            Ok(_) => {
                get_mods_and_delete_invalid_folders_in_loadout(&loadout_name, &loadout.modlist);
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

#[tauri::command]
pub async fn import_mod_folder_to_loadout(mod_location: String, loadout_name: String) -> bool {
    let mut target_path = get_mod_path_for_loadout(&loadout_name);

    let mod_location_as_path = PathBuf::from(mod_location);
    if mod_location_as_path.is_dir() {
        let mut mod_json_path = PathBuf::from(&mod_location_as_path);
        mod_json_path.push("mod.json");
        if mod_json_path.exists() {
            let mod_json_info = fs::read_to_string(&mod_json_path).unwrap();
            let mod_json_result: Result<ModJson, Error> = serde_json::from_str(&mod_json_info);
            match mod_json_result {
                Ok(mod_json_struct) => {
                    target_path.push(&mod_json_struct.Name);

                    if target_path.exists() {
                        return false;
                    }

                    match dircpy::copy_dir(&mod_location_as_path, &target_path) {
                        Ok(_) => match get_loadout_json_as_struct(&loadout_name) {
                            Ok(mut loadout_json) => {
                                let new_struct = GameMod {
                                    enabled: true,
                                    image: None,
                                    name: mod_json_struct.Name.clone(),
                                    src: mod_json_struct.URL.clone(),
                                    version: mod_json_struct.Version.clone(),
                                };
                                loadout_json.modlist.push(new_struct);
                                match write_loadout_json_and_txt_files(&loadout_json) {
                                    Ok(_) => return true,
                                    Err(err) => {
                                        println!("Failed to update loadout.json after importing mod to loadout due to error:\n{:?}", err);
                                        return false;
                                    }
                                }
                            }
                            Err(err) => {
                                println!("Failed to insert newly installed mod into loadoutJSON modlist due to error:\n{:?}", err);
                                return false;
                            }
                        },
                        Err(err) => {
                            println!("Failed to import mod into loadout due to error {:?}", err);
                            return false;
                        }
                    }
                }
                Err(err) => {
                    println!(
                        "Failed to read ModJSON while importing mod into loadout due to error:\n{:?}",
                        err
                    );
                    return false;
                }
            }
        }
        return false;
    }
    return false;
}

pub fn same_number_of_mods_in_loadout_and_mods_folder(loadout: &LoadoutJson) -> bool {
    let mods_path = get_mod_path_for_loadout(&loadout.name);
    let mut num_mods = 0;

    fs::read_dir(&mods_path)
        .unwrap()
        .for_each(|item| match item {
            Ok(dir_entry) => {
                if dir_entry.metadata().unwrap().is_dir() {
                    if dir_entry.file_name() != "FAILED_TO_RENAME" {
                        num_mods += 1;
                    }
                }
            }
            Err(_) => {}
        });

    if num_mods == loadout.modlist.len() {
        println!("Modlist and num_mods are identical in: {:?}", &loadout.name);
        return true;
    }
    println!("Modlist and num_mods are different in: {:?}", &loadout.name);
    return false;
}

#[tauri::command]
pub async fn toggle_mod(game_mod: GameMod, loadout_name: String) -> bool {
    match get_loadout_json_as_struct(&loadout_name) {
        Ok(mut loadout) => {
            let mut updated_mod = false;
            for i in &mut loadout.modlist {
                if i.name == game_mod.name && i.version == game_mod.version {
                    i.enabled = !i.enabled;
                    updated_mod = true;
                    break;
                }
            }
            if updated_mod == true {
                match write_loadout_json_and_txt_files(&loadout) {
                    Ok(_) => return true,
                    Err(err) => {
                        println!(
                            "Failed to write loadoutJSON / txt files after toggling mod due to error: \n{:?}",
                            err
                        );
                        return false;
                    }
                }
            }
            return false;
        }
        Err(err) => {
            println!("Failed to get ModJSON as struct due to error: \n{:?}", err);
            return false;
        }
    }
}
