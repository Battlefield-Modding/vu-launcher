use std::{
    fs::{read_dir, read_to_string, write},
    io,
    path::PathBuf,
};

use loadout_structs::LoadoutJson;

use crate::servers::{get_loadout_path, get_loadouts_path};

pub mod loadout_structs;

fn get_loadout_json_as_struct(loadout_name: &String) -> io::Result<LoadoutJson> {
    let mut path_to_loadout_json = get_loadout_path(&loadout_name);
    path_to_loadout_json.push("loadout.json");
    let json_info = read_to_string(&path_to_loadout_json)?;
    let loadout_struct: LoadoutJson = serde_json::from_str(&json_info)?;
    Ok(loadout_struct)
}

fn convert_loadout_json_to_string(loadout: &LoadoutJson) -> Result<String, String> {
    let loadout_string = serde_json::to_string(loadout);
    match loadout_string {
        Ok(info) => return Ok(info),
        Err(err) => return Err(err.to_string()),
    };
}

fn write_loadout_json(loadout_name: String, loadout: LoadoutJson) {
    let mut path_to_loadout_json = get_loadout_path(&loadout_name);
    path_to_loadout_json.push("loadout.json");

    let loadout_json_string = match convert_loadout_json_to_string(&loadout) {
        Ok(info) => info,
        Err(err) => {
            println!("{:?}", err);
            return;
        }
    };

    match write(&path_to_loadout_json, loadout_json_string) {
        Ok(_) => {
            println!("Successfully wrote to {:?}", &path_to_loadout_json)
        }
        Err(err) => {
            println!(
                "Failed to write to {:?} due to error: \n{:?}",
                &path_to_loadout_json, err
            );
        }
    }
}

#[tauri::command]
pub fn update_loadout_json(loadout_name: String, new_arguments: LoadoutJson) {}

fn is_loadout(path: &PathBuf) -> bool {
    let mut loadout_json_path = path.clone();
    loadout_json_path.push("Server");
    return loadout_json_path.exists();
}

fn has_loadout_json(path: &PathBuf) -> bool {
    let mut server_path = path.clone();
    server_path.push("loadout.json");
    return server_path.exists();
}

fn make_loadout_json_for_loadout(loadout_name: String) {
    // TODO: Read and parse Startup.txt | Modlist.txt | Maplist.txt | Banlist.txt
    // TODO: Store the values from parsed files into a LoadoutJSON struct
    // TODO: Write that LoadoutJSON to a file
}

#[tauri::command]
pub fn get_all_loadout_json() -> Vec<LoadoutJson> {
    println!("Getting all loadout json...");
    // this function will return content from all server loadouts
    let loadout_path = get_loadouts_path();

    let dir_reader = read_dir(&loadout_path);
    let mut loadouts: Vec<LoadoutJson> = Vec::new();
    match dir_reader {
        Ok(reader) => {
            reader.for_each(|item| {
                match item {
                    Ok(info) => {
                        if info.path().is_dir() {
                            if is_loadout(&info.path()) {
                                let temp = info.file_name();
                                let loadout_name = String::from(temp.to_string_lossy());
                                if has_loadout_json(&info.path()){
                                    match get_loadout_json_as_struct(&loadout_name){
                                        Ok(loadout) => {
                                            loadouts.push(loadout);
                                        },
                                        Err(err) => {
                                            println!("Failed to get loadout json for {} due to error: \n{:?}", loadout_name, err);
                                        }
                                    }
                                } else {
                                    println!("Did not find loadout.json for loadout {}. Creating one now...", &loadout_name);
                                    make_loadout_json_for_loadout(loadout_name);
                                }
                            }
                        }
                    },
                    Err(_) => {
                        println!("Error when reading loadout Json.")
                    }
                };
            });
        }
        Err(err) => {
            println!(
                "Failed to get loadout JSON at path {:?} due to reason: \n{:?}",
                &loadout_path, err
            );
        }
    };
    loadouts
}
