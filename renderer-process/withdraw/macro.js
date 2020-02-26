var robot = require('robotjs')

var processWindows = require("node-process-windows");

var settings = require('electron-settings')

function focusAdp(){
    processWindows.focusWindow("AplikasiDataPlayer")
}


function do_login() {
    robot.setKeyboardDelay(500)
    robot.typeString("admin");
    robot.keyTap("tab");
    robot.typeString("admin");
    robot.keyTap("enter");
}

function do_find_member(){
    data_member = settings.get('WITHDRAW')
    robot.keyTap('f','shift')
    robot.typeString(data_member.username)
    robot.keyTap('enter')
    robot.keyTap('enter')
}
 function do_insert() {
    data_member = settings.get('WITHDRAW')

    robot.keyTap("tab");
    robot.keyTap("tab");
    robot.keyTap("insert");
    robot.keyTap("tab");
    robot.keyTap("tab");
    robot.keyTap("tab");

    
    if(data_member.deposit != '') robot.typeString(data_member.deposit)
    robot.keyTap("tab");
    
    if(data_member.deposit != '') robot.typeString(data_member.withdraw)
    robot.keyTap("tab");

    if(data_member.bank_admin != '') robot.typeString(data_member.bank_name)

    robot.keyTap("tab");

    if(data_member.bonus != '') robot.typeString(data_member.bonus)

    robot.keyTap("tab");

    if(data_member.cancel != '') robot.typeString(data_member.cancel)
    
    robot.keyTap("enter");
    robot.keyTap("enter");
    robot.setKeyboardDelay(750);
    robot.keyTap("enter");
    return true
}

function reload_adb(){
    robot.keyTap('r','control')
    robot.keyTap("enter");
} 

module.exports = {
    open_adp: () => {
        return open_adp()
    },
    focusAdp: () => {
        return focusAdp()
    },
    reload_adb: () => {
        return reload_adb()
    },
    do_find_member: () => {
        return do_find_member()
    },
    do_insert:async () => {
        return do_insert()
    }
}