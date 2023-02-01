const TMDBServis = require('../servisi/TMDBServis.js');

class TMDBKontroler {
    #tmdbServis;

    constructor(apiKljuc) {
        this.#tmdbServis = new TMDBServis(apiKljuc);
    }

    getZanrovi(zahtjev, odgovor) {
        this.#tmdbServis
            .dohvatiZanrove()
            .then(zanrovi =>
                odgovor.send(zanrovi)
            );
    }

    postZanrovi(zahtjev, odgovor) {
        odgovor
            .status(501)
            .send(JSON.stringify({greska: 'metoda nije implementirana'}));
    }

    putZanrovi(zahtjev, odgovor) {
        odgovor
            .status(501)
            .send(JSON.stringify({greska: 'metoda nije implementirana'}));
    }

    deleteZanrovi(zahtjev, odgovor) {
        odgovor
            .status(501)
            .send(JSON.stringify({greska: 'metoda nije implementirana'}));
    }

    getFilmovi(zahtjev, odgovor) {
        const kljucneRijeci = zahtjev.query.kljucnaRijec;
        const stranica = zahtjev.query.stranica;

        if (kljucneRijeci === undefined || stranica === undefined) {
            odgovor
                .status(417)
                .send(JSON.stringify({greska: 'neočekivani podaci'}));
            return;
        }

        this.#tmdbServis
            .pretraziFilmove(kljucneRijeci, stranica)
            .then(filmovi =>
                odgovor.send(filmovi)
            );
    }

    postFilmovi(zahtjev, odgovor) {
        odgovor
            .status(501)
            .send(JSON.stringify({greska: 'metoda nije implementirana'}));
    }

    putFilmovi(zahtjev, odgovor) {
        odgovor
            .status(501)
            .send(JSON.stringify({greska: 'metoda nije implementirana'}));
    }

    deleteFilmovi(zahtjev, odgovor) {
        odgovor
            .status(501)
            .send(JSON.stringify({greska: 'metoda nije implementirana'}));
    }
}

module.exports = TMDBKontroler;