const ZanrRepozitorij = require('../repozitoriji/ZanrRepozitorij.js');

class ZanrKontroler {
    #zanrRepozitorij;

    constructor() {
        this.#zanrRepozitorij = new ZanrRepozitorij();
    }

    getZanrovi(zahtjev, odgovor) {
        this.#zanrRepozitorij
            .dohvatiSve()
            .then(zanrovi => {
                zanrovi.length !== 0 ? odgovor.send(JSON.stringify(zanrovi))
                    : odgovor.status(204).send();
            })
            .catch(_ => odgovor.status(404).send(JSON.stringify({greska: 'Nema resursa.'})));
    }

    postZanrovi(zahtjev, odgovor) {
        const zanr = zahtjev.body;

        this.#zanrRepozitorij
            .dodaj(zanr)
            .then(odgovor.status(201).send())
            .catch(_ => odgovor.status(404).send(JSON.stringify({greska: 'Nema resursa.'})));
    }

    putZanrovi(zahtjev, odgovor) {
        odgovor
            .status(501)
            .send(JSON.stringify({greska: 'Metoda nije implementirana.'}));
    }

    deleteZanrovi(zahtjev, odgovor) {
        this.#zanrRepozitorij
            .obrisiNekoristene()
            .then(_ => odgovor.send())
            .catch(_ => odgovor.status(404).send(JSON.stringify({greska: 'Nema resursa.'})));
    }

    getZanr(zahtjev, odgovor) {
        const id = zahtjev.params.id;

        this.#zanrRepozitorij
            .dohvati(id)
            .then(zanr => {
                zanr ? odgovor.send(JSON.stringify(zanr)) :
                    odgovor.status(404).send(JSON.stringify({greska: `Žanr nije pronađen.`}));
            })
            .catch(_ => odgovor.status(404).send(JSON.stringify({greska: 'Nema resursa.'})));
    }

    postZanr(zahtjev, odgovor) {
        odgovor
            .status(405)
            .send(JSON.stringify({greska: 'Metoda nije dopuštena.'}));
    }

    putZanr(zahtjev, odgovor) {
        const zanr = {
            id: zahtjev.params.id,
            ...zahtjev.body
        };

        this.#zanrRepozitorij
            .azuriraj(zanr)
            .then(uspjeh => {
                uspjeh ? odgovor.send() :
                    odgovor.status(404).send(JSON.stringify({greska: `Žanr nije pronađen.`}));
            })
            .catch(err => {
                if (err.errno === 19) {
                    odgovor.status(409).send(JSON.stringify({greska: `Žanr ${zanr.opis} već postoji.`}))
                } else {
                    odgovor.status(404).send(JSON.stringify({greska: 'Nema resursa..'}))
                }
            });
    }

    deleteZanr(zahtjev, odgovor) {
        const id = zahtjev.params.id;

        this.#zanrRepozitorij
            .obrisi(id)
            .then(uspjeh => {
                uspjeh ? odgovor.send() :
                    odgovor.status(404).send(JSON.stringify({greska: `Žanr nije pronađen.`}));
            })
            .catch(err => {
                if (err.errno === 1451) {
                    odgovor.status(409).send();
                } else {
                    odgovor.status(404).send(JSON.stringify({greska: 'Nema resursa.'}))
                }
            });
    }
}

module.exports = ZanrKontroler;