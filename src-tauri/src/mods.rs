use std::{
    env,
    fs::{self},
    io::{self},
    path::{Path, PathBuf},
    process::Command,
    os::windows::process::CommandExt,
};

use serde_json::Error;

use crate::{
    loadouts::{get_all_mod_json_in_loadout, get_loadout_json_as_struct, loadout_structs::{GameMod, LoadoutJson, ModJson}, write_loadout_json, write_to_txt_from_loadout}, reg_functions, servers::get_loadouts_path, CREATE_NO_WINDOW
};


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

pub fn get_mod_json_for_mod_in_loadout(loadout_name: &String, mod_name: &String) -> io::Result<ModJson> {
    let mut mod_json_path = get_mod_path_for_loadout(&loadout_name);
    mod_json_path.push(mod_name);
    mod_json_path.push("mod.json");
    let text = fs::read_to_string(mod_json_path)?;
    let final_struct = serde_json::from_str(&text)?;
    Ok(final_struct)
}

pub fn get_mod_json_for_mod_in_cache(mod_name: &String) -> io::Result<ModJson> {
    let mut mod_json_path = get_mod_cache_path();
    mod_json_path.push(mod_name);
    mod_json_path.push("mod.json");
    let text = fs::read_to_string(mod_json_path)?;
    let final_struct = serde_json::from_str(&text)?;
    Ok(final_struct)
}

