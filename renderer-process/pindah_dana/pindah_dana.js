let {
    ipcRenderer
} = require('electron');

let { callNotification } = require('../module/notification/notification.js')
let settings = require('electron-settings')
let excelHelper = require('../excel.js')
let $ = require('jquery');


$('#btn-pindah-dana').on('click', function () {
    $('#button-loading').trigger('click')
    setTimeout(async () => {
        // save form 
        let $data = $('form').serializeArray().reduce(function (obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {})

        settings.set('PINDAH_DANA', $data)
        run_macro()
    }, 250)
})


function run_macro() {

    excelHelper.macro_input_pindah_dana()
        .then(() => {
            data = settings.get('PINDAH_DANA')
            callNotification.success('Berhasil Pindah Dana dari "' + data.bank_penerima + '" ke "' + data.bank_pengirim + '"')
        })
        .catch((e) => {
            callNotification.error(e)

        }).finally(() => {
            ipcRenderer.send('focus-main')
            $('#button-loading-hide').trigger('click')
        })
}


async function append_bank() {
    await $('.option-bank').append(excelHelper.option_bank())
}

function dev() {
    $('input[name=jumlah_dana]').val('1000')
}

function init() {
    dev()
    append_bank()
}

init()