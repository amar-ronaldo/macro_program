const { Notification , ipcMain } = require('electron');
const path = require('path')
ipcMain.on('notif-error', (event, args) => {
    let notification =  new Notification(args.title ?? 'Error ', {
        body: args.msg,
        icon: path.join(__dirname, 'error.png')
    })
    notification.show();
})

ipcMain.on('notif-warning', (event, args) => {
    let notification =  new Notification(args.title ?? 'Warning', {
        body: args.msg,
        icon: path.join(__dirname, 'warning.png')
    })
    notification.show();
})