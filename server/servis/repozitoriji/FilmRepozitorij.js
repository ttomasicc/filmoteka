const Baza = require('../baza/Baza.js');
const FilmZanrRepozitorij = require('./FilmZanrRepozitorij.js');

class FilmRepozitorij {
    #baza;
    #filmZanrRepozitorij;

    constructor() {
        this.#baza = new Baza();
        this.#filmZanrRepozitorij = new FilmZanrRepozitorij();
    }

    async dohvatiSve(parametri) {
        const sql = this.#pripremiSQLUpit(parametri);

        const podaci = await this.#baza.izvrsiUpit(sql, []);

        return podaci.map(podatak => podatak.film_id);
    }

    async dohvati(id) {
        const sql = 'SELECT * FROM `film` WHERE `id` = ?';

        const podaci = await this.#baza.izvrsiUpit(sql, [id]);

        if (podaci.length === 1) {
            return podaci[0];
        } else {
            return null;
        }
    }

    async dodaj(film, korisnik) {
        const sql = 'INSERT OR IGNORE INTO `film`' +
            '(`id_korisnik`, `id_tmdb`, `id_imdb`,' +
            '`putanja_pozadina`, `putanja_plakat`,' +
            '`odrastao`, `video`,' +
            '`budzet`, `stranica`,' +
            '`izvor_jezik`, `izvor_naslov`,' +
            '`naslov`, `slogan`, `sazetak`,' +
            '`prihod`, `trajanje`,' +
            '`datum_izdavanja`,' +
            '`glasaci_ocjena`, `glasaci_broj`,' +
            '`popularnost`, `status`) ' +
            'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
        const podaci = [
            korisnik, film.id, film.imdb_id,
            film.backdrop_path, film.poster_path,
            film.adult, film.video,
            film.budget, film.homepage,
            film.original_language, film.original_title,
            film.title, film.tagline, film.overview,
            film.revenue, film.runtime, film.release_date,
            film.vote_average, film.vote_count,
            film.popularity, film.status
        ];

        const rezultat = await this.#baza.izvrsiUpit(sql, podaci);
        return rezultat.lastID;
    }

    async azuriraj(film) {
        const sql = 'UPDATE `film` SET ' +
            '`odobren` = COALESCE(?,`odobren`), ' +
            '`budzet` = COALESCE(?,`budzet`), ' +
            '`stranica` = COALESCE(?,`stranica`), ' +
            '`naslov` = COALESCE(?,`naslov`), ' +
            '`slogan` = COALESCE(?,`slogan`), ' +
            '`sazetak` = COALESCE(?,`sazetak`), ' +
            '`prihod` = COALESCE(?,`prihod`), ' +
            '`datum_izdavanja` = COALESCE(?,`datum_izdavanja`), ' +
            '`glasaci_ocjena` = COALESCE(?,`glasaci_ocjena`), ' +
            '`glasaci_broj` = COALESCE(?,`glasaci_broj`), ' +
            '`popularnost` = COALESCE(?,`popularnost`), ' +
            '`status` = COALESCE(?,`status`) ' +
            'WHERE id = ?';
        const podaci = [
            film.odobren,
            film.budzet,
            film.stranica,
            film.naslov,
            film.slogan,
            film.sazetak,
            film.prihod,
            film.datum_izdavanja,
            film.glasaci_ocjena,
            film.glasaci_broj,
            film.popularnost,
            film.status,
            film.id
        ];

        const rezultat = await this.#baza.izvrsiUpit(sql, podaci);
        return rezultat.changes;
    }

    async obrisi(id) {
        await this.#filmZanrRepozitorij.obrisiFilm(id);

        const sql = 'DELETE FROM `film` WHERE `id` = ?';

        const rezultat = await this.#baza.izvrsiUpit(sql, [id]);
        return rezultat.changes;
    }

    #pripremiSQLUpit(parametri) {
        const sqlPredlozak = `
            SELECT tablica.film_id FROM (
                SELECT f.id AS film_id, ROW_NUMBER() OVER ( PARTITION BY f.id ORDER BY z.opis) AS pojava
                    FROM film AS f
                        LEFT JOIN film_zanr AS fz ON f.id = fz.film_id
                        LEFT JOIN zanr AS z ON fz.zanr_id = z.id
                            WHERE #odobren
                                AND #datum_unosa
                                AND #zanr_id
                                AND #naziv_filma
                            #sort) AS tablica
            WHERE tablica.pojava = 1
            LIMIT #limit
            OFFSET #offset;
        `.trim();

        const odobrenPredlozak = '`f`.`odobren` = #';
        const datumUnosaPredlozak = '`f`.`datum_unosa` >= DATE(\'#\')';
        const zanrIdPredlozak = '`z`.`id` = #';
        const nazivFilmaPredlozak = 'LOWER(`f`.`naslov`) LIKE LOWER(\'%#%\')';

        let sql = this.#postaviLimitOffset(parametri, sqlPredlozak);

        sql = sql.replace('#odobren', odobrenPredlozak.replace('#', parametri.odobren));

        parametri.datum ? sql = sql.replace('#datum_unosa', datumUnosaPredlozak.replace('#', parametri.datum))
            : sql = sql.replace('#datum_unosa', '1');

        parametri.zanrId ? sql = sql.replace('#zanr_id', zanrIdPredlozak.replace('#', parametri.zanrId))
            : sql = sql.replace('#zanr_id', '1');

        parametri.nazivFilma ? sql = sql.replace('#naziv_filma', nazivFilmaPredlozak.replace('#', parametri.nazivFilma))
            : sql = sql.replace('#naziv_filma', '1');

        sql = this.#postaviSortParametar(parametri, sql);

        return sql;
    }

    #postaviLimitOffset(parametri, sql) {
        const limit = parseInt(parametri.brojFilmova);
        const offset = (parseInt(parametri.stranica) - 1) * limit;

        return sql.replace('#limit', limit).replace('#offset', offset);
    }

    #postaviSortParametar(parametri, sql) {
        if (parametri.sort) {
            switch (parametri.sort.toLowerCase()) {
                case 'd':
                    return sql.replace('#sort', 'ORDER BY `f`.`datum_unosa`')
                case 'n':
                    return sql.replace('#sort', 'ORDER BY `f`.`naslov`');
                case 'z':
                    return sql.replace('#sort', 'ORDER BY `z`.`opis`');
                default:
                    return sql.replace('#sort', '');
            }
        } else {
            return sql.replace('#sort', '')
        }
    }
}

module.exports = FilmRepozitorij;