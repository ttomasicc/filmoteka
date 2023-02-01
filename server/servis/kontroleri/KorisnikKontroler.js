const KorisnikRepozitorij = require('../repozitoriji/KorisnikRepozitorij.js');
const ZauzetoError = require('../errors/ZauzetoError.js');

class KorisnikKontroler {
    #korisnikRepozitorij;

    constructor() {
        this.#korisnikRepozitorij = new KorisnikRepozitorij();
    }

    getKorisnici(zahtjev, odgovor) {
        this.#korisnikRepozitorij
            .dohvatiSve()
            .then(korisnici => {
                korisnici.length !== 0 ? odgovor.send(JSON.stringify(korisnici))
                    : odgovor.status(204).send();
            })
            .catch(_ => odgovor.status(404).send(JSON.stringify({greska: 'Nema resursa.'})));
    }

    postKorisnici(zahtjev, odgovor) {
        const korisnik = zahtjev.body;
        this.#dodajKorisnika(korisnik)
            .then(_ => odgovor.status(201).send())
            .catch(err => {
                if (err instanceof ZauzetoError) {
                    odgovor.status(409).send(JSON.stringify({greska: err.message}))
                } else {
                    odgovor.status(404).send(JSON.stringify({greska: 'Nema resursa.'}))
                }
            });
    }

    putKorisnici(zahtjev, odgovor) {
        odgovor
            .status(501)
            .send(JSON.stringify({greska: 'Metoda nije implementirana.'}));
    }

    deleteKorisnici(zahtjev, odgovor) {
        odgovor
            .status(501)
            .send(JSON.stringify({greska: 'Metoda nije implementirana.'}));
    }

    getKorisnik(zahtjev, odgovor) {
        const korime = zahtjev.params.korime;
        this.#korisnikRepozitorij
            .dohvati(korime)
            .then(korisnik => {
                korisnik ? odgovor.send(JSON.stringify(korisnik)) :
                    odgovor.status(404).send(JSON.stringify({greska: 'Korisnik nije pronađen.'}));
            })
            .catch(_ => odgovor.status(404).send(JSON.stringify({greska: 'Nema resursa.'})));
    }

    postKorisnik(zahtjev, odgovor) {
        odgovor
            .status(405)
            .send(JSON.stringify({greska: 'Metoda nije dopuštena.'}));
    }

    putKorisnik(zahtjev, odgovor) {
        const korisnik = {
            korime: zahtjev.params.korime,
            ...zahtjev.body
        }

        this.#korisnikRepozitorij
            .azuriraj(korisnik)
            .then(uspjeh => {
                uspjeh ? odgovor.send() :
                    odgovor.status(404).send(JSON.stringify({greska: 'Nema resursa.'}));
            })
            .catch(_ => odgovor.status(404).send(JSON.stringify({greska: 'Nema resursa.'})));
    }

    deleteKorisnik(zahtjev, odgovor) {
        odgovor
            .status(501)
            .send(JSON.stringify({greska: 'Metoda nije implementirana.'}));
    }

    getKorisnikPrijava(zahtjev, odgovor) {
        odgovor
            .status(501)
            .send(JSON.stringify({greska: 'Metoda nije implementirana.'}));
    }

    postKorisnikPrijava(zahtjev, odgovor) {
        const korime = zahtjev.params.korime;
        const lozinka = zahtjev.body.lozinka;

        if (lozinka) {
            this.#korisnikRepozitorij
                .dohvati(korime)
                .then(korisnik => {
                    if (korisnik !== null && korisnik.lozinka === lozinka) {
                        odgovor.send(JSON.stringify(korisnik));
                    } else {
                        odgovor
                            .status(401)
                            .send(JSON.stringify({greska: 'Krivi podaci.'}));
                    }
                })
                .catch(_ => odgovor.status(404).send(JSON.stringify({greska: 'Nema resursa..'})));
        } else {
            odgovor.status(417).send(JSON.stringify({greska: 'Neočekivani podaci.'}));
        }
    }

    putKorisnikPrijava(zahtjev, odgovor) {
        odgovor
            .status(501)
            .send(JSON.stringify({greska: 'Metoda nije implementirana.'}));
    }

    deleteKorisnikPrijava(zahtjev, odgovor) {
        odgovor
            .status(501)
            .send(JSON.stringify({greska: 'Metoda nije implementirana.'}));
    }

    async #dodajKorisnika(korisnik) {
        const postojiKorime = await this.#korisnikRepozitorij.postoji(korisnik.korime);
        if (postojiKorime) {
            throw new ZauzetoError(`Korisničko ime '${korisnik.korime}' je zauzeto.`);
        } else {
            const postojiEmail = await this.#korisnikRepozitorij.postojiEmail(korisnik.email);
            if (postojiEmail) {
                throw new ZauzetoError(`Korisnik s emailom '${korisnik.email}' već postoji.`);
            } else {
                this.#korisnikRepozitorij.dodaj(korisnik);
            }
        }
    }
}

module.exports = KorisnikKontroler;