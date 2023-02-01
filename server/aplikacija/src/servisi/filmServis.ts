import {KonfigParser} from '../moduli/KonfigParser';
import * as jwt from '../moduli/jwt';
import * as kodovi from '../moduli/kodovi';
import * as ds from 'fs';
import path from 'path';
import formidable from 'formidable';
import type {Request, Response} from 'express';
import type {IFilmOsnovnoOdgovor} from '../modeli/FilmOsnovnoModel';

const maxVelicina: number = 500 * 1024;
const dozvoljeneEkstenzije: string[] = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];

let bazicniAPIURL: string = '';
new KonfigParser()
    .ucitajKonfiguraciju()
    .then((konfig) => {
        bazicniAPIURL = `http://localhost:${konfig['rest.port']}/api/`;
    });

export const putFilm = async function (zahtjev: Request, odgovor: Response) {
    odgovor.type('json');

    const korisnikJWT = zahtjev.headers.authorization?.split(' ')[1] ?? '';
    const id = parseInt(zahtjev.params['id'] ?? '');
    const podaci = obradiUlaznePodatke(zahtjev.body);

    const url = `${bazicniAPIURL}filmovi/${id}`;
    const rezultat = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${korisnikJWT}`
        },
        body: JSON.stringify({odobren: podaci.odobren})
    });

    if (rezultat.ok) {
        const film = await dohvatiFilm(id, korisnikJWT);
        await spremiPoster(`https://image.tmdb.org/t/p/original${film?.putanja_plakat}`);
        odgovor.send();
    } else {
        odgovor.send(JSON.stringify(await rezultat.json()));
    }
}

export const postaviSliku = async function (zahtjev: Request, odgovor: Response) {
    odgovor.type('json');

    const korime = jwt.dajTijelo(zahtjev.session.jwt ?? '').korime;
    const obrazac = new formidable.IncomingForm();

    obrazac.parse(zahtjev, (err: Error, polja: formidable.Fields, datoteke: formidable.Files) => {
        if (err) {
            console.error('[ ERROR ] Greška pri obradi zahtjeva..');
            odgovor.status(404).send({greska: 'Greška pri obradi zahtjeva.'});
            return;
        }

        let filmID = '';
        if (!Array.isArray(polja['id'])) {
            filmID = polja['id'] ?? '';
        }

        const datoteka = datoteke['slika'];
        if (datoteka) {
            if (Array.isArray(datoteka)) {
                datoteka.forEach((slika) => obradiSliku(odgovor, slika, korime, filmID));
            } else {
                obradiSliku(odgovor, datoteka, korime, filmID);
            }
        } else {
            odgovor.status(404).send({greska: 'Greška pri obradi slike.'});
        }
    });
}

export const getSlike = async function (zahtjev: Request, odgovor: Response) {
    odgovor.type('json');

    const brojSlika: any = zahtjev.query['brojSlika'];

    if (brojSlika === undefined) {
        odgovor.status(417).send({greska: 'Neočekivani podaci'});
        return;
    }

    const stranica: any = zahtjev.query['stranica'] ?? 1;
    const datumOd: any = zahtjev.query['od'];
    const datumDo: any = zahtjev.query['do'];

    const filter:any = {
        id: zahtjev.params['id'],
        brojSlika: brojSlika,
        stranica: stranica,
        datumOd: datumOd ? new Date(datumOd) : new Date(-8640000000000000),
        datumDo: datumDo ? new Date(datumDo) : new Date(8640000000000000)
    };
    filter.offset = (stranica - 1) * parseInt(brojSlika);

    const putanje = await dohvatiSlike(filter);
    if (putanje.length) {
        if (putanje.length > brojSlika) {
            putanje.splice(brojSlika);
        }
        odgovor.send(JSON.stringify(putanje));
    } else {
        odgovor.status(204).send();
    }
}

async function dohvatiSlike(filter: any) {
    const putanjeSlika = [];

    let putanja = path.resolve(__dirname, '..', '..', 'staticno', 'slike');
    const filmovi = await ds.promises.readdir(putanja);
    if (filmovi.includes(filter.id.toString())) {
        putanja += `/${filter.id}`;
        for (const korisnik of await ds.promises.readdir(putanja)) {
            const slike = await ds.promises.readdir(`${putanja}/${korisnik}`);

            const slikeUnutarDatuma = slike.filter((s) => {
                const datum = new Date(s.split('_')[0] ?? '');
                return filter.datumOd <= datum && datum <= filter.datumDo;
            });

            while (slikeUnutarDatuma.length > 0 && filter.offset-- > 0) {
                slikeUnutarDatuma.splice(0, 1);
            }

            const punePutanje = slikeUnutarDatuma.map(s => `/${korisnik}/${s}`)
            putanjeSlika.push(...punePutanje);

            if (punePutanje.length >= filter.brojSlika) {
                break;
            }
        }
    }

    return putanjeSlika;
}

async function obradiSliku(odgovor: Response, slika: formidable.File, korime: string, filmID: string) {
    if (slika.size > maxVelicina) {
        odgovor.status(409).send(JSON.stringify({greska: 'Prevelika datoteka.'}));
        return;
    }

    if (!dozvoljeneEkstenzije.includes(slika.mimetype ?? '')) {
        odgovor.status(409).send(JSON.stringify({greska: 'Nedozvoljeni tip datoteke.'}));
        return;
    }

    const putanjaDoFilma = path.resolve(__dirname, '..', '..', 'staticno', 'slike', filmID);
    if (!ds.existsSync(putanjaDoFilma)) {
        ds.mkdirSync(putanjaDoFilma);
    }

    const odredisnaPutanja = path.resolve(putanjaDoFilma, korime);
    if (!ds.existsSync(odredisnaPutanja)) {
        ds.mkdirSync(odredisnaPutanja);
    }

    const izvorisnaPutanja = slika.filepath;

    const datum = new Date().toISOString().split('T')[0];
    const hash = await kodovi.kreirajSHA256(Date.now().toString(), korime);
    const ekstenzija = slika.originalFilename?.split('.').pop() ?? '';
    const nazivSlike = `/${datum}_${hash}.${ekstenzija}`

    ds.copyFile(izvorisnaPutanja, odredisnaPutanja + nazivSlike, ds.constants.COPYFILE_EXCL, err => {
        if (err) {
            console.error('[ ERROR ] Greška kod kopiranja datoteke.');
            console.error(err);
            return odgovor.status(404).send(JSON.stringify({greska: 'Greška kod postavljanja slike'}));
        }
        return odgovor.send();
    });
}

async function spremiPoster(url: string) {
    fetch(url)
        .then(odgovor => odgovor.blob())
        .then(blob => blob.arrayBuffer())
        .then(bufferNiz => {
            const naziv = url.split('/').pop();
            ds.writeFile(`./staticno/posteri/${naziv}`, Buffer.from(bufferNiz), 'binary', _ => {
            });
        })
        .catch(err => {
            console.error('[ ERROR ] Preuzimanje postera neuspješno!');
            console.error(err);
        });
}

async function dohvatiFilm(id: number, korisnikJWT: string): Promise<IFilmOsnovnoOdgovor | undefined> {
    const url: string = `${bazicniAPIURL}filmovi/${id}`;
    const rezultat = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${korisnikJWT}`
        }
    });

    if (rezultat.ok) {
        if (rezultat.status === 204) {
            return undefined;
        } else {
            return await rezultat.json();
        }
    } else {
        return await rezultat.json();
    }
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