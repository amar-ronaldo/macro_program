const {
  ipcMain,
  dialog
} = require('electron')

ipcMain.on('open-dialog-error', (event, args) => {
  dialog.showErrorBox(args.title, args.message)
})
ipcMain.on('open-dialog-info', (event, args) => {
  const options = {
    type: 'info',
    title: args.title,
    message: args.message,
    buttons: args.yesorno ? ['Yes', 'No'] : []
  }

  dialog.showMessageBox(options, (index) => {
    if (args.yesorno) event.sender.send('dialog-info-selection', index)
  })
})
