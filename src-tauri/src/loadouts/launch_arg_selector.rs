use crate::loadouts::loadout_structs::{
    ClientLaunchArguments, CommonLaunchArguments, ServerLaunchArguments,
};

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
