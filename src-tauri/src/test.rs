#[cfg(test)]
use test_env_helpers::*;

#[before_all]
#[cfg(test)]
mod tests {
    use dirs_next::cache_dir;
    use serde_json;
    use std::fs;

    use crate::{
        first_time_setup,
        loadouts::{
            get_loadout_admin_path,
            loadout_modification::create_loadout,
            loadout_structs::{LaunchArguments, LoadoutJson, Map, StartupArgs},
        },
        preferences::preference_structs::UserPreferences,
    };

    fn before_all() {
        delete_vu_launcher_dev();
    }

    fn delete_vu_launcher_dev() {
        let mut vu_launcher_dev_path = cache_dir().unwrap();
        vu_launcher_dev_path.push("vu-launcher-dev");
        if vu_launcher_dev_path.exists() {
            println!("Deleting from path: {:?}", &vu_launcher_dev_path);
            fs::remove_dir_all(&vu_launcher_dev_path);
        }
        if vu_launcher_dev_path.exists() {
            println!("Deletion failed");
        } else {
            println!("Deletion succeeded");
        }
    }

    #[test]
    fn test_0_confirm_beforeAll_Setup() {
        // confirm that beforeAll setup was successful

        let mut vu_launcher_dev_path = cache_dir().unwrap();
        vu_launcher_dev_path.push("vu-launcher-dev");

        assert_eq!(vu_launcher_dev_path.exists(), false);
    }

    #[test]
    fn test_1_it_creates_vu_launcher_dev() {
        // it should create vu-launcher-dev with settings.json inside on first time setup

        let mut settings_json_path = cache_dir().unwrap();
        settings_json_path.push("vu-launcher-dev");
        settings_json_path.push("settings.json");

        first_time_setup();

        assert_eq!(settings_json_path.exists(), true);
    }

    #[test]
    fn test_2_it_creates_valid_settings_json() {
        // settings json must be readable by Serde

        let mut settings_json_path = cache_dir().unwrap();
        settings_json_path.push("vu-launcher-dev");
        settings_json_path.push("settings.json");

        let string = fs::read_to_string(&settings_json_path).unwrap();

        let json: UserPreferences = serde_json::from_str(&string).unwrap();
        assert_eq!(json.is_onboarded, false);
        assert_eq!(json.last_visted_route, "");
        assert_eq!(json.use_dev_branch, false);
        assert_eq!(json.automatically_check_for_updates, false);
        assert_eq!(json.automatically_install_update_if_found, false);
    }

    #[tokio::test]
    async fn test_3_loadout_creation_creates_main_folder() {
        let mut default_loadout = LoadoutJson::default();
        default_loadout.name = String::from("TestLoadout");

        let mut loadout_folder_name = cache_dir().unwrap();
        loadout_folder_name.push("vu-launcher-dev");
        loadout_folder_name.push("loadouts");
        loadout_folder_name.push(&default_loadout.name);

        let _ = create_loadout(default_loadout).await;

        assert_eq!(loadout_folder_name.exists(), true);
    }

    #[tokio::test]
    async fn test_4_duplicate_loadout_creation_throws_error() {
        let mut default_loadout = LoadoutJson::default();
        default_loadout.name = String::from("TestLoadout");

        let mut loadout_folder_name = cache_dir().unwrap();
        loadout_folder_name.push("vu-launcher-dev");
        loadout_folder_name.push("loadouts");
        loadout_folder_name.push(&default_loadout.name);

        assert_eq!(create_loadout(default_loadout).await.is_err(), true)
    }
}
