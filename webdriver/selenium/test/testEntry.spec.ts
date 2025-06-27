import os from 'os'
import path from 'path'
import { Builder, Capabilities, WebDriver } from 'selenium-webdriver'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { routes } from '@/config/config'
import { spawn, spawnSync } from 'child_process'

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
  // unsure how to use the timeout from example

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

describe('Hello World', () => {
  const tauriURL = 'http://tauri.localhost'
  it('should start on onboarding page', async () => {
    // arrange
    // act
    const currentRoute = await driver.getCurrentUrl()
    expect(currentRoute).toEqual(tauriURL + routes.ONBOARDING)
  })
})
