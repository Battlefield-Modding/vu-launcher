use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct UserPreferences {
    pub is_sidebar_enabled: bool,
    pub venice_unleashed_shortcut_location: String,
    pub dev_venice_unleashed_shortcut_location: String,
    pub usernames: Vec<String>,
    pub servers: Vec<Server>,
    pub server_guid: String,
    pub show_multiple_account_join: bool,
    pub is_onboarded: bool,
    pub use_dev_branch: bool,
    pub preferred_player_index: i32,
    pub preferred_server_index: i32,
    pub last_visted_route: String,
    pub automatically_check_for_updates: bool,
    pub automatically_install_update_if_found: bool,
}

impl UserPreferences {
    pub fn default() -> Self {
        UserPreferences {
            is_sidebar_enabled: false,
            venice_unleashed_shortcut_location: String::from(""),
            dev_venice_unleashed_shortcut_location: String::from(""),
            usernames: Vec::new(),
            servers: Vec::new(),
            server_guid: String::from(""),
            show_multiple_account_join: false,
            is_onboarded: false,
            use_dev_branch: false,
            preferred_player_index: 9001,
            preferred_server_index: 9001,
            last_visted_route: String::from(""),
            automatically_check_for_updates: false,
            automatically_install_update_if_found: false,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct OptionalUserPreferences {
    pub is_sidebar_enabled: Option<bool>,
    pub venice_unleashed_shortcut_location: Option<String>,
    pub dev_venice_unleashed_shortcut_location: Option<String>,
    pub usernames: Option<Vec<String>>,
    pub servers: Option<Vec<Server>>,
    pub server_guid: Option<String>,
    pub show_multiple_account_join: Option<bool>,
    pub is_onboarded: Option<bool>,
    pub use_dev_branch: Option<bool>,
    pub preferred_player_index: Option<i32>,
    pub preferred_server_index: Option<i32>,
    pub last_visted_route: Option<String>,
    pub automatically_check_for_updates: Option<bool>,
    pub automatically_install_update_if_found: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Server {
    pub nickname: String,
    pub guid: String,
    pub password: String,
}
