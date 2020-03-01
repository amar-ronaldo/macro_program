const { ipcRenderer, shell } = require('electron');
const $ = require('jquery')
const excelHelper = require('../renderer-process/excel.js');
const settings = require('electron-settings');
let path = settings.get('path-excel')

ipcRenderer.on('focus-withdaw', () => {
    $('#button-withdraw').trigger('click')
})

ipcRenderer.on('focus-pindah-dana', () => {
    $('#button-pindah-dana').trigger('click')
})

ipcRenderer.on('focus-setting', () => {
    $('#button-setting').trigger('click')
})

ipcRenderer.on('open-file-excel', () => {
    shell.openItem(path);
})
// Open a local file in the default app

async function init() {
    $('#button-loading').trigger('click')
    if (path != 'undefined') await excelHelper.init()
    $('#button-loading-hide').trigger('click')
}

// init()