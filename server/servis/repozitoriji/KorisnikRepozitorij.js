const Baza = require('../baza/Baza.js');

class KorisnikRepozitorij {
    #baza;

    constructor() {
        this.#baza = new Baza();
    }

    async postoji(korime) {
        const sql = 'SELECT `id` FROM `korisnik` WHERE `korime` = ?';

        const rezultat = await this.#baza.izvrsiUpit(sql, [korime]);
        return rezultat.length === 1;
    }

    async postojiEmail(email) {
        const sql = 'SELECT `id` FROM `korisnik` WHERE `email` = ?';

        const rezultat = await this.#baza.izvrsiUpit(sql, [email]);
        return rezultat.length === 1;
    }

    async dohvatiSve() {
        const sql = 'SELECT * FROM `korisnik`';

        const rezultat = await this.#baza.izvrsiUpit(sql, []);
        return rezultat;
    }

    async dodaj(korisnik) {
        const sql = 'INSERT INTO `korisnik`' +
            '(`id_uloga`, `id_status`, `ime`, `prezime`, `korime`, `email`, `lozinka`) ' +
            'VALUES (?,?,?,?,LOWER(?),?,?)';
        const podaci = [2, 1, korisnik.ime, korisnik.prezime, korisnik.korime, korisnik.email, korisnik.lozinka];

        const rezultat = await this.#baza.izvrsiUpit(sql, podaci);
        return rezultat.lastID;
    }

    async azuriraj(korisnik) {
        const sql = 'UPDATE `korisnik` SET ' +
            '`ime` = COALESCE(?, `ime`), ' +
            '`prezime` = COALESCE(?, `prezime`), ' +
            '`lozinka` = COALESCE(?, `lozinka`) ' +
            'WHERE `korime` = ?';
        const podaci = [korisnik.ime, korisnik.prezime, korisnik.lozinka, korisnik.korime];

        const rezultat = await this.#baza.izvrsiUpit(sql, podaci);
        return rezultat.changes === 1;
    }

    async dohvati(korime) {
        const sql = 'SELECT * FROM `korisnik` WHERE `korime` = ?;'

        const rezultat = await this.#baza.izvrsiUpit(sql, [korime]);

        if (rezultat.length === 1) {
            return rezultat[0];
        } else {
            return null;
        }
    }

    async dohvatiPoId(id) {
        const sql = 'SELECT `id`, `ime`, `prezime`, `korime`, `email` FROM `korisnik` WHERE `id` = ?;'

        const rezultat = await this.#baza.izvrsiUpit(sql, [id]);

        if (rezultat.length === 1) {
            return rezultat[0];
        } else {
            return null;
        }
    }
}

module.exports = KorisnikRepozitorij;