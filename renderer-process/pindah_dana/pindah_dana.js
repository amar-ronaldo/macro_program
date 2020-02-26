const {
    ipcRenderer
} = require('electron');


const excelHelper = require('../excel.js');
const $ = require('jquery');
var settings = require('electron-settings')
var is_running_macro

$('#btn-pindah-dana').on('click', async function (e) {
    e.preventDefault()
    if (is_running_macro) return
    $('#button-loading').trigger('click')

    is_running_macro = true
    // save form 
    var $data = $('form').serializeArray().reduce(function (obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {})

    settings.set('PINDAH_DANA', $data)
    run_macro()
})


function run_macro() {

    excelHelper.macro_input_pindah_dana()
    .then(()=>{
         ipcRenderer.send('focus-main')
     }).then(()=>{
         is_running_macro = false
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