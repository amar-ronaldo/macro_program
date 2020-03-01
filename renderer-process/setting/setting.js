const { dialog} = require('electron').remote
const remote = require('electron').remote
const ipcRenderer = require('electron').ipcRenderer
const $ = require('jquery');
const {callNotification} = require('../module/notification/notification.js')
var settings = require('electron-settings')

const excelHelper = require('../excel.js');

$('#select-file-excel').on('click', function () {
  const loadingText = 'Loading..'
  const SelectFileText = 'Select File'

  if (this.innerHTML == loadingText) return
  this.innerHTML = loadingText
  const $id = $(this).attr('id')

  dialog.showOpenDialog({ properties: ['openFile'] })
    .then(async result => {
      if (!result.canceled){
        await save_path($id, result.filePaths[0])
        callNotification.success('Path Berhasil di Simpan')
      }
      this.innerHTML = SelectFileText
    }).catch(err => {
      callNotification.error(err)
    })
})

async function save_path(type, path) {
  $elem = 'path-' + type.split('-').pop();
  $('#' + $elem).text(path.replace(/\\/g, "/"))

  settings.set($elem, path);
}

$('#refresh-bank-excel').on('click', async function () {
  $('#button-loading').trigger('click')
  await excelHelper.read_bank_name_form_excel()
  callNotification.success('List Bank Berhasil di Refresh')
  remote.getCurrentWindow().reload()
  // $('#button-loading-hide').trigger('click')
})


$('#input-akses-adp').on('click', async function () {
  ipcRenderer.send('setting-akses-database-modal')
})

$('#check-akses-adp').on('click',async()=>{
  let {db} = require('../db.js')
  db.test_connection().then(()=>{
    callNotification.success('Database Berhasil Terhubung')
  }).catch((e)=>{
    callNotification.error(e)
    console.log(e);
    
  })
  
})


function init() {
  $.map(['excel', 'adp'], function (type, i) {
    $check = settings.get('path-' + type)
    if ($check !== 'undefined') $('#path-' + type).text($check)
  });
}

ipcRenderer.on('success-update-akses-database',()=>{
  remote.getCurrentWindow().reload()
   callNotification.success('Berhasil Update Akses Database')
})
init()