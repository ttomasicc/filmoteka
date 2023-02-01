const NepotuniPodatakError = require('../errors/NepotpuniPodatakError.js');

class KonfigValidator {
    #konfig;

    constructor(konfig) {
        this.#konfig = konfig;
    }

    validiraj() {
        this.#validirajPort();
        this.#validirajTMDBKonfig();
    }

    #validirajPort() {
        if (this.#konfig['rest.port'] === undefined || this.#konfig['rest.port'] === '') {
            throw new NepotuniPodatakError('Konfig: Nedostaje rest.port');
        }
    }

    #validirajTMDBKonfig() {
        if (this.#konfig['tmdb.apikey.v3'] === undefined || this.#konfig['tmdb.apikey.v3'] === '') {
            throw new NepotuniPodatakError('Konfig: Nedostaje tmdb.apikey.v3');
        } else if (this.#konfig['tmdb.apikey.v4'] === undefined || this.#konfig['tmdb.apikey.v4'] === '') {
            throw new NepotuniPodatakError('Konfig: Nedostaje tmdb.apikey.v4');
        }
    }
}

module.exports = KonfigValidator;