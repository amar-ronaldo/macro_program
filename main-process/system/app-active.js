const {
  ipcMain
} = require('electron')
var  monitor = require('active-window');
var  appActive

monitor.getActiveWindow((window) => {
  appActive = window.app
},-1, 1)

ipcMain.on('isActiveApp', (event, appname) => {
  var status 
  var check  = setInterval(() => {
    status  = appActive == appname
    if(status){
      event.returnValue = status
      clearInterval(check)
    } 
  }, 1100);
})