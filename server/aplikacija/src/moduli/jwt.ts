// @ts-ignore
import {tajniKljucJWT} from '../../../konstante.js';
import jwt from 'jsonwebtoken';

export interface IJWTTijelo {
    id: number,
    korime: string,
    id_uloga: number
}

export const kreiraj = (korisnik: IJWTTijelo): string =>
    jwt.sign(korisnik, tajniKljucJWT, {expiresIn: '10s'});

export const provjeri = (token: string): boolean => {
    try {
        jwt.verify(token, tajniKljucJWT);
        return true;
    } catch (err) {
        return false;
    }
};

export const dajTijelo = (token: string): IJWTTijelo =>
    <IJWTTijelo>jwt.decode(token)