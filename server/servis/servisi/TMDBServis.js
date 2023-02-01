class TMDBServis {
    #bazicniURL = 'https://api.themoviedb.org/3';
    #apiKljuc;

    constructor(apiKljuc) {
        this.#apiKljuc = apiKljuc;
    }

    async dohvatiFilm(id) {
        const resurs = `/movie/${id}`;
        return await this.#obaviZahtjev(resurs);
    }

    async dohvatiZanrove() {
        const resurs = '/genre/movie/list';
        return (await this.#obaviZahtjev(resurs)).genres;
    }

    async pretraziFilmove(rijeci, stranica) {
        const resurs = '/discover/movie';
        const parametri = {
            sort_by: 'popularity.desc',
            include_adult: false,
            include_video: false,
            page: stranica,
            with_keywords: await this.#dajKljucneRijeci(rijeci)
        };

        return await this.#obaviZahtjev(resurs, parametri);
    }

    async #obaviZahtjev(resurs, parametri = '') {
        let zahtjev = `${this.#bazicniURL}${resurs}?api_key=${this.#apiKljuc}`;
        for (const p in parametri) {
            zahtjev += `&${p}=${parametri[p]}`;
        }
        const odgovor = await fetch(zahtjev);
        return await odgovor.json();
    }

    async #dajKljucneRijeci(rijeci) {
        let odgovor = '';
        if (rijeci === '') {
            return odgovor;
        }
        const resurs = '/search/keyword';

        let prva = true;
        for (const rijec of rijeci.split(',')) {
            let rezultat = await this.#obaviZahtjev(resurs, {query: rijec, page: 1});
            if (rezultat.results.length === 0) {
                return '0';
            }

            if (prva) {
                odgovor += rezultat.results[0].id;
                prva = false;
            } else {
                odgovor += ',' + rezultat.results[0].id;
            }
        }

        return odgovor;
    }
}

module.exports = TMDBServis;