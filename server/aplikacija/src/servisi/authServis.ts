import * as jwt from '../moduli/jwt';
import type {Request, Response, NextFunction} from 'express';

export const autentificiraj = function (zahtjev: Request, odgovor: Response, dalje: NextFunction) {
    if (zahtjev.headers.authorization != null) {
        dalje();
    } else {
        odgovor.status(401).send({greska: 'Neuatoriziran pristup.'});
        return;
    }
}

export const autorizirajAdmin = async function (zahtjev: Request, odgovor: Response, dalje: NextFunction) {
    if (await autoriziraj(zahtjev, 1)) {
        dalje();
    } else {
        odgovor.status(403).send({greska: 'Zabranjen pristup.'});
        return;
    }
}

export const autorizirajKorisnik = async function (zahtjev: Request, odgovor: Response, dalje: NextFunction) {
    if (await autoriziraj(zahtjev, 2) || await autoriziraj(zahtjev, 1)) {
        dalje();
    } else {
        odgovor.status(403).send({greska: 'Zabranjen pristup.'});
        return;
    }
}

export const autoriziraj = async function (zahtjev: Request, uloga: number): Promise<boolean> {
    const token: string = zahtjev.headers?.authorization?.split(' ')[1] ?? '';
    return (jwt.provjeri(token) && await autorizirajUlogu(token, uloga));
}

export const autorizirajUlogu = async (token: string, rola: number): Promise<boolean> =>
    rola === (await jwt.dajTijelo(token)).id_uloga;