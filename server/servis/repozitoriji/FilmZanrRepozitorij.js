const Baza = require('../baza/Baza.js');

class FilmZanrRepozitorij {
    #baza;

    constructor() {
        this.#baza = new Baza();
    }

    async dodaj(filmId, zanrId) {
        const sql = 'INSERT INTO `film_zanr`(`film_id`, `zanr_id`) VALUES (?,?)';

        const rezultat = await this.#baza.izvrsiUpit(sql, [filmId, zanrId]);
        return rezultat.changes === 1;
    }

    async obrisiFilm(id) {
        const sql = 'DELETE FROM `film_zanr` WHERE `film_id` = ?';

        const rezultat = await this.#baza.izvrsiUpit(sql, [id]);
        return rezultat.changes === 1;
    }
}

module.exports = FilmZanrRepozitorij;