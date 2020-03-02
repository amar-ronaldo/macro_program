const path = require('path')
const glob = require('glob')
const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut
} = require('electron')

var settings = require('electron-settings')

const debug = false;


if (process.mas) app.setName('Macro Program')
let mainWindow = null
let macroWindow = null

function initialize() {
  makeSingleInstance()

  loadDemos()

  function settings_default() {
    settings.set('WITHDRAW', null)
    settings.set('PINDAH_DANA', null)
    settings.set('BANK_LIST', 'BCA,Mandiri,BNI,BRI,CIMB,Danamon')
  }

  function createMainWindow() {

    const windowOptions = {
      width: 1080,
      minWidth: 680,
      height: 840,
      title: app.name,
      webPreferences: {
        nodeIntegration: true
      }
    }

    mainWindow = new BrowserWindow(windowOptions)
    mainWindow.loadURL(path.join('file://', __dirname, '/index.html'))

    // if (debug) {
    //   mainWindow.webContents.openDevTools()
    //   mainWindow.maximize()
    //   require('devtron').install()
    // }

    mainWindow.on('closed', () => {
      mainWindow = null
    })
    return mainWindow

  }

  function createMacroWindow(parent) {
    const macroWindowOptions = {
      frame: false,
      // alwaysOnTop: true,
      show: false,
      parent: parent,
      backgroundColor: '#f1f1f1',
      // title: 'Pilih Member',

      webPreferences: {
        nodeIntegration: true
      }
    }
    macroWindow = new BrowserWindow(macroWindowOptions)
    macroWindow.loadURL(path.join('file://', __dirname, '/sections/module/select_member.html'))

    // Launch fullscreen with DevTools open, usage: npm run debug
    // if (debug) {
    //   mainWindow.maximize()
    //   macroWindow.webContents.openDevTools()
    //   require('devtron').install()
    // }


    return macroWindow
  }
  function createSettingAksesDatabaseWindow(parent) {
    const modalPath = path.join('file://', __dirname, '/sections/setting/akses_database.html')
    let win = new BrowserWindow({
      width: 250,
      height: 450,
      frame: false,
      show: false,
      parent: parent, webPreferences: {
        nodeIntegration: true
      }
    })

    win.on('close', () => { win = null })
    win.loadURL(modalPath)
    // if (debug) {
    //   // win.maximize()
    //   win.webContents.openDevTools()
    //   require('devtron').install()
    // }
    win.on('show', () => {
      win.webContents.executeJavaScript('ready()')
    })
    return win
  }
  function createWindow() {
    mainWindow = createMainWindow()
    macroWindow = createMacroWindow(mainWindow)
    settingAksesDatabaseWindow = createSettingAksesDatabaseWindow(mainWindow)



    ipcMain.on('setting-akses-database-modal', (event, data) => {
      settingAksesDatabaseWindow.show()
    })
    ipcMain.on('setting-akses-database-modal-reply', (event, data) => {
      settingAksesDatabaseWindow.hide()
      if (data != null) {
        settings.set('DB', data)
        mainWindow.webContents.send('success-update-akses-database')
      }
    })

    ipcMain.on('macro-window-select-member', (event, data) => {
      macroWindow.webContents.send('reload-data', data)
      macroWindow.show()
    })
    ipcMain.on('macro-window-select-hide', (event, data) => {
      mainWindow.webContents.send('macro-window-select-member-reply', data)
      macroWindow.hide()
    })
  }

  app.on('ready', async () => {
    // shorcut 

    createWindow()
    settings_default()

    globalShortcut.register('CommandOrControl+Shift+O', () => {
      mainWindow.focus()
      mainWindow.show()
    })
    globalShortcut.register('CommandOrControl+Shift+E', () => {
      mainWindow.webContents.send('open-file-excel')
    })

    globalShortcut.registerAll(['CommandOrControl+1', 'CommandOrControl+num1'], () => {
      mainWindow.focus()
      mainWindow.show()
      mainWindow.webContents.send('focus-withdaw')
    })
    globalShortcut.registerAll(['CommandOrControl+2', 'CommandOrControl+num2'], () => {
      mainWindow.focus()
      mainWindow.show()
      mainWindow.webContents.send('focus-pindah-dana')
    })
    globalShortcut.registerAll(['CommandOrControl+3', 'CommandOrControl+num3'], () => {
      mainWindow.focus()
      mainWindow.show()
      mainWindow.webContents.send('focus-setting')
    })
  })

  app.on('window-all-closed', () => {
    globalShortcut.unregisterAll()
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (mainWindow === null || macroWindow === null) {
      createWindow()
    }
  })
  ipcMain.on('focus-main', () => {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
    mainWindow.show()
  });
}

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance() {
  if (process.mas) return

  app.requestSingleInstanceLock()

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// Require each JS file in the main-process dir
function loadDemos() {
  const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
  files.forEach((file) => {
    require(file)
  })
}

initialize()