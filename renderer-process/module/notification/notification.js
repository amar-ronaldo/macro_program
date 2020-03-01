const {Notification,dialog } = require('electron').remote;

const path = require('path')
class callNotification {
    error(msg,title="Error"){
        
        dialog.showMessageBox({
            type:'error',
            title:title,
            message : String(msg)
        })
    }
    success(msg,title){
        let iconAddress = path.join(__dirname, 'success.png');
        const notif={
              title: title,
              body: msg,
              icon: iconAddress
            };
        return new Notification(notif).show();
    }
}
exports.callNotification = new callNotification