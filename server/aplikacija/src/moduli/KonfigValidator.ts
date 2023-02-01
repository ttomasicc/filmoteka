import {NepotpuniPodatakError} from '../errors/NepotpuniPodatakError';

export class KonfigValidator {
    private _konfig: any;

    constructor(konfig: any) {
        this._konfig = konfig;
    }

    validiraj(): void {
        this.validirajPort();
    }

    private validirajPort(): void {
        if (this._konfig['app.port'] === undefined || this._konfig['app.port'] === '') {
            throw new NepotpuniPodatakError('Konfig: Nedostaje app.port');
        }
    }
}