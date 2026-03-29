/* eslint-disable prettier/prettier */
import { app, shell, BrowserWindow, dialog, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import Store from 'electron-store'

// --- CONFIGURATION DU LOGGER ---
log.transports.file.level = 'info'
autoUpdater.logger = log

// --- CONFIGURATION UPDATER ---
autoUpdater.allowDowngrade = false
autoUpdater.allowPrerelease = false
// Important pour les apps non-signées
autoUpdater.forceDevUpdateConfig = true

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StoreClass = (Store as any).default || Store
const store = new StoreClass()

let mainWindow: BrowserWindow

function createWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width: Math.floor(width * 0.8), // Layout 2 par défaut
    height: Math.floor(height * 0.8), // Layout 2 par défaut
    minWidth: Math.floor(width * 0.4), // Un peu moins de 50% pour éviter les blocages de rounding
    minHeight: Math.floor(height * 0.4),
    resizable: false,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: '#E8E5EE',
    titleBarStyle: 'hidden',
    ...(process.platform === 'linux' ? { icon } : { icon }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize() // Démarre l'appli en plein écran
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

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.zatyshok.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('set-store', (_, key, value) => {
    store.set(key, value)
  })

  ipcMain.handle('get-store', (_, key) => {
    return store.get(key)
  })

  ipcMain.on('delete-store', (_, key) => {
    store.delete(key)
  })

  // --- GESTION DES 3 LAYOUTS ---
  ipcMain.on('set-layout', (_, layout: 'full' | 'standard' | 'split') => {
    if (!mainWindow) return

    // Récupère l'écran où se trouve actuellement la fenêtre
    const currentDisplay = screen.getDisplayMatching(mainWindow.getBounds())
    const { width: dW, height: dH, x: dX, y: dY } = currentDisplay.workArea

    // On autorise temporairement le redimensionnement pour appliquer le changement
    mainWindow.setResizable(true)

    if (layout === 'full') {
      mainWindow.maximize()
    } else {
      // Pour les modes non-full, on doit quitter l'état maximisé avant de changer les dimensions
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize()
      }

      if (layout === 'standard') {
        const w = Math.floor(dW * 0.8)
        const h = Math.floor(dH * 0.8)
        mainWindow.setBounds({
          x: dX + Math.floor((dW - w) / 2),
          y: dY + Math.floor((dH - h) / 2),
          width: w,
          height: h
        })
      } else if (layout === 'split') {
        const bounds = mainWindow.getBounds()
        const targetW = Math.floor(dW * 0.5)
        const isAlreadySplit = Math.abs(bounds.width - targetW) < 20

        if (isAlreadySplit) {
          const isOnLeft = Math.abs(bounds.x - dX) < 50
          const newX = isOnLeft ? dX + (dW - targetW) : dX
          mainWindow.setPosition(newX, dY)
        } else {
          mainWindow.setBounds({ x: dX, y: dY, width: targetW, height: dH })
        }
      }
    }

    // On verrouille à nouveau la fenêtre après un court délai pour laisser le temps à l'OS de finir
    setTimeout(() => {
      if (mainWindow) mainWindow.setResizable(false)
    }, 100)
  })

  ipcMain.on('window-close', () => mainWindow?.close())
  ipcMain.on('window-minimize', () => mainWindow?.minimize())

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
