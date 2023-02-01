// @ts-ignore
import {tajniKljucGRecaptcha} from '../../../konstante.js';
import {KonfigParser} from '../moduli/KonfigParser';
import * as kodovi from '../moduli/kodovi';
import * as jwt from '../moduli/jwt';
import type {Request, Response} from 'express';

let bazicniAPIURL = '';
new KonfigParser()
    .ucitajKonfiguraciju()
    .then((konfig) => {
        bazicniAPIURL = `http://localhost:${konfig['rest.port']}/api/`;
    });

export const prijava = async function (zahtjev: Request, odgovor: Response) {
    odgovor.type('json');
    await obradiPrijavu(zahtjev, odgovor);
}

export const registracija = async function (zahtjev: Request, odgovor: Response) {
    odgovor.type('json');
    await obradiRegistraciju(zahtjev, odgovor);
}

export const odjava = async function (zahtjev: Request, odgovor: Response) {
    zahtjev.session.jwt = null;
    odgovor.status(204).send();
}

export const getJWT = async function (zahtjev: Request, odgovor: Response) {
    odgovor.type('json');

    if (zahtjev.session.jwt != null) {
        const tijelo = jwt.dajTijelo(zahtjev.session.jwt);
        const token = jwt.kreiraj({
            id: tijelo.id,
            korime: tijelo.korime,
            id_uloga: tijelo.id_uloga
        });
        odgovor.send({token: token});
    } else {
        odgovor.send({token: null});
    }
}

export const getJWTUloga = async function (zahtjev: Request, odgovor: Response) {
    odgovor.type('json');

    if (zahtjev.session.jwt != null) {
        const tijelo = jwt.dajTijelo(zahtjev.session.jwt);
        odgovor.send({uloga: tijelo.id_uloga});
    } else {
        odgovor.send({uloga: 0});
    }
}

export const getKorisnik = async function (zahtjev: Request, odgovor: Response) {
    odgovor.type('json');

    const korisnikJWT = zahtjev.headers.authorization?.split(' ')[1] ?? '';
    const korime = jwt.dajTijelo(korisnikJWT).korime;

    const url = `${bazicniAPIURL}korisnici/${korime}`;
    const rezultat = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${korisnikJWT}`
        }
    });

    const korisnik = await rezultat.json();
    if (rezultat.ok) {
        odgovor.send(korisnik);
    } else {
        odgovor.status(404).send(korisnik.greska);
    }
}

export const putKorisnik = async function (zahtjev: Request, odgovor: Response) {
    odgovor.type('json');

    const korisnik = obradiUlaznePodatke(zahtjev.body);
    if (await provjeriGRecaptchu(korisnik.token)) {
        korisnik.jwt = zahtjev.headers.authorization?.split(' ')[1] ?? '';
        korisnik.korime = jwt.dajTijelo(korisnik.jwt).korime;
        await pokusajAzurirati(korisnik, odgovor);
    } else {
        odgovor.status(403).send({greska: 'Otkrivena sumnjiva aktivnost... pokušaj ponovno kasnije'});
    }
}

async function obradiPrijavu(zahtjev: Request, odgovor: Response) {
    const korisnik = obradiUlaznePodatke(zahtjev.body);

    if (korisnik.korime === undefined ||
        korisnik.lozinka === undefined ||
        korisnik.token === undefined
    ) {
        odgovor.status(417).send({greska: 'Neočekivani podaci'});
        return;
    }

    if (await provjeriGRecaptchu(korisnik.token)) {
        await pokusajPrijaviti(zahtjev, odgovor);
    } else {
        odgovor.status(403).send({greska: 'Otkrivena sumnjiva aktivnost... pokušaj ponovno kasnije'});
    }
}

async function pokusajPrijaviti(zahtjev: Request, odgovor: Response) {
    const korisnik = zahtjev.body;
    korisnik.korime = korisnik.korime.toLowerCase();

    const url = `${bazicniAPIURL}korisnici/${korisnik.korime}`;
    const rezultat = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });

    if (rezultat.ok) {
        const korisnikPodaci = await rezultat.json();

        if (korisnikPodaci.lozinka !== await kodovi.kreirajSHA256(korisnik.lozinka, korisnik.korime + 74)) {
            odgovor.status(401).send({greska: 'Pogrešna lozinka.'});
            return;
        }

        if (korisnikPodaci.id_status !== 1) {
            let greska = 'Provjeri mail za aktivaciju računa.';
            if (korisnikPodaci.id_status === 3) {
                greska = 'Tvoj račun je blokiran. :(';
            }
            odgovor.status(401).send({greska});
            return;
        }

        zahtjev.session.jwt = jwt.kreiraj(korisnikPodaci);
        odgovor.send();
    } else {
        odgovor.status(401).send({greska: `Korisnik ${korisnik.korime} ne postoji.`});
    }
}

async function obradiRegistraciju(zahtjev: Request, odgovor: Response) {
    const korisnik = obradiUlaznePodatke(zahtjev.body);

    if (korisnik.ime === undefined ||
        korisnik.prezime === undefined ||
        korisnik.korime === undefined ||
        korisnik.email === undefined ||
        korisnik.token === undefined
    ) {
        odgovor.status(417).send({greska: 'Neočekivani podaci'});
        return;
    }


    if (await provjeriGRecaptchu(korisnik.token)) {
        korisnik.korime = korisnik.korime.toLowerCase();
        korisnik.lozinka = await kodovi.kreirajSHA256(korisnik.lozinka, korisnik.korime + 74);
        await pokusajRegistrirati(korisnik, odgovor);
    } else {
        odgovor.status(403).send({greska: 'Otkrivena sumnjiva aktivnost... pokušaj ponovno kasnije'});
    }
}

async function pokusajRegistrirati(korisnik: any, odgovor: Response) {
    const rezultat = await fetch(`${bazicniAPIURL}korisnici`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(korisnik)
    });

    if (rezultat.status === 201) {
        odgovor.status(201).send();
    } else {
        odgovor
            .status(rezultat.status)
            .send(await rezultat.json());
    }
}

async function pokusajAzurirati(korisnik: any, odgovor: Response) {
    if (korisnik.lozinka) {
        korisnik.lozinka = await kodovi.kreirajSHA256(korisnik.lozinka, korisnik.korime + 74);
    }

    const url = `${bazicniAPIURL}korisnici/${korisnik.korime}`;
    const rezultat = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${korisnik.jwt}`
        },
        body: JSON.stringify(korisnik)
    });

    if (rezultat.ok) {
        odgovor.send();
    } else {
        odgovor
            .status(rezultat.status)
            .send(JSON.stringify(await rezultat.json()));
    }
}

async function provjeriGRecaptchu(token: string): Promise<boolean> {
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${tajniKljucGRecaptcha}&response=${token}`;
    const odgovor = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }
    });

    const gRecaptchaStatus = await odgovor.json();
    return gRecaptchaStatus.success && gRecaptchaStatus.score >= 0.5;
}

function obradiUlaznePodatke(podaci: any): any {
    for (const i in podaci) {
        if (typeof podaci[i] === 'string') {
            if (podaci[i].trim() === '') {
                delete podaci[i]
            } else {
                podaci[i] = izbaciHTMLznakove(podaci[i]);
            }
        }
    }
    return podaci;
}

const izbaciHTMLznakove = (tekst: string) =>
    tekst
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&quot;')
        .replace(/'/g, '&#027;');