const Baza = require('../baza/Baza.js');

class ZanrRepozitorij {
    #baza;

    constructor() {
        this.#baza = new Baza();
    }

    async dohvatiSve() {
        const sql = 'SELECT * FROM `zanr` ORDER BY `opis` ASC';

        const rezultat = await this.#baza.izvrsiUpit(sql, []);
        return rezultat;
    }

    async dohvati(id) {
        const sql = 'SELECT * FROM `zanr` WHERE `id` = ?';

        const rezultat = await this.#baza.izvrsiUpit(sql, [id]);

        if (rezultat.length === 1) {
            return rezultat[0];
        } else {
            return null;
        }
    }

    async dohvatiTMDB(id) {
        const sql = 'SELECT * FROM `zanr` WHERE `id_tmdb` = ?';

        const rezultat = await this.#baza.izvrsiUpit(sql, [id]);

        if (rezultat.length === 1) {
            return rezultat[0];
        } else {
            return null;
        }
    }

    async dohvatiZaFilm(id) {
        const sql = 'SELECT `id`, `opis` FROM `zanr` WHERE `id` IN ' +
            '(SELECT `zanr_id` FROM `film_zanr` WHERE `film_id` = ?) ' +
            'ORDER BY `opis`';

        const rezultat = await this.#baza.izvrsiUpit(sql, [id]);
        return rezultat;
    }

    async dodaj(zanr) {
        const sql = 'INSERT INTO `zanr`(`id_tmdb`, `opis`) VALUES (?,?)';
        const podaci = [zanr.id_tmdb, zanr.opis];

        let rezultat;
        try {
            rezultat = await this.#baza.izvrsiUpit(sql, podaci);
        } catch (err) {
            return 0;
        }

        return rezultat.lastID;
    }

    async azuriraj(zanr) {
        const sql = 'UPDATE `zanr` SET `opis` = COALESCE(?, `opis`) WHERE `id` = ?';
        const podaci = [zanr.opis, zanr.id];

        const rezultat = await this.#baza.izvrsiUpit(sql, podaci);
        return rezultat.changes === 1;
    }

    async obrisi(id) {
        const sql = 'DELETE FROM `zanr` WHERE `id` = ?';

        const rezultat = await this.#baza.izvrsiUpit(sql, [id]);
        return rezultat.changes === 1;
    }

    async obrisiNekoristene() {
        const sql = 'DELETE FROM `zanr` WHERE `id` NOT IN (SELECT DISTINCT `zanr_id` FROM `film_zanr`)';

        const rezultat = await this.#baza.izvrsiUpit(sql, []);
        return rezultat.changes === 1;
    }
}

module.exports = ZanrRepozitorij;