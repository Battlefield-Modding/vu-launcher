import { TranslationObject } from './English'

export const GermanTranslations: TranslationObject = {
  startupDescriptions: {
    admin: {
      password: 'RCON-Passwort für Procon festlegen',
    },
    vars: {
      ranked: 'Rangliste aktivieren',
      serverName: 'Servername festlegen',
      gamePassword: 'Passwort für Serverbeitritt festlegen',
      autoBalance: 'Autobalance aktivieren',
      roundStartPlayerCount: 'Mindestanzahl an Spielern für Vorrunde/während der Runde festlegen',
      roundRestartPlayerCount: 'Mindestanzahl an Spielern für Aufwärmphase festlegen',
      roundLockdownCountdown: 'Dauer vor der Runde festlegen',
      serverMessage: 'Server-Begrüßungsnachricht festlegen',
      friendlyFire: 'Teamschaden aktivieren',
      maxPlayers: 'Maximale Spieleranzahl festlegen',
      serverDescription: 'Serverbeschreibung festlegen',
      killCam: 'Killcam aktivieren',
      miniMap: 'Minikarte aktivieren',
      hud: 'HUD aktivieren',
      crossHair: 'Fadenkreuz für alle Waffen aktivieren',
      _3dSpotting: '3D-Markierungen über entdeckten Gegnern aktivieren',
      miniMapSpotting: 'Erkannte Gegner auf der Minikarte aktivieren',
      nameTag: 'Namensschilder aktivieren',
      _3pCam: 'Third-Person-Fahrzeugkamera aktivieren',
      regenerateHealth: 'Gesundheitsregeneration aktivieren',
      teamKillCountForKick: 'Anzahl der erlaubten Teamkills pro Runde festlegen',
      teamKillValueForKick: 'Maximale Kill-Zahl eines Spielers festlegen, bevor er gekickt wird',
      teamKillValuelncrease: 'Kill-Zahl-Erhöhung für Teamkills festlegen',
      teamKillValueDecreasePerSecond: 'Kill-Zahl-Verringerung pro Sekunde festlegen',
      teamKillKickForBan: 'Anzahl der Teamkill-Kicks festlegen das führt zu einem dauerhaften Bann',
      idleTimeout: 'Leerlauf-Timeout festlegen',
      idleBanRounds:
        'Festlegen, wie viele Runden das Leerlauf-Timeout sperren soll (falls überhaupt)',
      vehicleSpawnAllowed: 'Fahrzeuge spawnen lassen',
      vehicleSpawnDelay: 'Skalierungsfaktor für Fahrzeug-Spawnverzögerung festlegen',
      soldierHealth: 'Skalierungsfaktor für maximale Gesundheit von Soldaten festlegen',
      playerRespawnTime: 'Skalierungsfaktor für Spieler-Respawnzeit festlegen',
      playerManDownTime: 'Skalierungsfaktor für Spieler-Man-Down-Zeit festlegen',
      bulletDamage: 'Skalierungsfaktor für Geschossschaden festlegen',
      gameModeCounter: 'Skalierungsfaktor für Ticketanzahl zum Rundenende festlegen',
      onlySquadLeaderSpawn: 'Spawns von Truppmitgliedern außer Truppführer deaktivieren',
      // unlockMode: "Waffen und Gadgets auf einem Server ohne Rangliste verfügbar machen",
    },
    RM: {
      setDevelopers: 'Entwicklerliste festlegen, durch Leerzeichen getrennt',
      setAdmins: 'Administratorliste festlegen, durch Leerzeichen getrennt',
      setLightAdmins: 'Light-Administratorliste festlegen, durch Leerzeichen getrennt',
      serverInfo: 'Serverbeschreibung',
      serverLicenseKey: 'RM-Server-Lizenzschlüssel',
      ingameBanner: 'Bildlink',
      pingLimitEnable: 'Ping-Limit aktivieren',
      pingLimitInMs: 'Zeit in ms',
      autoPerfEnabled: 'Auto-Performance aktivieren',
      autoPerfMaxPlayers: 'Abschaltzeit für Auto-Performance',
      tempReservedSlotsEnabled: 'Automatisches Wiederbeitreten aktivieren',
      tempReservedSlotsRejoinTime: 'Wie lange dauert es, bis das Wiederbeitreten aufgehoben wird',
      defaultPreRoundTime: 'Zeit bis Rundenbeginn',
      setAutoBalancer: 'Autobalance',
      battleCryLink: 'Link zu deinem Battlecry-JSON-Endpunkt',
    },
    vu: {
      ColorCorrectionEnabled: 'Blaufilter aktivieren',
      DesertingAllowed: 'Außerhalb der Grenzen deaktivieren',
      DestructionEnabled: 'Zerstörung aktivieren',
      HighPerformanceReplication: 'Hochleistungsupdates für weit entfernte Spieler aktivieren',
      ServerBanner: 'Browser-Banner-URL auf 1378 x 162 JPG festlegen',
      SetTeamTicketCount: 'Teamticketanzahl für ein Team festlegen',
      SquadSize: 'Maximale Spieleranzahl pro Trupp festlegen',
      SunFlareEnabled: 'Sonneneruption aktivieren',
      SuppressionMultiplier: 'Unterdrückungsintensität [0, unendlich] festlegen',
      FriendlyFireSuppression: 'Unterdrückung von Verbündeten aktivieren',
      TimeScale: 'Spiel verlangsamen oder beschleunigen [0,0, 2,0]',
      VehicleDisablingEnabled: 'Mobilitätstreffer für Fahrzeuge aktivieren',
      HttpAssetUrl: 'URL auf Remote [ui.vuic] festlegen, anstatt vom Spielserver herunterzuladen',
      DisablePreRound: 'Warten auf Spieler deaktivieren',
      TeamActivatedMines: 'Minenauslösung bei Verbündeten aktivieren',
      CorpseDamageEnabled: 'Leichenschaden aktivieren, um Wiederbelebungen zu verhindern',
    },
    reservedSlots: {
      add: 'Liste der Spieler, die dem reservierten Slot hinzugefügt werden sollen, durch Komma getrennt',
    },
  },
  launchArgumentDescriptions: {
    common: {
      gamepath: 'Benutzerdefiniertes Battlefield 3-Installationsverzeichnis festlegen.',
      perftrace: 'Leistungsprotokollierung aktivieren (perftrace-[server|client].csv).',
      env: 'Zeus-Umgebung festlegen. Standardmäßig „prod“.',
      updateBranch: 'Update-Branch festlegen. Standardmäßig „-env“ festlegen.',
      tracedc:
        'DataContainer-Trace-Nutzung in VEXT aktivieren und alle nicht ausstehenden Domänencontroller während der Level-Demonstration ausgeben.',
      cacert: 'Benutzerdefiniertes CA-Zertifikatpaket für die SSL-Verifizierung festlegen.',
      activateWithOrigin:
        '-activate -o_mail <E-Mail> -o_pass <Passwort> Aktiviert BF3 auf dem aktuellen Rechner mit den angegebenen Origin-Anmeldedaten.',
      activateWithLSX:
        '-activate -lsx Aktiviert BF3 auf dem aktuellen Rechner mit der EA-App/Origin (LSX). Diese muss ausgeführt werden und mit einem Konto angemeldet sein, das BF3 besitzt. Außerdem wird das von der EA-App abgerufene Authentifizierungstoken ausgegeben.',
      activateWithEaToken:
        '-activate -ea_token <Token> Aktiviert BF3 auf dem aktuellen Rechner mit dem bereitgestellten EA-Authentifizierungstoken. Das Token kann mit dem obigen Befehl von einem anderen Rechner abgerufen werden. Beachten Sie, dass Token ablaufen.',
      console: 'Aktivieren Sie das externe Konsolenfenster für die Debug-Protokollierung.',
      debuglog:
        'Aktivieren Sie die Protokollierung. Serverprotokolle befinden sich im Serverinstanzverzeichnis. Clientprotokolle befinden sich im VU AppData-Installationsordner.',
      trace: 'Aktivieren Sie die ausführliche Protokollierung.',
      vextdebug:
        'Legen Sie Host:Port für VEXT-Remote-Debugging fest (dies funktioniert derzeit nicht). Dies verhindert außerdem Timeouts bei Server-/Client-Verbindungen und sorgt dafür, dass kompilierte VEXT-Module, die an den Client gesendet werden, Debug-Symbole enthalten.',
      vexttrace:
        'Aktivieren Sie die VEXT-Ausführungsverfolgung. Wenn die Verfolgung aktiviert ist und VU abstürzt, ist die letzte ausgeführte Zeile jedes geladenen VEXT-Mods im Absturzdialog und in den übermittelten Absturzdetails verfügbar. Beachten Sie, dass dies die Leistung beeinträchtigen kann.',
    },
    client: {
      dwebui: 'WebUI-Debugging unter http://localhost:8884 aktivieren.',
      serverJoinString:
        'Verbinde dich mit einem Server mit der angegebenen GUID und einem optionalen Passwort. Kann als Hyperlink zum Beitritt verwendet werden. Wenn die Zeichenfolgen „Join“ und „Spectate“ leer sind, erstellt der VU Launcher automatisch eine Beitrittszeichenfolge im Backend. vu://join/4ffa57c1068540e59b9a25eb6b00dfcd/amazingpass.',
      serverSpectateString:
        'Verbinde dich als Zuschauer mit einem Server mit der angegebenen GUID und einem optionalen Passwort. Kann als Hyperlink zum Beitritt verwendet werden. Wenn die Zeichenfolgen „Join“ und „Spectate“ leer sind, erstellt der VU Launcher automatisch eine Beitrittszeichenfolge im Backend. vu://spectate/4ffa57c1068540e59b9a25eb6b00dfcd/amazingpass.',
      cefdebug:
        'Aktiviere ausführliches Debugging-Logging für CEF für WebUI-Mods. Eine Datei „debug.log“ wird im VU-Verzeichnis erstellt. (normalerweise %LocalAppData%\\VeniceUnleashed\\client).',
      credentials:
        '-username <Benutzername> -password <Passwort> Meldet Sie mit den angegebenen VU-Anmeldedaten bei Ihrem VU-Konto an.',
      disableUiHwAcceleration:
        'Hardwarebeschleunigung für WebUI deaktivieren. Nur verwenden, wenn beim Starten der VU ein schwarzer Ladebildschirm angezeigt wird. Auf nicht unterstützten Betriebssystemen standardmäßig aktiviert.',
    },
    server: {
      high60: 'VU-Serverfrequenz auf 60 Hz einstellen.',
      high120: 'VU-Serverfrequenz auf 120 Hz einstellen.',
      headless: 'VU-Server im Headless-Modus ausführen (ohne Fenster zu erstellen).',
      serverInstancePath:
        'Serverinstanzpfad (in dem Serverkonfiguration, Protokolle und Mods gespeichert sind) für den VU-Server festlegen.',
      highResTerrain:
        'Hochauflösendes Terrain aktivieren. Nützlich, um Karten über ihren ursprünglichen Spielbereich hinaus zu erweitern.',
      disableTerrainInterpolation:
        'Interpolation zwischen verschiedenen Terrain-LODs deaktivieren.',
      skipChecksum: 'Level-Prüfsummenvalidierung bei Client-Verbindung deaktivieren.',
      listen:
        'Host und Port festlegen, auf denen der VU-Server auf Verbindungen warten soll. Standardmäßig 0.0.0.0:25200.',
      mHarmonyPort:
        'Port festlegen, auf dem der VU-Server auf MonitoredHarmony-Verbindungen warten soll. Standardmäßig 7948.',
      remoteAdminPort:
        'Host und Port festlegen, auf denen der VU-Server auf RCON-Verbindungen warten soll. Standardmäßig 0.0.0.0:47200.',
      unlisted:
        'Server aus der Serverliste ausblenden. Für den Beitritt ist der Konsolenbefehl „connect“ oder „vu join“ erforderlich. Zeichenfolge.',
      joinaddr:
        'IPv4-Adresse festlegen, mit der sich Clients verbinden sollen. Falls leer, versucht das Backend, die IP-Adresse des Servers automatisch zu erkennen.',
      joinhost:
        'Hostnamen festlegen, den Clients bei der Verbindung verwenden sollen. Ist dieser Wert angegeben, hat -joinaddr keine Wirkung, und Clients, die eine Verbindung herstellen möchten, führen keine NAT-Erkennung durch.',
      noUpdate: 'Automatische Updates deaktivieren.',
      maxPlayers:
        'Maximale Spieleranzahl festlegen (vars.maxPlayers + vars.maxSpectators). Bei Verwendung der Standard-Zuschaueranzahl von 24 ist ein Wert von vars.maxPlayers über 40 nicht möglich.',
    },
  },
}