pub fn make_folder_names_same_as_mod_json_names(loadout_name: &String) -> io::Result<Vec<GameMod>> {
    let mods_path = get_mod_path_for_loadout(&loadout_name);
    let mut mod_list: Vec<GameMod> = Vec::new();

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
                                        println!(
                                            "Successfully renamed mod folder for: {}",
                                            &mod_json.Name
                                        );
                                        
                                        mod_list.push(GameMod{
                                            name: mod_json.Name,
                                            enabled: false,
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

                                match info.path().file_name(){
                                    Some(file_name) => {
                                        if file_type == "zip" {
                                            let temp = info.file_name();
                                            let temp_as_str = String::from(temp.to_string_lossy());
                                            mod_names.push(temp_as_str);
                                        } else {
                                            let mod_name = String::from(file_name.to_string_lossy());
                                            match get_mod_json_for_mod_in_cache(&mod_name){
                                                Ok(_) => {
                                                    mod_names.push(mod_name);
                                                },
                                                Err(_) => {}
                                            }
                                        }
                                    },
                                    None => {}
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
    println!("{:?}", mod_names);
    mod_names
}

#[tauri::command]
pub fn import_zipped_mod_to_cache(mod_location: String) -> bool {
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
        Ok(_) => {
            make_cache_folder_names_same_as_mod_json_names();
            return true},
        Err(err) => {
            println!("{:?}", err);
            return false;
        }
    };
}

#[tauri::command]
pub fn import_mod_folder_to_cache(mod_location: String) -> bool {
    let mut target_path = get_mod_cache_path();

    let mod_location_as_path = PathBuf::from(mod_location);
    if mod_location_as_path.is_dir() {
        let mut mod_json_path = PathBuf::from(&mod_location_as_path);
        mod_json_path.push("mod.json");
        if mod_json_path.exists(){
            // this is a proper mod. Let's import it
            match mod_location_as_path.file_name(){
                Some(mod_name) => {
                    target_path.push(mod_name);

                    match dircpy::copy_dir(mod_location_as_path, target_path){
                        Ok(_) => {
                            make_cache_folder_names_same_as_mod_json_names();
                            return true
                        },
                        Err(err) => {
                            println!("Failed to copy mod folder into mod_cach due to error:\n{:?}", err);
                        }
                    }
                },
                None => {
                    return false
                }
            }
            
        } 
        return false
    }
    return false
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
pub fn get_mod_names_in_loadout(name: String) -> Vec<GameMod> {
    
    match get_loadout_json_as_struct(&name){
        Ok(mut loadout) => {
            if loadout.modlist.len() == 0 {
                let mods = get_all_mod_json_in_loadout(&name);
                loadout.modlist = mods;
                match write_loadout_json(&loadout){
                    Ok(_) => {
                        return loadout.modlist;
                    },
                    Err(err) => {
                        println!("Failed to write loadout Json after updating modlist due to error:\n{:?}", err);
                        return Vec::new();
                    }
                }
            } else {
                return loadout.modlist
            }
        },
        Err(err) => {
            println!("Failed to fetch loadoutJSON while updating modlist due to error:\n{:?}", err);
            return Vec::new();
        }
    }
}

#[tauri::command]
pub fn install_zipped_mod_to_loadout(loadout_name: String, mod_name: String) -> bool {
    if copy_mod_to_loadout_from_cache(&mod_name, get_mod_path_for_loadout(&loadout_name)) {
        match make_folder_names_same_as_mod_json_names(&loadout_name){
            Ok(new_modlist) => {
                match get_loadout_json_as_struct(&loadout_name){
                    Ok(mut loadout_json) => {
                        loadout_json.modlist = new_modlist;
                        match write_loadout_json(&loadout_json){
                            Ok(_) => {
                                return true
                            },
                            Err(err) => {
                                println!("Failed to write to loadoutJSON after installing a mod due to reason:\n{:?}",err);
                                return false
                            }
                        }
                    },
                    Err(err) => {
                        println!("Failed to fetch loadoutJSON while installing mod due to error:\n{:?}", err);
                        return false
                    }
                }
            }, 
            Err(err) => {
                println!("Failed make_folder_names_same_as_mod_json_names due to reason:\n{:?}", err);
                return false
            }
        }
    } else {
        return false
    }
}

pub fn install_mods_on_loadout_creation(loadout: &LoadoutJson) -> Vec<GameMod> {
    let path_to_mods_folder = get_mod_path_for_loadout(&loadout.name);

    let mut mod_names: Vec<GameMod> = Vec::new();
    for mod_info in &loadout.modlist {
        if mod_info.name.contains(".zip") {
            if !copy_mod_to_loadout_from_cache(&mod_info.name, path_to_mods_folder.clone()){
                println!("Failed to install mod:\n${:?}", &mod_info.name);
            }
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

fn copy_mod_to_loadout_from_cache(mod_name: &String, path_to_mods_folder: PathBuf) -> bool {
    let mut path_to_mod = get_mod_cache_path();
    path_to_mod.push(mod_name);

    let destination = path_to_mods_folder.clone();

    match extract_zip(path_to_mod.as_path(), destination.as_path()) {
        Ok(_) => {
            println!("Zip successfully extracted!");
            return true
        }
        Err(err) => {
            println!("Error while extracting copied mod:\n${:?}", err);
            return false
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
    let loadout = get_loadout_json_as_struct(&loadout_name);
    match loadout {
        Ok(mut info) => {
            let index = info.modlist.iter().position(|r| r.name.to_lowercase().eq(&mod_name.to_lowercase())).unwrap();
            info.modlist.remove(index);

            match write_loadout_json(&info) {
                Ok(_) => {},
                Err(err) => {
                    println!("Failed to write loadoutJSON after deleting a mod due to error:\n{:?}", err);
                    return false;
                }
            }        
        },  
        Err(err) => {
            println!("Failed to get loadout due to error: \n{:?}", err);
            return false
        }
    }
    match write_to_txt_from_loadout(&loadout_name){
        Ok(_) => { return true },
        Err(err) => {
            println!("Failed to update txt files after deleting mod due to error:\n{:?}", err);
            return false
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

pub fn make_cache_folder_names_same_as_mod_json_names() -> io::Result<Vec<GameMod>> {
    let mods_path = get_mod_cache_path();
    let mut mod_list: Vec<GameMod> = Vec::new();

    fs::read_dir(&mods_path)?.for_each(|item| {
        match item {
            Ok(info) => {
                let original_mod_path = info.path().clone();
                if original_mod_path.is_file(){
                    let file_name = original_mod_path.file_name().unwrap().to_str().unwrap();
                    if file_name.contains(".zip"){
                        let mut target_path = mods_path.clone();

                        let mut zip_path = mods_path.clone();
                        zip_path.push(file_name);

                        match extract_zip(&zip_path, &target_path){
                            Ok(_) => {},
                            Err(err) => {println!("Failed to extract zip at {:?} due to error:\n{:?}", zip_path, err); return}
                        };

                        match file_name.split_once("."){
                            Some((mod_name, _)) => {
                                println!("Trying to get mod json for: {:?}", &mod_name);
                                match get_mod_json_for_mod_in_cache(&mod_name.to_owned()){
                                    Ok(mod_json) => {
                                        let mut new_mod_name = mod_json.Name.clone();
                                        new_mod_name.push_str("-");
                                        new_mod_name.push_str(&mod_json.Version);
                                        let mut new_mod_path = mods_path.clone();
                                        new_mod_path.push(&new_mod_name);

                                        target_path.push(mod_name);
        
                                        match fs::rename(&target_path, &new_mod_path) {
                                            Ok(_)=>{println!("Successfully renamed extracted mod folder!")},
                                            Err(err) => {println!("Failed to rename {:?} into {:?} due to error\n{:?}", target_path, new_mod_path, err)}
                                        }
                                        match fs::remove_file(&zip_path){
                                            Ok(_) => println!("Successfully deleted original zipmod folder: {:?}", zip_path),
                                            Err(err)=>println!("Failed to delete original zipmod folder: {:?}", zip_path)
                                        }
                                    },
                                    Err(err) => {
                                        println!("Failed to rename the extracted mod {} into its mod JSON name due to error:\n{:?}", file_name, err);
                                        target_path.push(mod_name);
                                        match fs::remove_dir_all(&target_path){
                                            Ok(_) => println!("Successfully deleted un-renamable mod folder: {:?}", mod_name),
                                            Err(err)=>println!("Failed to delete un-renamable mod folder: {:?}", mod_name)
                                        };
                                        match fs::remove_file(&zip_path){
                                            Ok(_) => println!("Successfully deleted un-renamable zipmod folder: {:?}", zip_path),
                                            Err(err)=>println!("Failed to delete un-renamable zipmod folder: {:?}", zip_path)
                                        }
                                    }
                                 }
         
                            },
                            None => {

                            }
                        }
                    }
                } else { 
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
                                    println!("Successfully renamed extracted mod folder!")
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
    Ok(mod_list)
}