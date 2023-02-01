const express = require('express');
const cors = require('cors');

const KonfigParser = require('./moduli/KonfigParser.js');
const NepotuniPodatakError = require('./errors/NepotpuniPodatakError.js');

const FilmKontroler = require('./kontroleri/FilmKontroler.js');
const ZanrKontroler = require('./kontroleri/ZanrKontroler.js');
const KorisnikKontroler = require('./kontroleri/KorisnikKontroler.js');
const TMDBKontroler = require('./kontroleri/TMDBKontroler.js');

const authServis = require('./servisi/authServis.js');

const server = express();

const konfigParser = new KonfigParser();
konfigParser.ucitajKonfiguraciju()
    .then((konfig) => {
        console.info('\u2713 Konfiguracija očitana');
        pokreniServer(konfig['rest.port'], konfig['app.port']);
    })
    .catch(err => {
        ispisiGresku(err);
        process.exit();
    });

function pokreniServer(port, appPort) {
    server.use(express.urlencoded({extended: true}));
    server.use(express.json());

    server.use(cors({
        credentials: true,
        origin: [
            `http://localhost:${appPort}`,
            `http://localhost:4200`
        ]
    }));

    pripremiResurse();

    server.use((zahtjev, odgovor) => {
        odgovor
            .status(404)
            .send(JSON.stringify({greska: 'Nema resursa.'}));
    });

    server.listen(port, () =>
        console.info(`\u2713 Server pokrenut na portu: ${port}`)
    );
}

function pripremiResurse() {
    pripremiResursFilm();
    pripremiResursZanr();
    pripremiResursKorisnik();
    pripremiTMDBAPI();
}

function pripremiResursFilm() {
    const filmKontroler = new FilmKontroler(konfigParser.dohvatiKonfig()['tmdb.apikey.v3']);
    server.get('/api/filmovi/:id',
        [authServis.autentificiraj, authServis.autorizirajKorisnik],
        filmKontroler.getFilm.bind(filmKontroler));
    server.post('/api/filmovi/:id',
        [authServis.autentificiraj],
        filmKontroler.postFilm.bind(filmKontroler));
    server.put('/api/filmovi/:id',
        [authServis.autentificiraj, authServis.autorizirajAdmin],
        filmKontroler.putFilm.bind(filmKontroler));
    server.delete('/api/filmovi/:id',
        [authServis.autentificiraj, authServis.autorizirajAdmin],
        filmKontroler.deleteFilm.bind(filmKontroler));

    server.get('/api/filmovi',
        filmKontroler.getFilmovi.bind(filmKontroler));
    server.post('/api/filmovi',
        [authServis.autentificiraj, authServis.autorizirajKorisnik],
        filmKontroler.postFilmovi.bind(filmKontroler));
    server.put('/api/filmovi',
        [authServis.autentificiraj],
        filmKontroler.putFilmovi.bind(filmKontroler));
    server.delete('/api/filmovi',
        [authServis.autentificiraj],
        filmKontroler.deleteFilmovi.bind(filmKontroler));
}

function pripremiResursZanr() {
    const zanrKontroler = new ZanrKontroler();
    server.get('/api/zanr',
        zanrKontroler.getZanrovi.bind(zanrKontroler));
    server.post('/api/zanr',
        [authServis.autentificiraj, authServis.autorizirajAdmin],
        zanrKontroler.postZanrovi.bind(zanrKontroler));
    server.put('/api/zanr',
        [authServis.autentificiraj],
        zanrKontroler.putZanrovi.bind(zanrKontroler));
    server.delete('/api/zanr',
        [authServis.autentificiraj, authServis.autorizirajAdmin],
        zanrKontroler.deleteZanrovi.bind(zanrKontroler));

    server.get('/api/zanr/:id',
        [authServis.autentificiraj],
        zanrKontroler.getZanr.bind(zanrKontroler));
    server.post('/api/zanr/:id',
        [authServis.autentificiraj],
        zanrKontroler.postZanr.bind(zanrKontroler));
    server.put('/api/zanr/:id',
        [authServis.autentificiraj, authServis.autorizirajAdmin],
        zanrKontroler.putZanr.bind(zanrKontroler));
    server.delete('/api/zanr/:id',
        [authServis.autentificiraj, authServis.autorizirajAdmin],
        zanrKontroler.deleteZanr.bind(zanrKontroler));
}

