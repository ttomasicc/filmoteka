const FilmRepozitorij = require('../repozitoriji/FilmRepozitorij.js');
const FilmZanrRepozitorij = require('../repozitoriji/FilmZanrRepozitorij.js');
const ZanrRepozitorij = require('../repozitoriji/ZanrRepozitorij.js');
const KorisnikRepozitorij = require('../repozitoriji/KorisnikRepozitorij.js');
const TMDBServis = require('../servisi/TMDBServis.js');
const jwt = require('../moduli/jwt.js');

class FilmKontroler {
    #filmRepozitorij;
    #filmZanrRepozitorij;
    #zanrRepozitorij;
    #korisnikRepozitorij;
    #tmdbServis;

    constructor(apiKljuc) {
        this.#filmRepozitorij = new FilmRepozitorij();
        this.#filmZanrRepozitorij = new FilmZanrRepozitorij();
        this.#zanrRepozitorij = new ZanrRepozitorij();
        this.#korisnikRepozitorij = new KorisnikRepozitorij();
        this.#tmdbServis = new TMDBServis(apiKljuc);
    }

    getFilmovi(zahtjev, odgovor) {
        const stranica = zahtjev.query.stranica;
        const brojFilmova = zahtjev.query.brojFilmova;

        if (stranica === undefined || brojFilmova === undefined) {
            odgovor
                .status(417)
                .send(JSON.stringify({greska: 'Neočekivani podaci.'}));
        } else {
            this.#obradiFilmove(zahtjev, odgovor);
        }
    }

    postFilmovi(zahtjev, odgovor) {
        const filmId = zahtjev.body.id;

        if (filmId === undefined) {
            odgovor
                .status(417)
                .send(JSON.stringify({greska: 'Neočekivani podaci.'}));
        } else {
            this.#obradiFilm(zahtjev, odgovor)
                .catch(err => {
                    odgovor
                        .status(409)
                        .send(JSON.stringify({greska: err.message}));
                });
        }
    }

    putFilmovi(zahtjev, odgovor) {
        odgovor
            .status(501)
            .send(JSON.stringify({greska: 'Metoda nije implementirana.'}));
    }

    deleteFilmovi(zahtjev, odgovor) {
        odgovor
            .status(501)
            .send(JSON.stringify({greska: 'Metoda nije implementirana.'}));
    }

    getFilm(zahtjev, odgovor) {
        this.#filmRepozitorij
            .dohvati(zahtjev.params.id)
            .then(film => {
                if (film) {
                    this.#zanrRepozitorij.dohvatiZaFilm(film.id)
                        .then(zanrovi => {
                            film.zanrovi = zanrovi;

                            this.#korisnikRepozitorij.dohvatiPoId(film['id_korisnik'])
                                .then(korisnik => {
                                    film.korisnik = korisnik;
                                    delete film['id_korisnik'];
                                    odgovor.send(JSON.stringify(film));
                                });
                        });
                } else {
                    odgovor.status(204).send();
                }
            })
            .catch(_ => odgovor.status(404).send(JSON.stringify({greska: 'Nema resursa.'})));
    }

    postFilm(zahtjev, odgovor) {
        odgovor
            .status(405)
            .send(JSON.stringify({greska: 'Metoda nije dopuštena.'}));
    }

    putFilm(zahtjev, odgovor) {
        const film = {
            id: zahtjev.params.id,
            ...zahtjev.body
        };

        this.#filmRepozitorij
            .azuriraj(film)
            .then(redovi => {
                if (redovi !== 0) {
                    odgovor.send();
                } else {
                    odgovor.status(404).send(JSON.stringify({greska: 'Film nije pronađen.'}));
                }
            })
            .catch(_ => odgovor.status(404).send(JSON.stringify({greska: 'Nema resursa.'})));
    }

    deleteFilm(zahtjev, odgovor) {
        this.#filmRepozitorij
            .obrisi(zahtjev.params.id)
            .then(redovi => {
                if (redovi !== 0) {
                    odgovor.send();
                } else {
                    odgovor.status(404).send(JSON.stringify({greska: 'Film nije pronađen.'}));
                }
            })
            .catch(_ => odgovor.status(404).send(JSON.stringify({greska: 'Nema resursa.'})));
    }

    async #obradiFilmove(zahtjev, odgovor) {
        const parametri = Object.fromEntries(
            Object.entries({
                stranica: zahtjev.query.stranica,
                brojFilmova: zahtjev.query.brojFilmova,
                datum: zahtjev.query.datum ? zahtjev.query.datum : '',
                zanrId: zahtjev.query.zanr ? zahtjev.query.zanr : '',
                nazivFilma: zahtjev.query.naziv ? zahtjev.query.naziv : '',
                sort: zahtjev.query.sortiraj ? zahtjev.query.sortiraj : '',
                odobren: zahtjev.query.odobren === undefined ? 1 : zahtjev.query.odobren
            }).filter(([_, v]) => v !== '')
        );

        const filmIds = await this.#filmRepozitorij.dohvatiSve(parametri);
        const filmovi = await this.#dohvatiFilmovePremaIds(filmIds);

        if (filmovi.length !== 0) {
            odgovor.status(200).send(JSON.stringify(filmovi));
        } else {
            odgovor.status(204).send();
        }
    }

    async #dohvatiFilmovePremaIds(filmIds) {
        const filmovi = [];
        for (const id of filmIds) {
            const film = await this.#filmRepozitorij.dohvati(id);
            film.zanrovi = await this.#zanrRepozitorij.dohvatiZaFilm(id);
            film.korisnik = await this.#korisnikRepozitorij.dohvatiPoId(film['id_korisnik']);
            delete film['id_korisnik'];
            filmovi.push(film);
        }
        return filmovi;
    }

    async #obradiFilm(zahtjev, odgovor) {
        const korisnikId = jwt.dajTijelo(zahtjev.headers.authorization.split(' ')[1]).id;
        const podaci = await this.#tmdbServis.dohvatiFilm(zahtjev.body.id);

        if (podaci.success === false) {
            odgovor.status(404).send(JSON.stringify(podaci));
        } else {
            const filmId = await this.#dodajFilm(podaci, korisnikId);
            odgovor
                .status(201)
                .send(JSON.stringify({id: filmId}));
        }
    }

    async #dodajFilm(film, korisnik) {
        const noviFilmId = await this.#filmRepozitorij.dodaj(film, korisnik);
        if (noviFilmId === 0) {
            throw new Error('Film već postoji.');
        }

        const zanroviIds = await this.#dodajZanrove(film.genres);

        for (const zanrId of zanroviIds) {
            await this.#filmZanrRepozitorij.dodaj(noviFilmId, zanrId);
        }
        return noviFilmId;
    }

    async #dodajZanrove(zanrovi) {
        let ids = [];
        for (const genre of zanrovi) {
            const zanr = {
                'id_tmdb': genre.id,
                'opis': genre.name
            };
            const id = await this.#zanrRepozitorij.dodaj(zanr);
            id !== 0 ? ids.push(id) :
                ids.push((await this.#zanrRepozitorij.dohvatiTMDB(genre.id)).id);
        }
        return ids;
    }
}

module.exports = FilmKontroler;