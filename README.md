# Unofficial VU Launcher
![image](https://github.com/user-attachments/assets/b5bec60c-8693-4bce-a454-bed41ec6ca50)
## What?
A launcher for Battlefield 3: Venice Unleashed, made with Tauri.
### Features:
- Install VU
- Install mods to `mod-cache` folder thru drag n drop of zip folders
- Easier first-time server setup
- Server Loadouts
  - Example: loadout1 is setup for mapediting on karkand. loadout2 is setup for funbots on sharqi.
  - Server config is done through a form.
  - Mods are installed from `mod-cache` by clicking checkboxes
  - Mods automatically rename their folders using `mod.json` when installing to a loadout
  - `modlist.txt` updates based on selected mods
  - Loadouts buttons for
    - Loadout edit / delete / view in explorer
    - Start server / server + account0 / server + selected accounts
    - View mods in loadout
- Mods have an "open in vscode" button, which prioritizes workspaces.
- Show links to github/forums/discord to find mods
- Import server loadouts
- Store VU credentials for auto-login (plaintext currently)
- Store VU server GUID / password for auto-join
## Why?
Trying to learn Tauri/React and I want to make it easier to use Venice Unleashed.
Some QoL improvements that I wanted:
- Easier installation of mods
- Easier configuration of server
- Easier swapping between server configurations (loadouts)
- Easier adding of launch arguments including auto login, auto server join, etc
## Installation
### Prerequisites
- Battlefield 3
- Windows

Go to the releases section and get the latest `.exe` file.
Alternatively download the source code and build it yourself.
## Feedback
If you want to report a bug or request a feature/change do this in the Issues section.
Please label them as:
- [Bug] relevant info here
- [Req] your request here
