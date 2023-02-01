const dsPromise = require('fs/promises');
const KonfigValidator = require('./KonfigValidator.js');

class KonfigParser {
    #konfig;

    constructor() {
        this.#konfig = {};
    }

    dohvatiKonfig() {
        return this.#konfig;
    }

    async ucitajKonfiguraciju() {
        const podaci = await dsPromise.readFile(process.argv[2], 'UTF-8');
        this.#konfig = this.#pretvoriJSONKonfig(podaci);

        new KonfigValidator(this.#konfig).validiraj();
        return this.#konfig;
    }

    #pretvoriJSONKonfig(podaci) {
        let konf = {};
        const nizPodataka = podaci.split('\n');
        for (const podatak of nizPodataka) {
            const podatakNiz = podatak.split('=');
            konf[podatakNiz[0]] = podatakNiz[1]?.trim();
        }
        return konf;
    }
}

module.exports = KonfigParser;