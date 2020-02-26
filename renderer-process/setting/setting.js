const {dialog} = require('electron').remote
const $ = require('jquery');
var settings = require('electron-settings')

const excelHelper = require('../excel.js');



$('#select-file-excel , #select-file-adp').on('click',function(){
    const $id  = $(this).attr('id')
    open_file($id)
    
})

$('#refresh-bank-excel').on('click',function(){
  excelHelper.read_bank_name_form_excel()
})

function open_file($id){
    dialog.showOpenDialog({ properties: ['openFile'] })
    .then(result => {
        if(!result.canceled) save_path($id,result.filePaths[0])
      }).catch(err => {
        console.log(err)
      })
}

function save_path(type,path){
    $elem = 'path-' + type.split('-').pop();
    $('#' +$elem).text(path.replace(/\\/g,"/"))

    settings.set($elem, path);
}

function init(){
    $.map( ['excel','adp'], function( type, i ) {
        $check = settings.get('path-'+type)
        if ($check !== 'undefined' )  $('#path-'+type).text($check)
      });
}


init()