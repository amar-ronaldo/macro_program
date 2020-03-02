let {
    ipcRenderer
} = require('electron');

let { callNotification } = require('../module/notification/notification.js')
let settings = require('electron-settings')
let excelHelper = require('../excel.js');
let { db } = require('../db.js')
let $ = require('jquery');

$('#btnWithdraw').on('click', async function (e) {
    $('#button-loading').trigger('click')

    setTimeout(async () => {
        // save form 
        let $data = $('form').serializeArray().reduce(function (obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {})
        bank_name = $data.bank_admin.split(' ')
        $data.bank_name = bank_name[0].toUpperCase() + ' ' + bank_name[1].substring(0, 3).toUpperCase();

        settings.set('WITHDRAW', $data)
        await excelHelper.get_last_mutasi()
        
        Promise.all([excelHelper.check_open()])
            .then(async () => {
                
                await run_macro()
                    .then(async () => {
                        await excelHelper.macro_input()
                            .then(() => {
                                reset_form()
                                callNotification.success('Berhasil Update Data')
                            })
                            .catch((e) => { 
                                reset_form()
                                callNotification.error(e) })
                    })
                    .catch((e) => { 
                        reset_form() 
                        callNotification.error(e) })
            })
            .catch(e => { 
                reset_form()
                callNotification.error(e) 
            })
    }, 250)


})


async function run_macro() {
    data = settings.get('WITHDRAW')
    return db.search_member(data.username).then(async res => {
        index = 0
        if (!res.next) {
            // show modal select member 
            await new Promise(resolve => {
                ipcRenderer.send('macro-window-select-member', res.data)
                ipcRenderer.on('macro-window-select-member-reply', function (event, args) {
                    index = args
                    resolve();
                })
            })
        }
        res = res.data[index]
        return res
    }).then(async res => {
        await db.insert_trans(res.MemberID, data)
        return true
    })
}


async function append_bank() {
    await $('#option-bank').append(excelHelper.option_bank())
}

function dev() {
    $('input[name=username]').val('albert kurniawan')
    $('input[name=akun_bank]').val('amar')
    $('input[name=deposit]').val('100')
    $('input[name=withdraw]').val('200')
    $('input[name=bonus]').val('300')
    $('input[name=cancel]').val('400')
}
function reset_form(){
    document.getElementById('withdraw-form').reset();
    $('input[name=deposit]').val('0')
    $('input[name=withdraw]').val('0')
    $('input[name=bonus]').val('0')
    $('input[name=cancel]').val('0')
    $('#button-loading-hide').trigger('click')        
}

function init() {
    reset_form()
    append_bank()
}

init()