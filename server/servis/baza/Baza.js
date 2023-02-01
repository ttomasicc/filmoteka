const sqlite3 = require('sqlite3').verbose();

class Baza {
    #konekcija;

    constructor() {
        this.#konekcija = new sqlite3.Database('../baza.sqlite');
    }

    async izvrsiUpit(sql, podaciZaSQL) {
        await this.#konekcija.exec('PRAGMA foreign_keys = ON');

        return new Promise((uspjeh, neuspjeh) => {
            if (/^SELECT/i.test(sql)) {
                this.#konekcija.all(sql, podaciZaSQL, (greska, rezultat) => {
                    greska ? neuspjeh(greska) : uspjeh(rezultat);
                });
            } else {
                this.#konekcija.run(sql, podaciZaSQL, function (greska) {
                    return greska ? neuspjeh(greska) : uspjeh(this);
                });
            }
        });
    }
}

module.exports = Baza;