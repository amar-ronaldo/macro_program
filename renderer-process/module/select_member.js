const {ipcRenderer} = require('electron')
const $ = require('jquery')

$(document).on('click','.button-pilih',function(){
    let id = $(this).attr('data-id')
    ipcRenderer.send('macro-window-select-hide',id)
})

ipcRenderer.on('reload-data',(e,data)=>{
    $('.table-striped > tbody').html('')
    clone = $('#row').find('tbody').clone(true)
    var id_td = []
    clone.find('td').each((i,v)=>{
        id = $(v).attr('id')
        if(typeof id != 'undefined') id_td.push(id)
    })    
    data.forEach((data,i)=>{
        clone = $('#row').find('tbody').clone(true)
        clone.find('.button-pilih').attr('data-id',i)
        id_td.forEach((id)=>{
            if(typeof data[id] != 'undefined') clone.find('td#'+id).text(data[id])
        })
        clone.children('tr').appendTo('.table-striped > tbody')
    })
})  