import { app } from 'electron'

export const LOCAL_MAC_UPDATE_MESSAGE =
  'This is a local macOS build. In-app updates require a compatible signing identity. ' +
  'Quit Orca and run Update-Orca.command from your source checkout to rebuild and install it. ' +
  'To use official automatic updates, manually install the official signed Orca app first.'

export function requiresLocalMacReinstall(): boolean {
  // build-mac-local stamps this suffix; ad-hoc signatures bind ShipIt to this build's hash.
  return process.platform === 'darwin' && /[-.]local\.\d+\.[0-9A-Za-z-]+$/.test(app.getVersion())
}
