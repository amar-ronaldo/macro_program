

var XlsxPopulate = require('xlsx-populate');
const moment = require('moment');

var excel = null


const $ = require('jquery');


// private
async function read_excel() {
    var settings = require('electron-settings')
    var file_excel = settings.get('path-excel')
    if (!excel) {
        return XlsxPopulate.fromFileAsync(file_excel).then(async workbook => {
            await save_excel(workbook)
            return workbook
        })
    } else {
        return excel
    }

}

async function save_excel(workbook, save_to_file) {
    var settings = require('electron-settings')

    var file_excel = settings.get('path-excel')
    excel = workbook

    if (save_to_file) return workbook.toFileAsync(file_excel)
}
async function get_last_row(worksheet) {
    return worksheet.usedRange().value().filter(v => {
        return v[0] != undefined
    }).length
}
// 
async function read_bank_name_form_excel() {
    var settings = require('electron-settings')
    var bank = []
    var bank_list = settings.get('BANK_LIST').split(',')

    return read_excel()
        .then(workbook => {
            workbook.sheets().forEach((v) => {
                bank.push({
                    name: v.name()
                })
            })

            return bank
        })
        .then(bank => {
            return bank.filter((item) => {
                return bank_list.includes(item.name.split(' ')[0])
            });
        })
        .then(bank_filter => {
            settings.set('excel_bank_list', bank_filter)
        })
}

function option_bank() {
    var settings = require('electron-settings')
    var opt = ''
    var excel_bank_list = settings.get('excel_bank_list')
    $.each(excel_bank_list, function (index, value) {
        opt += '<option value="' + value.name + '">' + value.name + '</option>';
    });
    return opt
}

function get_last_mutasi() {
    var settings = require('electron-settings')
    data = settings.get('WITHDRAW')


    return read_excel()
        .then(async workbook => {
            var worksheet = workbook.sheet(data.bank_admin)

            var last_row = await get_last_row(worksheet)
            return data.bank_name + ' ' + worksheet.cell('E' + last_row).value()
        })
        .then(bank_name => {
            settings.set('WITHDRAW.bank_name', bank_name)
        })
}

function macro_input() {
    var settings = require('electron-settings')
    data = settings.get('WITHDRAW')

    return read_excel()
        .then(async workbook => {
            var worksheet = workbook.sheet(data.bank_admin)
            var last_row = await get_last_row(worksheet)
            var input_row = last_row + 1
            worksheet.cell('A' + input_row).value([
                [
                    moment().format('DD/MM/YYYY hh:mm A'),
                    data.username,
                    parseInt(data.deposit),
                    parseInt(data.withdraw),
                    '',
                    'OK - by macro'
                ]
            ])
            // =E13+C14+D14
            // formula mutasi
            C = parseInt(worksheet.cell('C' + input_row).value())
            D = parseInt(worksheet.cell('D' + input_row).value())
            E = parseInt(worksheet.cell('E' + last_row).value())

            worksheet.cell('C' + input_row).style("numberFormat", "0.00")
            worksheet.cell('D' + input_row).style("numberFormat", "0.00");
            worksheet.cell('E' + input_row).value(C + D + E)
            return workbook
        })
        .then(async workbook => {
            await save_excel(workbook, 1)
            return true
        })
}

function macro_input_pindah_dana() {
    var settings = require('electron-settings')
    data = settings.get('PINDAH_DANA')

    return read_excel()
        .then(async workbook => {
            // pengirim
            var worksheet = workbook.sheet(data.bank_pengirim)

            var last_row = await get_last_row(worksheet)
            var input_row = last_row + 1

            worksheet.cell('A' + input_row).value([
                [
                    moment().format('DD/MM/YYYY hh:mm A'),
                    data.bank_penerima,
                    '',
                    parseInt(data.jumlah_dana),
                    '',
                    'PINDAH'
                ]
            ])
            D = parseInt(worksheet.cell('D' + input_row).value())
            E = parseInt(worksheet.cell('E' + last_row).value())

            worksheet.cell('D' + input_row).style("numberFormat", "0.00");
            worksheet.cell('E' + input_row).value(E - D)
            return workbook
        })
        .then(async workbook => {
            // penerima
            var worksheet = workbook.sheet(data.bank_penerima)
            var last_row = await get_last_row(worksheet)
            var input_row = last_row + 1
            worksheet.cell('A' + input_row).value([
                [
                    moment().format('DD/MM/YYYY hh:mm A'),
                    data.bank_pengirim,
                    parseInt(data.jumlah_dana),
                    '',
                    '',
                    'PINDAH'
                ]
            ])
            // =E13+C14+D14
            // formula mutasi
            C = parseInt(worksheet.cell('C' + input_row).value())
            E = parseInt(worksheet.cell('E' + last_row).value())

            worksheet.cell('C' + input_row).style("numberFormat", "0.00")
            worksheet.cell('E' + input_row).value(C + E)
            return workbook
        })
        .then((workbook) => {
            return save_excel(workbook, 1);
        })
}

module.exports = {
    read_bank_name_form_excel: () => {
        return read_bank_name_form_excel()
    },
    option_bank: () => {
        return option_bank()
    },
    macro_input: async () => {
        return macro_input()
    },
    macro_input_pindah_dana: async () => {
        return macro_input_pindah_dana()
    },
    get_last_mutasi: async () => {
        return get_last_mutasi()
    },
    init: () => {
        return read_excel()
    },
    check_open: () => {
        return read_excel().then(workbook => {
            return save_excel(workbook, 1);
        })
    }
}