import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadUpdaterModule, warmUpdaterModule } from './updater-test-module-loader'

const {
  appMock,
  autoUpdaterMock,
  powerMonitorOnMock,
  fetchNudgeMock,
  chooseLocalBuildMock,
  moduleFactories,
  resetUpdaterMocks
} = await vi.hoisted(async () => (await import('./updater-test-harness')).createUpdaterMocks())

vi.mock('electron', () => moduleFactories.electron())
vi.mock('electron-updater', () => moduleFactories.electronUpdater())
vi.mock('./electron-updater-loader', () => moduleFactories.electronUpdaterLoader())
vi.mock('./ipc/pty/kill-all', () => moduleFactories.ptyKillAll())
vi.mock('./linux-update-package-type', () => moduleFactories.linuxUpdatePackageType())
vi.mock('./updater-lifecycle-diagnostics', () => moduleFactories.updaterLifecycleDiagnostics())
vi.mock('./updater-changelog', () => moduleFactories.updaterChangelog())
vi.mock('./updater-nudge', () => moduleFactories.updaterNudge())
vi.mock('./update-install-exit-watchdog', () => moduleFactories.updateInstallExitWatchdog())
vi.mock('./updater-prerelease-feed', () => moduleFactories.updaterPrereleaseFeed())
vi.mock('./local-builds/local-build-switch', () => moduleFactories.localBuildSwitch())
vi.mock('./local-builds/local-build-feed-server', () => moduleFactories.localBuildFeedServer())

warmUpdaterModule()

const originalPlatform = process.platform

describe('local macOS updater policy', () => {
  beforeEach(() => {
    resetUpdaterMocks()
    vi.useFakeTimers()
    Object.defineProperty(process, 'platform', { value: 'darwin' })
    appMock.getVersion.mockReturnValue('1.4.214-local.1792339828948.e1b2d5827362')
  })

  afterEach(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform })
  })

  it('skips startup checks, nudges and direct background checks', async () => {
    const updater = await loadUpdaterModule()
    updater.setupAutoUpdater(null)
    updater.checkForUpdates()
    await vi.advanceTimersByTimeAsync(1000)
    expect(autoUpdaterMock.setFeedURL).not.toHaveBeenCalled()
    expect(autoUpdaterMock.checkForUpdates).not.toHaveBeenCalled()
    expect(powerMonitorOnMock).not.toHaveBeenCalled()
    expect(fetchNudgeMock).not.toHaveBeenCalled()
  })

  it.each([undefined, { localBuild: true }, { channel: 'stable' as const, targetTag: 'v1.4.215' }])(
    'explains manual reinstall for menu checks (%j)',
    async (options) => {
      const updater = await loadUpdaterModule()
      updater.setupAutoUpdater(null)
      updater.checkForUpdatesFromMenu(options)
      expect(updater.getUpdateStatus()).toMatchObject({
        state: 'error',
        retryable: false,
        userInitiated: true,
        message: expect.stringContaining('Update-Orca.command')
      })
      expect(autoUpdaterMock.checkForUpdates).not.toHaveBeenCalled()
      expect(chooseLocalBuildMock).not.toHaveBeenCalled()
    }
  )

  it('blocks direct download and install calls without quitting', async () => {
    const updater = await loadUpdaterModule()
    updater.setupAutoUpdater(null)
    updater.downloadUpdate()
    updater.quitAndInstall()
    await vi.advanceTimersByTimeAsync(1000)
    expect(updater.getUpdateStatus()).toMatchObject({ state: 'error', retryable: false })
    expect(autoUpdaterMock.downloadUpdate).not.toHaveBeenCalled()
    expect(autoUpdaterMock.quitAndInstall).not.toHaveBeenCalled()
    expect(appMock.quit).not.toHaveBeenCalled()
  })

  it.each(['1.4.214', '1.4.215-rc.0', '1.4.215-hourly.123'])(
    'keeps signed release setup for %s',
    async (version) => {
      appMock.getVersion.mockReturnValue(version)
      const updater = await loadUpdaterModule()
      updater.setupAutoUpdater(null, { getLastUpdateCheckAt: () => Date.now() })
      expect(autoUpdaterMock.setFeedURL).toHaveBeenCalled()
    }
  )

  it.each(['linux', 'win32'])('does not change %s setup', async (platform) => {
    Object.defineProperty(process, 'platform', { value: platform })
    const updater = await loadUpdaterModule()
    updater.setupAutoUpdater(null, { getLastUpdateCheckAt: () => Date.now() })
    expect(autoUpdaterMock.setFeedURL).toHaveBeenCalled()
  })
})
