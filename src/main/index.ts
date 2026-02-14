import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { autoUpdater } from 'electron-updater'
// CORRECTION ICI : On utilise import au lieu de require
import log from 'electron-log'

// --- CONFIGURATION DU LOGGER ---
// On configure le logger proprement avec la syntaxe import
log.transports.file.level = 'info'
autoUpdater.logger = log

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 900,
    minHeight: 900,
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
    // Vérification des mises à jour en prod uniquement
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
  log.info('Update available.') // On utilise le log importé
})

autoUpdater.on('update-downloaded', () => {
  log.info('Update downloaded.')
  dialog
    .showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'A new version of Zatyshok has been downloaded. Restart now to install?',
      buttons: ['Restart', 'Later']
    })
    .then((returnValue) => {
      if (returnValue.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
})

autoUpdater.on('error', (message) => {
  log.error('There was a problem updating the application')
  log.error(message)
})

// --- CYCLE DE VIE DE L'APP ---

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.zatyshok.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
