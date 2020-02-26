var mysql = require('mysql');
var moment = require('moment');

class Database {
    constructor() {
        this.connection = mysql.createPool({
            connectionLimit: 10,
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'dpm'
        });
    }
    search_member(name) {
        return new Promise((resolve, reject) => {
            this.connection.query("SELECT * from `tbl_member` where `NamaMember` like ? AND `isDeleted` = 0", ["%" + name + "%"], (err, rows) => {
                if (err) return reject(err)
                if (rows.length == 0) return reject('user not found')

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
                    'Macro'
                ]
                this.connection.query('INSERT INTO tbl_transaction (TransactionDate, CreateDate, SiteBaseID, Deposit, Withdraw, Bonus, CancelBonus, NoteDepoWD, CreateBy) VALUES(?,?,?,?,?,?,?,?,?)', insert, (err) => {
                    if (err) return reject(err)

                    this.connection.query("select * from `tbl_sitebase` where `MemberID`  = ?", [id_member], (err, rows) => {
                        if (err) return reject(err)

                        let deposit = rows[0].Deposit + data.deposit
                        let withdraw = rows[0].Withdraw + data.withdraw
                        let bonus = rows[0].Bonus + data.bonus
                        let cancel = rows[0].CancelBonus + data.cancel
                        let balance = deposit + bonus - withdraw - cancel

                        let update = [
                            balance,
                            deposit,
                            withdraw,
                            bonus,
                            cancel,
                            rows[0].SiteBaseID
                        ]

                        this.connection.query("UPDATE `tbl_sitebase` SET `Balance` = ?,`Deposit` = ?, `Bonus`=?, `CancelBonus`= ? WHERE SiteBaseID = ?", update, (err) => {
                            if (err) return reject(err)
                            resolve('success input db') ;
                        })

                    })

                });

            })
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
module.exports = Database