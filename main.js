require('update-electron-app')({
  logger: require('electron-log')
})

const path = require('path')
const glob = require('glob')
const {
  app,
  BrowserWindow,
  ipcMain
} = require('electron')


var settings = require('electron-settings')

const debug = 'true';

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

    if (debug) {
      mainWindow.webContents.openDevTools()
      mainWindow.maximize()
      require('devtron').install()
    }

    mainWindow.on('closed', () => {
      mainWindow = null
    })
    return mainWindow

  }

  function createMacroWindow(parent) {
    const macroWindowOptions = {
      // frame: false,
      // alwaysOnTop: true,
      // show: false,
      parent:parent,
      backgroundColor: '#f1f1f1',
      title: 'Pilih Member',

      webPreferences: {
        nodeIntegration: true
      }
    }
    macroWindow = new BrowserWindow(macroWindowOptions)
    macroWindow.loadURL(path.join('file://', __dirname, '/sections/module/select_member.html'))

    // Launch fullscreen with DevTools open, usage: npm run debug
    if (debug) {
      mainWindow.maximize()
      macroWindow.webContents.openDevTools()
      require('devtron').install()
    }


    return macroWindow
  }

  function createWindow() {
    mainWindow = createMainWindow()
    macroWindow = createMacroWindow(mainWindow)



    macroWindow.hide()
    ipcMain.on('macro-window-select-member', (event, data) => {
      macroWindow.webContents.send('reload-data',data)
      macroWindow.show()
    })

    ipcMain.on('macro-window-select-hide', (event, data) => {
      mainWindow.webContents.send('macro-window-select-member-reply', data)
      macroWindow.hide()
    })
  }

  app.on('ready', async () => {

    createWindow()
    settings_default()
  })

  app.on('window-all-closed', () => {
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