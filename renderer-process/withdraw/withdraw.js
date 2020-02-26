const {
    ipcRenderer
} = require('electron');


const excelHelper = require('../excel.js');
const $ = require('jquery');
var settings = require('electron-settings')


var conn = require('../db.js')
var db = new conn()

var is_running_macro



$('#btnWithdraw').on('click', async function (e) {
    e.preventDefault()
    if (is_running_macro) return
    $('#button-loading').trigger('click')

    is_running_macro = true
    // save form 
    var $data = $('form').serializeArray().reduce(function (obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {})
    bank_name = $data.bank_admin.split(' ')
    $data.bank_name = bank_name[0].toUpperCase() + ' ' + bank_name[1].substring(0, 3).toUpperCase();

    settings.set('WITHDRAW', $data)
    // await excelHelper.get_last_mutasi()

    console.log(settings.get('WITHDRAW'));
    Promise.all([excelHelper.macro_input(),run_macro()]).then((resolve)=>{
        console.log(resolve)
        console.log('oke')
        is_running_macro = false
        $('#button-loading-hide').trigger('click')
    })
    .catch(
        error =>{
            console.log(error)
            
            // ipcRenderer.send('notif-error',{msg:error}

        } 
        ) 

})


async function run_macro() {
    data = settings.get('WITHDRAW')
    return db.search_member(data.username).then(async res => {
        index = 0
        if (!res.next) {
            // show modal select member 
            await new Promise(resolve => {
                ipcRenderer.send('macro-window-select-member',res.data)
                ipcRenderer.on('macro-window-select-member-reply', function (event, args) {
                    index = args
                    resolve();
                })
            })
        }
        res = res.data[index]
        return res
    }).then(res => {
        return db.insert_trans(res.MemberID,data)
    }).then(()=>{
        return 'oke'
    })
}


async function append_bank() {
    await $('#option-bank').append(excelHelper.option_bank())
}

function dev() {
    $('input[name=username]').val('asd')
    $('input[name=akun_bank]').val('amar')
    $('input[name=deposit]').val('100')
    $('input[name=withdraw]').val('200')
    $('input[name=bonus]').val('300')
    $('input[name=cancel]').val('400')
}

function init() {
    dev()
    append_bank()
}

init()