function pripremiResursKorisnik() {
    const korisnikKontroler = new KorisnikKontroler();
    server.get('/api/korisnici',
        [authServis.autentificiraj, authServis.autorizirajAdmin],
        korisnikKontroler.getKorisnici.bind(korisnikKontroler));
    server.post('/api/korisnici',
        korisnikKontroler.postKorisnici.bind(korisnikKontroler));
    server.put('/api/korisnici',
        [authServis.autentificiraj],
        korisnikKontroler.putKorisnici.bind(korisnikKontroler));
    server.delete('/api/korisnici',
        [authServis.autentificiraj],
        korisnikKontroler.deleteKorisnici.bind(korisnikKontroler));

    server.get('/api/korisnici/:korime',
        korisnikKontroler.getKorisnik.bind(korisnikKontroler));
    server.post('/api/korisnici/:korime',
        [authServis.autentificiraj],
        korisnikKontroler.postKorisnik.bind(korisnikKontroler));
    server.put('/api/korisnici/:korime',
        [authServis.autentificiraj, authServis.autorizirajKorisnik],
        korisnikKontroler.putKorisnik.bind(korisnikKontroler));
    server.delete('/api/korisnici/:korime',
        [authServis.autentificiraj],
        korisnikKontroler.deleteKorisnik.bind(korisnikKontroler));

    server.get('/api/korisnici/:korime/prijava',
        [authServis.autentificiraj],
        korisnikKontroler.getKorisnikPrijava.bind(korisnikKontroler));
    server.post('/api/korisnici/:korime/prijava',
        korisnikKontroler.postKorisnikPrijava.bind(korisnikKontroler));
    server.put('/api/korisnici/:korime/prijava',
        [authServis.autentificiraj],
        korisnikKontroler.putKorisnikPrijava.bind(korisnikKontroler));
    server.delete('/api/korisnici/:korime/prijava',
        [authServis.autentificiraj],
        korisnikKontroler.deleteKorisnikPrijava.bind(korisnikKontroler));
}

function pripremiTMDBAPI() {
    const tmdbKontroler = new TMDBKontroler(konfigParser.dohvatiKonfig()['tmdb.apikey.v3']);
    server.get('/api/tmdb/zanr',
        [authServis.autentificiraj, authServis.autorizirajAdmin],
        tmdbKontroler.getZanrovi.bind(tmdbKontroler));
    server.post('/api/tmdb/zanr',
        [authServis.autentificiraj],
        tmdbKontroler.postZanrovi.bind(tmdbKontroler));
    server.put('/api/tmdb/zanr',
        [authServis.autentificiraj],
        tmdbKontroler.putZanrovi.bind(tmdbKontroler));
    server.delete('/api/tmdb/zanr',
        [authServis.autentificiraj],
        tmdbKontroler.deleteZanrovi.bind(tmdbKontroler));

    server.get('/api/tmdb/filmovi',
        [authServis.autentificiraj, authServis.autorizirajKorisnik],
        tmdbKontroler.getFilmovi.bind(tmdbKontroler));
    server.post('/api/tmdb/filmovi',
        [authServis.autentificiraj],
        tmdbKontroler.postFilmovi.bind(tmdbKontroler));
    server.put('/api/tmdb/filmovi',
        [authServis.autentificiraj],
        tmdbKontroler.putFilmovi.bind(tmdbKontroler));
    server.delete('/api/tmdb/filmovi',
        [authServis.autentificiraj],
        tmdbKontroler.deleteFilmovi.bind(tmdbKontroler));
}

function ispisiGresku(err) {
    if (process.argv.length === 2) {
        console.error('\u2715 Nedostaje konfiguracija.');
    } else {
        if (err instanceof NepotuniPodatakError)
            console.error(err.message);
        else {
            console.error('\u2715 Nemoguće pročitati konfiguraciju:');
            console.error(err);
        }
    }
}