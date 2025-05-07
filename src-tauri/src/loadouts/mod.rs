use std::{
    f64,
    fs::{self, read_dir, read_to_string, write},
    io::{self},
    ops::Index,
    path::PathBuf,
};

use loadout_structs::{
    Admin, ClientLaunchArguments, CommonLaunchArguments, GameMod, LaunchArguments, LoadoutJson,
    Map, ModJson, ParsedStartupTxtLine, RM_Commands, ServerLaunchArguments, SetTeamTicketCount,
    StartupArgs, VU_Commands, Vars,
};
use serde_json::Value;
use serde_json::{to_value, Error};

use crate::{
    get_user_preferences_as_struct,
    servers::{get_loadout_admin_path, get_loadout_path, get_loadouts_path},
};

pub mod loadout_structs;

pub fn get_loadout_json_as_struct(loadout_name: &String) -> io::Result<LoadoutJson> {
    let mut path_to_loadout_json = get_loadout_path(&loadout_name);
    path_to_loadout_json.push("loadout.json");
    let json_info = read_to_string(&path_to_loadout_json)?;
    let loadout_struct: LoadoutJson = serde_json::from_str(&json_info)?;
    Ok(loadout_struct)
}

fn convert_loadout_json_to_string(loadout: &LoadoutJson) -> io::Result<String> {
    let loadout_string = serde_json::to_string_pretty(loadout)?;
    Ok(loadout_string)
}

pub fn write_loadout_json(loadout: &LoadoutJson) -> io::Result<bool> {
    let mut path_to_loadout_json = get_loadout_path(&loadout.name);
    path_to_loadout_json.push("loadout.json");

    let loadout_json_string = convert_loadout_json_to_string(&loadout)?;

    write(&path_to_loadout_json, loadout_json_string)?;

    Ok(true)
}

#[tauri::command]
pub fn refresh_loadout(loadout_name: String) -> bool {
    // this function will write loadout json again
    match write_to_txt_from_loadout(&loadout_name) {
        Ok(status) => return status,
        Err(err) => {
            println!(
                "Failed to write to txt from loadout when refreshing due to error:\n{:?}",
                err
            );
            return false;
        }
    };
}

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

fn make_loadout_json_from_txt_files(loadout_name: &String) -> io::Result<bool> {
    let startup_args = import_startup_txt_into_loadout(&loadout_name)?;
    let maplist_args = match import_maplist_txt_into_loadout(&loadout_name) {
        Ok(info) => info,
        Err(_) => {
            let empty_vec: Vec<Map> = Vec::new();
            empty_vec
        }
    };
    let banlist_args = match import_banlist_txt_into_loadout(&loadout_name) {
        Ok(info) => info,
        Err(_) => {
            let empty_vec: Vec<String> = Vec::new();
            empty_vec
        }
    };
    let modlist_args = match import_modlist_txt_into_loadout(&loadout_name) {
        Ok(info) => info,
        Err(_) => {
            let empty_vec = Vec::new();
            empty_vec
        }
    };

    let mut loadout_path = get_loadouts_path();
    loadout_path.push(&loadout_name);
    loadout_path.push("Server");

    let mut launch_args = LaunchArguments::default();

    launch_args.server.serverInstancePath = Some(String::from(loadout_path.to_str().unwrap()));

    let loadout_json = LoadoutJson {
        name: String::from(loadout_name),
        startup: startup_args,
        launch: launch_args,
        maplist: maplist_args,
        banlist: banlist_args,
        modlist: modlist_args,
    };

    write_loadout_json(&loadout_json)?;
    write_to_txt_from_loadout(loadout_name)?;

    Ok(true)
}

fn import_modlist_txt_into_loadout(loadout_name: &String) -> io::Result<Vec<GameMod>> {
    let mut modlist_txt_path = get_loadout_admin_path(loadout_name);
    modlist_txt_path.push("modlist.txt");

    let mut mods = get_all_mod_json_in_loadout(loadout_name);

    match read_to_string(modlist_txt_path) {
        Ok(info) => {
            for item in info.split("\n") {
                if item.starts_with("#") {
                    continue;
                }

                let index_of_mod = mods
                    .iter()
                    .position(|game_mod| game_mod.name.to_lowercase().eq(&item.to_lowercase()))
                    .unwrap();

                mods[index_of_mod].enabled = true;
            }
        }
        Err(err) => {
            println!("Failed to read modlist.txt due to error:\n{:?}", err);
        }
    };

    Ok(mods)
}

