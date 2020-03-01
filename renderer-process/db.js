var mysql = require('mysql');
var moment = require('moment');

class Database {
    constructor() {
        let settings = require('electron-settings')
        this.db = settings.get('DB')
        this.connection = mysql.createPool({
            connectionLimit: 10,
            host: this.db.server,
            user: this.db.username,
            password: this.db.password,
            database: this.db.database
        });
    }
    search_member(name) {
        return new Promise((resolve, reject) => {
            this.connection.query("SELECT * from `tbl_member` where `NamaMember` like ? AND `isDeleted` = 0", ["%" + name + "%"], (err, rows) => {
                if (err) return reject(err)
                if (rows.length == 0) return reject('Username tidak ditemukan')

                var res = new Object();
                res.next = true
                if (rows.length > 1) res.next = false
                res.data = rows
                resolve(res);
            });
        });
    }
    _get_SiteBaseID(id_member) {
        return new Promise((resolve, reject) => {
            this.connection.query("SELECT SiteBaseID from `tbl_sitebase` where `MemberID` = ?", [id_member], (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows[0].SiteBaseID);
            });
        });

    }
    insert_trans(id_member, data) {
        return new Promise((resolve, reject) => {
            this._get_SiteBaseID(id_member).then(SiteBaseID => {
                //    get data
                var date = moment().format('YYYY-MM-DD hh:mm:ss')
                let insert = [
                    date,
                    date,
                    SiteBaseID,
                    data.deposit,
                    data.withdraw,
                    data.bonus,
                    data.cancel,
                    data.bank_name,
                    this.db.operator
                ]
                this.connection.query('INSERT INTO tbl_transaction (TransactionDate, CreateDate, SiteBaseID, Deposit, Withdraw, Bonus, CancelBonus, NoteDepoWD, CreateBy) VALUES(?,?,?,?,?,?,?,?,?)', insert, (err) => {
                    if (err) return reject(err)


                    this.connection.query("select * from `tbl_sitebase` where `MemberID`  = ?", [id_member], (err, rows) => {
                        if (err) return reject(err)

                        let deposit = parseInt(rows[0].Deposit) + parseInt(data.deposit)
                        let withdraw = parseInt(rows[0].Withdraw) + parseInt(data.withdraw)
                        let bonus = parseInt(rows[0].Bonus) + parseInt(data.bonus)
                        let cancel = parseInt(rows[0].CancelBonus) + parseInt(data.cancel)
                        let balance = deposit + bonus - withdraw - cancel

                        let update = [
                            balance,
                            deposit,
                            withdraw,
                            bonus,
                            cancel,
                            parseInt(rows[0].SiteBaseID)
                        ]

                        let sql = this.connection.query("UPDATE `tbl_sitebase` SET `Balance` = ?,`Deposit` = ?,`Withdraw` = ?, `Bonus`=?, `CancelBonus`= ? WHERE SiteBaseID = ?", update, (err, results) => {
                            if (err) return reject(err)
                            resolve(true);
                        })
                    })

                });

            })
        });
    }
    test_connection(){
        return new Promise((resolve, reject) => {
            this.connection.getConnection(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}
exports.db = new Database