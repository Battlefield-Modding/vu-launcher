use std::{
    f64,
    fs::{read_dir, read_to_string, write},
    io,
    path::PathBuf,
};

use loadout_structs::{Admin, LoadoutJson, StartupArgs, VU_Commands, Vars};
use serde_json::Error;
use serde_json::Value;

use crate::servers::{get_loadout_admin_path, get_loadout_path, get_loadouts_path};

pub mod loadout_structs;

pub fn get_loadout_json_as_struct(loadout_name: &String) -> io::Result<LoadoutJson> {
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

fn make_loadout_json_for_loadout(loadout_name: &String) {
    // import startup_txt_into_loadout
    // import modlist_txt_into_loadout
    // import banlist_txt_into_loadout
    // import maplist_txt_into_loadout
    // TODO: Read and parse Startup.txt | Modlist.txt | Maplist.txt | Banlist.txt
    // TODO: Store the values from parsed files into a LoadoutJSON struct
    // TODO: Write that LoadoutJSON to a file
}

fn import_startup_txt_into_loadout(loadout_name: &String) {
    let mut startup_txt_path = get_loadout_admin_path(loadout_name);
    startup_txt_path.push("startup.txt");

    let vars: Vars = Vars {
        ranked: None,
        serverName: String::from(""),
        gamePassword: None,
        autoBalance: None,
        roundStartPlayerCount: None,
        roundRestartPlayerCount: None,
        roundLockdownCountdown: None,
        serverMessage: None,
        friendlyFire: None,
        maxPlayers: None,
        serverDescription: None,
        killCam: None,
        miniMap: None,
        hud: None,
        crossHair: None,
        _3dSpotting: None,
        miniMapSpotting: None,
        nameTag: None,
        _3pCam: None,
        regenerateHealth: None,
        teamKillCountForKick: None,
        teamKillValueForKick: None,
        teamKillValuelncrease: None,
        teamKillValueDecreasePerSecond: None,
        teamKillKickForBan: None,
        idleTimeout: None,
        idleBanRounds: None,
        vehicleSpawnAllowed: None,
        vehicleSpawnDelay: None,
        soldierHealth: None,
        playerRespawnTime: None,
        playerManDownTime: None,
        bulletDamage: None,
        gameModeCounter: None,
        onlySquadLeaderSpawn: None,
        unlockMode: None,
        premiumStatus: None,
    };

    let admin = Admin {
        password: String::from(""),
    };

    let vu = VU_Commands {
        ColorCorrectionEnabled: None,
        DesertingAllowed: None,
        DestructionEnabled: None,
        HighPerformanceReplication: None,
        ServerBanner: None,
        SetTeamTicketCount: None,
        SquadSize: None,
        SunFlareEnabled: None,
        SuppressionMultiplier: None,
        FriendlyFireSuppression: None,
        TimeScale: None,
        VehicleDisablingEnabled: None,
        HttpAssetUrl: None,
        DisablePreRound: None,
        TeamActivatedMines: None,
        CorpseDamageEnabled: None,
    };

    let mut startup: StartupArgs = StartupArgs {
        admin,
        vars,
        RM: None,
        vu: Some(vu),
        reservedSlots: None,
    };

    let vu_initial = serde_json::to_value(startup.vu).unwrap();
    let mut vu_object = vu_initial.as_object().unwrap().to_owned();
    let admin_initial = serde_json::to_value(startup.admin).unwrap();
    let mut admin_object = admin_initial.as_object().unwrap().to_owned();
    let vars_initial = serde_json::to_value(startup.vars).unwrap();
    let mut vars_object = vars_initial.as_object().unwrap().to_owned();

    match read_to_string(startup_txt_path) {
        Ok(info) => {
            let string_vec = info.split("\n");
            for string in string_vec.into_iter() {
                if string.starts_with("#") {
                    // this is a comment. DISREGARDING
                } else if string.contains(".") {
                    let splits: Vec<&str> = string.split(".").collect();
                    let len = splits.len();
                    if len == 2 {
                        match splits.get(0) {
                            Some(split_info) => {
                                let test_split = String::from(split_info.to_owned());

                                match splits.get(1) {
                                    Some(split_val) => {
                                        let second_split: Vec<&str> =
                                            split_val.split(" ").collect();
                                        match second_split.get(0) {
                                            Some(key) => {
                                                let owned_key = key.to_owned();

                                                match second_split.get(1) {
                                                    Some(value) => {
                                                        let owned_value = value.to_owned();

                                                        let test_num = owned_value;

                                                        match test_num.parse::<u32>() {
                                                            Ok(num) => {
                                                                let owned_value_as_value =
                                                                    serde_json::to_value(num)
                                                                        .unwrap();
                                                                if test_split.eq("vars") {
                                                                    vars_object.insert(
                                                                        String::from(owned_key),
                                                                        owned_value_as_value,
                                                                    );
                                                                } else if test_split.eq("admin") {
                                                                    admin_object.insert(
                                                                        String::from(owned_key),
                                                                        owned_value_as_value,
                                                                    );
                                                                } else if test_split.eq("vu") {
                                                                    vu_object.insert(
                                                                        String::from(owned_key),
                                                                        owned_value_as_value,
                                                                    );
                                                                }
                                                            }
                                                            Err(_) => {
                                                                match test_num.parse::<bool>() {
                                                                    Ok(bool) => {
                                                                        let owned_value_as_value =
                                                                            serde_json::to_value(
                                                                                bool,
                                                                            )
                                                                            .unwrap();

                                                                        if test_split.eq("vars") {
                                                                            vars_object.insert(
                                                                                    String::from(owned_key),
                                                                                    owned_value_as_value,
                                                                                );
                                                                        } else if test_split
                                                                            .eq("admin")
                                                                        {
                                                                            admin_object.insert(
                                                                                    String::from(owned_key),
                                                                                    owned_value_as_value,
                                                                                );
                                                                        } else if test_split
                                                                            .eq("vu")
                                                                        {
                                                                            vu_object.insert(
                                                                                    String::from(owned_key),
                                                                                    owned_value_as_value,
                                                                                );
                                                                        }
                                                                    }
                                                                    Err(_) => {
                                                                        let owned_value_as_value =
                                                                            serde_json::to_value(
                                                                                owned_value,
                                                                            )
                                                                            .unwrap();

                                                                        if test_split.eq("vars") {
                                                                            vars_object.insert(
                                                                                    String::from(owned_key),
                                                                                    owned_value_as_value,
                                                                                );
                                                                        } else if test_split
                                                                            .eq("admin")
                                                                        {
                                                                            admin_object.insert(
                                                                                    String::from(owned_key),
                                                                                    owned_value_as_value,
                                                                                );
                                                                        } else if test_split
                                                                            .eq("vu")
                                                                        {
                                                                            vu_object.insert(
                                                                                    String::from(owned_key),
                                                                                    owned_value_as_value,
                                                                                );
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    None => {}
                                                };
                                            }
                                            None => {}
                                        }
                                    }
                                    None => {}
                                };
                            }
                            None => {}
                        }

                        // vars_object.insert(splits.get(0), splits.get(1));
                    } else if len == 3 {
                        // there is some decimal value?
                        match splits.get(0) {
                            Some(split_info) => {
                                // let key = split_info.to_string();

                                match splits.get(1) {
                                    Some(split_val) => {
                                        let second_split: Vec<&str> =
                                            split_val.split(" ").collect();
                                        match second_split.get(0) {
                                            Some(key) => {
                                                let owned_key = key.to_owned();

                                                match second_split.get(1) {
                                                    Some(value) => {
                                                        let owned_value_part_one = value.to_owned();

                                                        match splits.get(2) {
                                                            Some(value_second_half) => {
                                                                let owned_value_part_two =
                                                                    value_second_half.to_owned();

                                                                let mut combined_owned_value =
                                                                    String::new();
                                                                combined_owned_value
                                                                    .push_str(owned_value_part_one);
                                                                combined_owned_value.push_str(".");
                                                                combined_owned_value
                                                                    .push_str(owned_value_part_two);

                                                                let decimal_value =
                                                                    combined_owned_value
                                                                        .parse::<f64>()
                                                                        .unwrap();

                                                                let owned_value_as_value =
                                                                    serde_json::to_value(
                                                                        decimal_value,
                                                                    )
                                                                    .unwrap();

                                                                vars_object.insert(
                                                                    String::from(owned_key),
                                                                    owned_value_as_value,
                                                                );
                                                            }
                                                            None => {}
                                                        }
                                                    }
                                                    None => {}
                                                };
                                            }
                                            None => {}
                                        }
                                    }
                                    None => {}
                                };
                            }
                            None => {}
                        }
                    }
                }
            }
        }
        Err(err) => {
            println!("Failed to read startup.txt due to error:\n{:?}", err);
        }
    };

    println!("{:?}", vars_object);
    println!("{:?}", admin_object);
    println!("{:?}", vu_object);
}

pub fn write_to_txt_from_loadout(loadout_name: &String) -> io::Result<bool> {
    let loadout = get_loadout_json_as_struct(&loadout_name)?;
    let admin_path = get_loadout_admin_path(&loadout_name);

    let mut startup_path = admin_path.clone();
    startup_path.push("startup.txt");
    let mut maplist_path = admin_path.clone();
    maplist_path.push("maplist.txt");
    let mut banlist_path = admin_path.clone();
    banlist_path.push("banlist.txt");
    let mut modlist_path = admin_path.clone();
    modlist_path.push("modlist.txt");

    let startup_vec = get_startup_as_string_array(&loadout);
    let maplist_vec = get_maplist_as_string_array(&loadout);
    let banlist_vec = &loadout.banlist.clone();
    let modlist_vec = &loadout.modlist;
    // TODO: make sure modlist is of pure names...

    write(startup_path, startup_vec.join("\n"))?;
    write(maplist_path, maplist_vec.join("\n"))?;
    write(banlist_path, banlist_vec.join("\n"))?;
    write(modlist_path, modlist_vec.join("\n"))?;

    Ok(true)
}

fn build_string(prefix: &String, key: &String, value: &String) -> String {
    let mut temp_string = String::new();
    temp_string.push_str(&prefix);
    temp_string.push_str(".");
    temp_string.push_str(key);
    temp_string.push_str(" ");
    temp_string.push_str(value);
    temp_string
}

fn make_txt_ready(res: Result<Value, Error>, prefix: String) -> Vec<String> {
    let mut string_vec: Vec<String> = Vec::new();
    match res {
        Ok(values) => {
            match values.as_object() {
                Some(values_as_object) => {
                    for (key, value) in values_as_object {
                        let mut parsed_key = String::new();
                        if key.contains("_") {
                            parsed_key.push_str(key.strip_prefix("_").unwrap());
                        } else {
                            parsed_key.push_str(key);
                        }

                        if value.is_number() {
                            match value.as_number() {
                                Some(num) => {
                                    string_vec.push(build_string(
                                        &prefix,
                                        &parsed_key,
                                        &num.to_string(),
                                    ));
                                }
                                None => {}
                            }
                        } else if value.is_boolean() {
                            match value.as_bool() {
                                Some(bool_val) => {
                                    if bool_val {
                                        string_vec.push(build_string(
                                            &prefix,
                                            &parsed_key,
                                            &"true".to_string(),
                                        ));
                                    } else {
                                        string_vec.push(build_string(
                                            &prefix,
                                            &parsed_key,
                                            &"false".to_string(),
                                        ));
                                    }
                                }
                                None => {}
                            }
                        } else if value.is_string() {
                            match value.as_str() {
                                Some(str) => {
                                    string_vec.push(build_string(
                                        &prefix,
                                        &parsed_key,
                                        &str.to_string(),
                                    ));
                                }
                                None => {}
                            }
                        } else if value.is_array() {
                            // TODO: handle the array for reservedSlots, setDevelopers, setAdmins, etc...
                        }
                    }
                }
                None => {}
            };
        }
        Err(_) => {}
    }

    string_vec
}

fn get_startup_as_string_array(loadout: &LoadoutJson) -> Vec<String> {
    let mut all_args: Vec<String> = Vec::new();
    let vars = serde_json::to_value(&loadout.startup.vars);
    let rm = serde_json::to_value(&loadout.startup.RM);
    let admin = serde_json::to_value(&loadout.startup.admin);
    let vu = serde_json::to_value(&loadout.startup.vu);
    let reserved_slots = serde_json::to_value(&loadout.startup.reservedSlots);

    let mut vars_info = make_txt_ready(vars, String::from("vars"));
    let mut rm_info = make_txt_ready(rm, String::from("RM"));
    let mut admin_info = make_txt_ready(admin, String::from("admin"));
    let mut vu_info = make_txt_ready(vu, String::from("vu"));
    let mut reserved_slots_info = make_txt_ready(reserved_slots, String::from("reservedSlots"));

    all_args.append(&mut vars_info);
    all_args.append(&mut rm_info);
    all_args.append(&mut admin_info);
    all_args.append(&mut vu_info);
    all_args.append(&mut reserved_slots_info);

    all_args
}

fn get_maplist_as_string_array(loadout: &LoadoutJson) -> Vec<String> {
    let maplist = &loadout.maplist;

    let mut string_vec = Vec::new();

    for map in maplist {
        let mut temp_str = String::new();
        temp_str.push_str(&map.mapCode);
        temp_str.push_str(" ");
        temp_str.push_str(&map.gameMode);
        temp_str.push_str(" 1");
        string_vec.push(temp_str);
    }

    string_vec
}

#[tauri::command]
pub fn get_all_loadout_json() -> Vec<LoadoutJson> {
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
                                    import_startup_txt_into_loadout(&loadout_name);
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