pub fn get_all_mod_json_in_loadout(loadout_name: &String) -> Vec<GameMod> {
    let mut loadout_path = get_loadouts_path();
    loadout_path.push(&loadout_name);
    loadout_path.push("Server");
    loadout_path.push("Admin");
    loadout_path.push("Mods");

    let dir_reader = fs::read_dir(&loadout_path);
    let mut mod_data: Vec<GameMod> = Vec::new();
    match dir_reader {
        Ok(reader) => {
            reader.for_each(|item| {
                match item {
                    Ok(info) => {
                        match info.path().is_dir() {
                            true => {
                                let mut path_to_mod_json = info.path().clone();
                                path_to_mod_json.push("mod.json");

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
                                                mod_data.push(mod_info);
                                            }
                                            Err(err) => {
                                                println!(
                                                    "Failed to read Game Mod due to error:\n{:?}",
                                                    err
                                                );
                                            }
                                        }
                                    }
                                    Err(_) => {
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
    mod_data
}

fn import_banlist_txt_into_loadout(loadout_name: &String) -> io::Result<Vec<String>> {
    let mut banlist_txt_path = get_loadout_admin_path(loadout_name);
    banlist_txt_path.push("banlist.txt");

    let mut banlist_vec: Vec<String> = Vec::new();

    match read_to_string(banlist_txt_path) {
        Ok(info) => {
            for string in info.split("\n") {
                let mut characters = string.chars().peekable();

                let mut is_first_char = true;
                let mut temp_str = String::new();

                while let Some(character) = characters.next() {
                    if is_first_char {
                        // if invalid first character go to next string
                        if character == '#' || character == '\n' || character == ' ' {
                            break;
                        }
                        is_first_char = false;
                    }
                    if character == '#' {
                        banlist_vec.push(temp_str.trim().to_owned());
                        break;
                    } else if character == '\"' {
                        // do nothing with quotes for now?
                    } else {
                        temp_str.push(character);
                    }
                    if characters.peek().is_none() {
                        banlist_vec.push(temp_str.trim().to_owned());
                        break;
                    }
                }
            }
        }
        Err(err) => {
            println!("Failed to read banlist.txt due to error:\n{:?}", err);
        }
    };

    Ok(banlist_vec)
}

fn import_maplist_txt_into_loadout(loadout_name: &String) -> io::Result<Vec<Map>> {
    let mut maplist_txt_path = get_loadout_admin_path(loadout_name);
    maplist_txt_path.push("maplist.txt");

    let mut maps_vec: Vec<Map> = Vec::new();

    match read_to_string(maplist_txt_path) {
        Ok(info) => {
            let string_vec = info.split("\n");

            for string in string_vec.into_iter() {
                let mut characters = string.chars().peekable();

                let mut is_first_char = true;
                let mut temp_str = String::new();
                let mut is_first_space = true;
                let mut map_code = String::new();
                let mut game_mode = String::new();

                while let Some(character) = characters.next() {
                    if is_first_char {
                        // if invalid first character go to next string
                        if character == '#' || character == '\n' || character == ' ' {
                            break;
                        }
                        is_first_char = false;
                    }
                    if character == ' ' {
                        if is_first_space {
                            map_code.push_str(&temp_str);
                            is_first_space = false;
                            temp_str.clear();
                        } else {
                            game_mode.push_str(&temp_str);
                            maps_vec.push(Map {
                                mapCode: map_code,
                                gameMode: game_mode,
                            });
                            break;
                        }
                    } else {
                        temp_str.push(character);
                    }
                }
            }
        }

        Err(err) => {
            println!("Failed to read maplist.txt due to error:\n{:?}", err);
        }
    };

    Ok(maps_vec)
}

fn import_startup_txt_into_loadout(loadout_name: &String) -> io::Result<StartupArgs> {
    let mut startup_txt_path = get_loadout_admin_path(loadout_name);
    startup_txt_path.push("startup.txt");

    let startup: StartupArgs = StartupArgs::default();

    let vu_initial = serde_json::to_value(startup.vu).unwrap();
    let mut vu_object = vu_initial.as_object().unwrap().to_owned();
    let admin_initial = serde_json::to_value(startup.admin).unwrap();
    let mut admin_object = admin_initial.as_object().unwrap().to_owned();
    let vars_initial = serde_json::to_value(startup.vars).unwrap();
    let mut vars_object = vars_initial.as_object().unwrap().to_owned();
    let reserved_slots_initial = serde_json::to_value(startup.reservedSlots).unwrap();
    let mut reserved_slots_object = reserved_slots_initial.as_array().unwrap().to_owned();
    let rm_initial = serde_json::to_value(startup.RM).unwrap();
    let mut rm_object = rm_initial.as_object().unwrap().to_owned();

    let mut args_vec: Vec<ParsedStartupTxtLine> = Vec::new();

    match read_to_string(startup_txt_path) {
        Ok(info) => {
            let string_vec = info.split("\n");

            for string in string_vec.into_iter() {
                let mut characters = string.chars().peekable();

                let mut is_first_char = true;
                let mut temp_str = String::new();
                let mut category = String::new();
                let mut is_first_period = true;
                let mut is_first_space = true;
                let mut past_left_quote = false;

                let mut key: String = String::new();
                let mut value = String::new();

                while let Some(character) = characters.next() {
                    if is_first_char {
                        // if invalid first character go to next string
                        if character == '#' || character == '\n' || character == ' ' {
                            break;
                        }
                        is_first_char = false;
                    }
                    if character == '.' {
                        if is_first_period {
                            category.push_str(&temp_str);
                            is_first_period = false;
                            temp_str.clear();
                        } else {
                            temp_str.push(character);
                        }
                    } else if character == ' ' {
                        if is_first_space {
                            key.push_str(&temp_str);
                            is_first_space = false;
                            temp_str.clear();
                        } else {
                            if key.contains("setAdmins")
                                || key.contains("setLightAdmins")
                                || key.contains("setDevelopers")
                            {
                                if past_left_quote {
                                    // past a leftquote so a space is part of a username
                                    temp_str.push(character)
                                }
                            } else {
                                temp_str.push(character);
                            }
                        }
                    } else if character == '#' {
                        value.push_str(&temp_str.trim());
                        args_vec.push(ParsedStartupTxtLine {
                            category,
                            key,
                            value,
                        });
                        break;
                    } else if character == '\"' {
                        if key.contains("setAdmins")
                            || key.contains("setLightAdmins")
                            || key.contains("setDevelopers")
                        {
                            if past_left_quote {
                                // this would be right quote, store a delimeter
                                temp_str.push_str(",");
                                past_left_quote = false
                            } else {
                                // encountered a new left quote so flag it
                                past_left_quote = true
                            }
                        }
                    } else {
                        // handle 3dSpotting -> _3dSpotting conversion
                        if key.len() == 0 && temp_str.len() == 0 {
                            if character.to_string() == "3".to_string() {
                                temp_str.push_str("_");
                            }
                        }
                        temp_str.push(character);
                    }
                    if characters.peek().is_none() {
                        value.push_str(&temp_str.trim());
                        args_vec.push(ParsedStartupTxtLine {
                            category,
                            key,
                            value,
                        });
                        break;
                    }
                }
            }
        }

        Err(err) => {
            println!("Failed to read startup.txt due to error:\n{:?}", err);
        }
    };

    for arg in args_vec {
        match arg.value.parse::<bool>() {
            Ok(bool) => {
                match serde_json::to_value(bool) {
                    Ok(val) => {
                        if arg.category.eq("vars") {
                            vars_object.insert(arg.key, val);
                        } else if arg.category.eq("admin") {
                            admin_object.insert(arg.key, val);
                        } else if arg.category.eq("vu") {
                            vu_object.insert(arg.key, val);
                        } else if arg.category.eq("RM") {
                            rm_object.insert(arg.key, val);
                        }
                        continue;
                    }
                    Err(err) => {
                        println!("Failed to add key {} due to error:\n{:?}", arg.key, err)
                    }
                };
            }
            Err(_) => {}
        }

        match arg.value.parse::<u32>() {
            Ok(float) => {
                match serde_json::to_value(float) {
                    Ok(val) => {
                        if arg.category.eq("vars") {
                            vars_object.insert(arg.key, val);
                        } else if arg.category.eq("admin") {
                            admin_object.insert(arg.key, val);
                        } else if arg.category.eq("vu") {
                            vu_object.insert(arg.key, val);
                        } else if arg.category.eq("RM") {
                            rm_object.insert(arg.key, val);
                        }
                        continue;
                    }
                    Err(err) => {
                        println!("Failed to add key {} due to error:\n{:?}", arg.key, err)
                    }
                };
            }
            Err(_) => {}
        }

        match arg.value.parse::<f64>() {
            Ok(float) => {
                match serde_json::to_value(float) {
                    Ok(val) => {
                        if arg.category.eq("vars") {
                            vars_object.insert(arg.key, val);
                        } else if arg.category.eq("admin") {
                            admin_object.insert(arg.key, val);
                        } else if arg.category.eq("vu") {
                            vu_object.insert(arg.key, val);
                        } else if arg.category.eq("RM") {
                            rm_object.insert(arg.key, val);
                        }
                        continue;
                    }
                    Err(err) => {
                        println!("Failed to add key {} due to error:\n{:?}", arg.key, err)
                    }
                };
            }
            Err(_) => {}
        }

        if arg.key.eq("SetTeamTicketCount") {
            let mut team_id = String::from("");
            let mut ticket_count = 0;
            for value in arg.value.clone().split(" ") {
                match value.parse::<u64>() {
                    Ok(num) => {
                        ticket_count = num;
                    }
                    Err(_) => {
                        team_id = String::from(value);
                    }
                };
            }
            let team_ticket_object = SetTeamTicketCount {
                teamId: team_id,
                ticketCount: ticket_count,
            };
            match vu_object.get_key_value("SetTeamTicketCount") {
                Some(team_ticket) => {
                    let mut prior_value: Vec<SetTeamTicketCount> =
                        serde_json::from_value(team_ticket.1.to_owned())?;
                    prior_value.push(team_ticket_object);
                    let ticket_val = serde_json::to_value(prior_value)?;
                    vu_object.insert(arg.key, ticket_val);
                    continue;
                }
                None => {
                    let mut my_vec: Vec<SetTeamTicketCount> = Vec::new();
                    my_vec.push(team_ticket_object);
                    let ticket_val = serde_json::to_value(my_vec)?;
                    vu_object.insert(arg.key, ticket_val);
                    continue;
                }
            }
        }

        if arg.key.eq("setDevelopers") || arg.key.eq("setAdmins") || arg.key.eq("setLightAdmins") {
            let mut rm_array_arg = Vec::new();
            for value in arg.value.split(",") {
                if value.len() > 0 {
                    rm_array_arg.push(value);
                }
            }
            let final_val = serde_json::to_value(rm_array_arg)?;
            println!("{:?}", &final_val);
            rm_object.insert(arg.key, final_val);
            continue;
        }

        let str_val = serde_json::to_value(arg.value)?;
        if arg.category.eq("vars") {
            vars_object.insert(arg.key, str_val);
        } else if arg.category.eq("admin") {
            admin_object.insert(arg.key, str_val);
        } else if arg.category.eq("vu") {
            vu_object.insert(arg.key, str_val);
        } else if arg.category.eq("RM") {
            rm_object.insert(arg.key, str_val);
        } else if arg.category.eq("reservedSlots") {
            reserved_slots_object.push(str_val);
        }
        continue;
    }

    let vars_string = serde_json::to_string(&vars_object)?;
    let vars_struct = serde_json::from_str::<Vars>(&vars_string)?;

    let admin_string = serde_json::to_string(&admin_object)?;
    let admin_struct = serde_json::from_str::<Admin>(&admin_string)?;

    let vu_string = serde_json::to_string(&vu_object)?;
    let vu_struct = serde_json::from_str::<VU_Commands>(&vu_string)?;

    let rm_string = serde_json::to_string(&rm_object)?;
    let rm_struct = serde_json::from_str::<RM_Commands>(&rm_string)?;

    let reserved_slots_string = serde_json::to_string(&reserved_slots_object)?;
    let reserved_slots_struct = serde_json::from_str::<Vec<String>>(&reserved_slots_string)?;

    let final_struct = StartupArgs {
        vars: vars_struct,
        admin: admin_struct,
        vu: Some(vu_struct),
        RM: Some(rm_struct),
        reservedSlots: Some(reserved_slots_struct),
    };

    Ok(final_struct)
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
    let modlist_vec = get_modlist_as_string_array(&loadout);
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
                                    let mut final_val = String::from("\"");
                                    final_val.push_str(&str);
                                    final_val.push_str("\"");
                                    string_vec.push(build_string(&prefix, &parsed_key, &final_val));
                                }
                                None => {}
                            }
                        } else if value.is_array() {
                            if prefix.eq("vu") {
                                println!("VU Array Argument found!");

                                println!("{:?}", value);

                                match value.as_array() {
                                    Some(arr) => {
                                        for obj in arr {
                                            let parsed_object = obj.as_object().unwrap();
                                            let mut final_str =
                                                String::from("vu.SetTeamTicketCount ");
                                            let team_id = parsed_object["teamId"].as_str().unwrap();
                                            let ticket_count =
                                                parsed_object["ticketCount"].as_u64().unwrap();
                                            final_str.push_str(&team_id);
                                            final_str.push_str(" ");
                                            final_str.push_str(&ticket_count.to_string());
                                            string_vec.push(final_str);
                                        }
                                    }
                                    None => {
                                        println!(
                                            "Array was empty for VU array argument: {:?}",
                                            &key
                                        );
                                    }
                                }
                            } else if prefix.eq("RM") {
                                println!("RealityMod Array Argument found!");

                                println!("{:?}", value);

                                let mut final_str = String::from("RM.");
                                final_str.push_str(key);
                                final_str.push_str(" ");
                                match value.as_array() {
                                    Some(arr) => {
                                        for name in arr {
                                            // wrap each dev/admin name in quotes
                                            final_str.push_str("\"");
                                            final_str.push_str(name.as_str().unwrap());
                                            final_str.push_str("\" ");
                                        }
                                        string_vec.push(final_str);
                                    }
                                    None => {
                                        println!(
                                            "Array was empty for RealityMod array argument: {:?}",
                                            &key
                                        );
                                    }
                                }
                            }
                            // TODO: handle the array for reservedSlots, setDevelopers, setAdmins, etc...
                        }
                    }
                }
                None => {
                    if values.is_array() {
                        if prefix.eq("reservedSlots") {
                            for str in values.as_array().unwrap() {
                                let parsed_string = str.as_str().unwrap();
                                let mut final_str = String::from("reservedSlots.add ");
                                final_str.push_str("\"");
                                final_str.push_str(parsed_string);
                                final_str.push_str("\"");
                                string_vec.push(final_str);
                            }
                        }
                    }
                }
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

fn get_modlist_as_string_array(loadout: &LoadoutJson) -> Vec<String> {
    let mut simple_mod_vec: Vec<String> = Vec::new();

    loadout.modlist.iter().for_each(|game_mod| {
        if game_mod.enabled {
            simple_mod_vec.push(String::from(game_mod.name.clone()))
        }
    });

    simple_mod_vec
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
                                    match make_loadout_json_from_txt_files(&loadout_name){
                                        Ok(_)=>{
                                            println!("Successfully made loadout JSON from txt files.");

                                            if has_loadout_json(&info.path()){
                                                match get_loadout_json_as_struct(&loadout_name){
                                                    Ok(loadout) => {
                                                        loadouts.push(loadout);
                                                    },
                                                    Err(err) => {
                                                        println!("Failed to get loadout json for {} due to error: \n{:?}", loadout_name, err);
                                                    }
                                                }
                                            }
                                        },
                                        Err(err) => {
                                            println!("Failed to create loadout JSON from txt files due to error:\n{:?}", err);
                                        }
                                    };
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

pub fn loadout_common_launch_args_to_vec(common: &CommonLaunchArguments) -> Vec<&str> {
    let mut args = Vec::new();

    match &common.cacert {
        Some(info) => {
            if !info.eq("") {
                args.push("-cacert");
                args.push(info);
            }
        }
        None => {}
    };
    match common.console {
        Some(info) => {
            if info {
                args.push("-console");
            }
        }
        None => {}
    };
    match common.debuglog {
        Some(info) => {
            if info {
                args.push("-debuglog");
            }
        }
        None => {}
    };
    match &common.env {
        Some(info) => {
            if !info.eq("") {
                args.push("-env");
                args.push(info);
            }
        }
        None => {}
    };
    match &common.gamepath {
        Some(info) => {
            if !info.eq("") {
                args.push("-gamepath");
                args.push(info);
            }
            println!("{:?}", info)
        }
        None => {}
    };
    match common.perftrace {
        Some(info) => {
            if info {
                args.push("-perftrace");
            }
        }
        None => {}
    };
    match common.trace {
        Some(info) => {
            if info {
                args.push("-trace");
            }
        }
        None => {}
    };
    match common.tracedc {
        Some(info) => {
            if info {
                args.push("-tracedc");
            }
        }
        None => {}
    };
    // only override the updatebranch if using a custom gamepath
    if &common.gamepath != &Some(String::from("")) {
        match &common.updateBranch {
            Some(info) => {
                if !info.eq("") {
                    args.push("-updateBranch");
                    args.push(info);
                }
            }
            None => {}
        };
    }
    match &common.vextdebug {
        Some(info) => {
            if !info.eq("") {
                args.push("-vextdebug");
                args.push(info);
            }
        }
        None => {}
    };
    match common.vexttrace {
        Some(info) => {
            if info {
                args.push("-vexttrace");
            }
        }
        None => {}
    };

    args
}

pub fn loadout_client_launch_args_to_vec(client: &ClientLaunchArguments) -> Vec<&str> {
    let mut args: Vec<&str> = Vec::new();

    match client.cefdebug {
        Some(info) => {
            if info {
                args.push("-cefdebug");
            }
        }
        None => {}
    };
    match client.disableUiHwAcceleration {
        Some(info) => {
            if info {
                args.push("-disableUiHwAcceleration");
            }
        }
        None => {}
    };
    match client.dwebui {
        Some(info) => {
            if info {
                args.push("-dwebui");
            }
        }
        None => {}
    };
    match &client.serverJoinString {
        Some(info) => {
            if !info.eq("") {
                args.push(info);
            }
        }
        None => {}
    };
    match &client.serverSpectateString {
        Some(info) => {
            if !info.eq("") {
                args.push(info);
            }
        }
        None => {}
    };

    args
}

pub fn loadout_server_launch_args_to_vec(server: &ServerLaunchArguments) -> Vec<&str> {
    let mut args: Vec<&str> = Vec::new();

    match server.disableTerrainInterpolation {
        Some(info) => {
            if info {
                args.push("-disableTerrainInterpolation");
            }
        }
        None => {}
    };
    match server.headless {
        Some(info) => {
            if info {
                args.push("-headless");
            }
        }
        None => {}
    };
    match server.high120 {
        Some(info) => {
            if info {
                args.push("-high120");
            }
        }
        None => {}
    };
    match server.high60 {
        Some(info) => {
            if info {
                args.push("-high60");
            }
        }
        None => {}
    };
    match server.highResTerrain {
        Some(info) => {
            if info {
                args.push("-highResTerrain");
            }
        }
        None => {}
    };
    match &server.joinaddr {
        Some(info) => {
            if !info.eq("") {
                args.push("-joinaddr");
                args.push(&info)
            }
        }
        None => {}
    };
    match &server.joinhost {
        Some(info) => {
            if !info.eq("") {
                args.push("-joinhost");
                args.push(info)
            }
        }
        None => {}
    };
    match &server.listen {
        Some(info) => {
            if !info.eq("") {
                args.push("-listen");
                args.push(info)
            }
        }
        None => {}
    };
    match &server.mHarmonyPort {
        Some(info) => {
            if !info.eq("") {
                args.push("-mHarmonyPort");
                args.push(info)
            }
        }
        None => {}
    };
    // match server.maxPlayers {
    //     Some(info) => {
    //         if info > 0 {
    //             args.push("-maxPlayers");
    //             args.push(info);
    //         }
    //         println!("{:?}", info)
    //     }
    //     None => {}
    // };
    match server.noUpdate {
        Some(info) => {
            if info {
                args.push("-noUpdate");
            }
        }
        None => {}
    };
    match &server.remoteAdminPort {
        Some(info) => {
            if !info.eq("") {
                args.push("-remoteAdminPort");
                args.push(info)
            }
        }
        None => {}
    };
    match &server.serverInstancePath {
        Some(info) => {
            if !info.eq("") {
                args.push("-serverInstancePath");
                args.push(info)
            }
        }
        None => {}
    };
    match server.skipChecksum {
        Some(info) => {
            if info {
                args.push("-skipChecksum");
            }
        }
        None => {}
    };
    match server.unlisted {
        Some(info) => {
            if info {
                args.push("-unlisted");
            }
        }
        None => {}
    };

    args
}
