// @ts-ignore
import {tajniKljucSesija} from '../../konstante.js';
import {KonfigParser} from './moduli/KonfigParser';
import {NepotpuniPodatakError} from './errors/NepotpuniPodatakError';
import express, {Application} from 'express';
import sesija from 'express-session';
import kolacici from 'cookie-parser';
import path from 'path';

import * as authServis from './servisi/authServis';
import * as korisnikServis from './servisi/korisnikServis';
import * as filmServis from './servisi/filmServis';

declare module 'express-session' {
    interface SessionData {
        jwt: string | null;
    }
}

const server: Application = express();

let bazicniAPIURL: string = '';
new KonfigParser().ucitajKonfiguraciju()
    .then((konfig) => {
        bazicniAPIURL = `http://localhost:${konfig['rest.port']}/api/`;
        console.info('\u2713 Konfiguracija očitana');
        testirajAPI()
            .then(() => {
                console.info('\u2713 REST servis testiran');
                pokreniServer(konfig['app.port']);
            })
            .catch(err => console.error(`\u2715 ${err.message}`));
    })
    .catch((err) => {
        ispisiGresku(err);
    });

async function testirajAPI(): Promise<void> {
    let odgovor: Response;
    try {
        odgovor = await fetch(`${bazicniAPIURL}zanr`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
    } catch (err) {
        throw new Error('REST servis ne radi.');
    }

    if (!odgovor.ok) {
        const poruka: { greska: string } = await odgovor.json();
        throw new Error(`REST servis: ${poruka.greska}`);
    }
}

function pokreniServer(port: number) {
    server.use(express.urlencoded({extended: true}));
    server.use(express.json());
    server.use(kolacici());
    server.use(sesija({
        secret: tajniKljucSesija,
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 24
        }
    }));

    pripremiResurse();

    server.use('/', express.static(path.join(__dirname, '..', 'angular')));
    server.use('/posteri', express.static(path.join(__dirname, '..', 'staticno', 'posteri')));
    server.use('/slike', express.static(path.join(__dirname, '..', 'staticno', 'slike')));
    server.use((zahtjev, odgovor) => odgovor.status(200).redirect('/'));

    server.listen(port, () =>
        console.info(`\u2713 Server pokrenut na portu: ${port}`)
    );
}

function pripremiResurse(): void {
    pripremiKorisnikResurs();
    pripremiFilmResurs();
}

function pripremiFilmResurs() {
    server.put('/api/filmovi/:id',
        [authServis.autentificiraj, authServis.autorizirajAdmin],
        filmServis.putFilm);
    server.get('/api/slike/:id',
        [authServis.autentificiraj, authServis.autorizirajKorisnik],
        filmServis.getSlike);
    server.post('/api/slike',
        [authServis.autentificiraj, authServis.autorizirajKorisnik],
        filmServis.postaviSliku);
}

function pripremiKorisnikResurs() {
    server.post('/api/korisnici/registracija', korisnikServis.registracija);
    server.post('/api/korisnici/prijava', korisnikServis.prijava);
    server.get('/api/korisnici/odjava', korisnikServis.odjava);

    server.get('/api/jwt', korisnikServis.getJWT);
    server.get('/api/jwt/uloga', korisnikServis.getJWTUloga);

    server.get('/api/korisnici/trenutno',
        [authServis.autentificiraj, authServis.autorizirajKorisnik],
        korisnikServis.getKorisnik);
    server.put('/api/korisnici/trenutno',
        [authServis.autentificiraj, authServis.autorizirajKorisnik],
        korisnikServis.putKorisnik);
}

function ispisiGresku(err: any) {
    if (process.argv.length === 2) {
        console.error('\u2715 Nedostaje konfiguracija.');
    } else {
        if (err instanceof NepotpuniPodatakError)
            console.error(err.message);
        else {
            console.error('\u2715 Nemoguće pročitati konfiguraciju:');
            console.error(err);
        }
    }
}