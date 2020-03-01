const { ipcRenderer } = require('electron');

const $ = require('jquery')


$(document).on('click', '#save', function (e) {
    e.preventDefault()
    // save form 
    var $data = $('form').serializeArray().reduce(function (obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {})

    ipcRenderer.send('setting-akses-database-modal-reply', $data)
})

$(document).on('click', '#close', function () {
    ipcRenderer.send('setting-akses-database-modal-reply', null)
})

function ready() {
    let settings = require('electron-settings')
    db = settings.get('DB')
    if (typeof db === 'undefined') return
    Object.entries(db).forEach((e) => {
        $('input[name=' + e[0]+']').val(e[1])
    })
}