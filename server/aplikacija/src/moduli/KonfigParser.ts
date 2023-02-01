import dsPromise from 'fs/promises';
import path from 'path';
import {KonfigValidator} from './KonfigValidator';

export class KonfigParser {
    private _konfig: any;

    constructor() {
        this._konfig = {};
    }

    get konfig(): any {
        return this._konfig;
    }

    async ucitajKonfiguraciju(): Promise<any> {
        const podaci: string = await dsPromise.readFile(
            path.resolve(process.argv[2] ?? ''),
            {
                encoding: 'utf-8'
            });

        this._konfig = this.pretvoriJSONKonfig(podaci);

        new KonfigValidator(this._konfig).validiraj();
        return this._konfig;
    }

    private pretvoriJSONKonfig(podaci: string): any {
        let konf: any = {};

        for (const podatak of podaci.split('\n')) {
            const podatakNiz: string[] = podatak.split('=');
            konf[podatakNiz[0] ?? ''] = podatakNiz[1]?.trim();
        }

        return konf;
    }
}