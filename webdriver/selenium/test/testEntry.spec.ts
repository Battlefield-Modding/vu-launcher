import os from 'os'
import path from 'path'
import { Builder, Capabilities, WebDriver } from 'selenium-webdriver'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { routes, UserPreferences } from '@/config/config'
import { spawn, spawnSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import trash from 'trash'

const localAppData = process.env.LOCALAPPDATA

// create the path to the expected application binary
const application = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'src-tauri',
  'target',
  'debug',
  'vu-launcher',
)

// keep track of the webdriver instance we create
let driver: WebDriver

// keep track of the tauri-driver process we start
let tauriDriver: WebDriver

beforeAll(async function () {
  // Delete the entire vu-launcher-dev on start of test-suite
  if (localAppData) {
    const devInstallLocation = path.resolve(localAppData, 'vu-launcher-dev')
    const folderExists = existsSync(devInstallLocation)
    if (folderExists) {
      await trash(devInstallLocation)
    }
  }

  // ensure the program has been built
  spawnSync('cargo', ['build', '--debug'])

  // start tauri-driver
  // @ts-expect-error
  tauriDriver = spawn(path.resolve(os.homedir(), '.cargo', 'bin', 'tauri-driver'), [], {
    stdio: [null, process.stdout, process.stderr],
  })

  const capabilities = new Capabilities()
  capabilities.set('tauri:options', { application })
  capabilities.setBrowserName('wry')

  // start the webdriver client
  driver = await new Builder()
    .withCapabilities(capabilities)
    .usingServer('http://localhost:4444/')
    .build()
})

afterAll(async function () {
  // stop the webdriver session
  await driver.quit()

  // kill the tauri-driver process
  // @ts-expect-error
  tauriDriver.kill()
})

describe('First time startup', () => {
  const tauriURL = 'http://tauri.localhost'
  it('should start on onboarding page', async () => {
    // arrange
    const targetURL = tauriURL + routes.ONBOARDING
    // act
    const currentRoute = await driver.getCurrentUrl()
    // assert
    expect(currentRoute).toEqual(targetURL)
  })

  it('should create folder appdata/local/vu-launcher-dev', async () => {
    if (localAppData) {
      // arrange
      const devInstallLocation = path.resolve(localAppData, 'vu-launcher-dev')
      // act
      const status = existsSync(devInstallLocation)
      // assert
      expect(status).toBe(true)
    } else {
      expect(0).toEqual(1)
    }
  })

  it('should create settings JSON file', async () => {
    if (localAppData) {
      // arrange
      const settingsPath = path.resolve(localAppData, 'vu-launcher-dev', 'settings.json')
      // act
      const status = existsSync(settingsPath)
      // assert
      expect(status).toBe(true)
    } else {
      expect(0).toEqual(1)
    }
  })

  it('should assign all settings in json file', async () => {
    if (localAppData) {
      // arrange
      let jsonData: UserPreferences
      const settingsPath = path.resolve(localAppData, 'vu-launcher-dev', 'settings.json')

      // act
      try {
        const data = readFileSync(settingsPath, 'utf-8')
        jsonData = JSON.parse(data)
      } catch (e) {
        console.error(e)
        expect(0).toEqual(1)
      }

      // assert
      // @ts-expect-error
      if (jsonData) {
        expect(jsonData.is_sidebar_enabled).toBeDefined()
        expect(jsonData.venice_unleashed_shortcut_location).toBeDefined()
        expect(jsonData.dev_venice_unleashed_shortcut_location).toBeDefined()
        expect(jsonData.usernames).toBeDefined()
        expect(jsonData.servers).toBeDefined()
        expect(jsonData.server_guid).toBeDefined()
        expect(jsonData.show_multiple_account_join).toBeDefined()
        expect(jsonData.is_onboarded).toBeDefined()
        expect(jsonData.use_dev_branch).toBeDefined()
        expect(jsonData.preferred_player_index).toBeDefined()
        expect(jsonData.preferred_server_index).toBeDefined()
        expect(jsonData.last_visted_route).toBeDefined()
        expect(jsonData.automatically_check_for_updates).toBeDefined()
        expect(jsonData.automatically_install_update_if_found).toBeDefined()
      }
    }
  })
})
