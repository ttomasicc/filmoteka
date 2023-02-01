import crypto from 'crypto';

export const kreirajSHA256 = async (tekst: string, sol?: string): Promise<string> =>
    crypto.createHash('sha256')
        .update(tekst + (sol ?? ''))
        .digest('hex');

export const dajNasumceBroj = function (min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}