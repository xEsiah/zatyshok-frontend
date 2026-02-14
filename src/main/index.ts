import { app, shell, BrowserWindow, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

// --- CONFIGURATION DU LOGGER ---
log.transports.file.level = 'info'
autoUpdater.logger = log

// --- CONFIGURATION UPDATER ---
autoUpdater.allowDowngrade = false
autoUpdater.allowPrerelease = false
// Important pour les apps non-signées
autoUpdater.forceDevUpdateConfig = true

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 900, // Correction : plus petit pour permettre le resize
    minHeight: 600,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: '#E8E5EE',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#e8e5ee00',
      symbolColor: '#7D5C9B',
      height: 35
    },
    ...(process.platform === 'linux' ? { icon } : { icon }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    // On ne vérifie les updates que si on n'est pas en développement
    if (!is.dev) {
      autoUpdater.checkForUpdatesAndNotify()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// --- ÉVÉNEMENTS AUTO-UPDATER ---
autoUpdater.on('update-available', () => {
  log.info('Update available, starting download...')
})

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded: ', info.version)
  dialog
    .showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: `A new version (${info.version}) is ready. Restart now?`,
      buttons: ['Restart', 'Later']
    })
    .then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
})

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater: ', err)
})

// --- CYCLE DE VIE ---
app.whenReady().then(() => {
  // Doit matcher exactement l'appId du package.json
  electronApp.setAppUserModelId('com.zatyshok.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
