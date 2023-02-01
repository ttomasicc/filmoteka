import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {map, Observable, take} from 'rxjs';
import {IFilmOdgovor} from '../modeli/api/odgovori/film.odgovor';
import {FilmModel} from '../modeli/jezgra/film.model';
import {ZanrOsnovnoModel} from '../modeli/jezgra/zanr-osnovno.model';
import {KorisnikModel} from '../modeli/jezgra/korisnik.model';
import {appDomena, restDomena} from './filmoteka-konfig';
import {FilmOdobren, FilmOpcijeZahtjev} from '../modeli/api/zahtjevi/film-opcije.zahtjev';
import * as http from '../moduli/http';
import {FilmTMDBModel} from '../modeli/jezgra/filmTMDB.model';
import {IFilmTMDBOdgovor} from '../modeli/api/odgovori/filmTMDB.odgovor';
import {ITMDBOdgovor} from '../modeli/api/odgovori/TMDB.odgovor';
import {SlikeOpcijeZahtjev} from '../modeli/api/zahtjevi/slike-opcije.zahtjev';

@Injectable({
	providedIn: 'root'
})
export class FilmService {

	constructor(private readonly _http: HttpClient) {
	}

	dohvatiSve(filmOpcije: FilmOpcijeZahtjev): Observable<FilmModel[]> {
		const params: string = http.pretvoriQueryParams(filmOpcije);
		const url: string = `${restDomena}/filmovi?${params}`;

		return this._http
			.get<IFilmOdgovor[]>(url)
			.pipe(
				map((odgovor) => odgovor?.map((film) => this.buildFilmModel(film)))
			);
	}

	dohvati(id: number): Observable<FilmModel> {
		const url: string = `${restDomena}/filmovi/${id}`;

		return this._http
			.get<IFilmOdgovor>(url)
			.pipe(
				map((film) => this.buildFilmModel(film))
			);
	}

	dodaj(id: number): Observable<HttpResponse<Object>> {
		const url: string = `${restDomena}/filmovi`;

		return this._http
			.post(url, {id: id}, {observe: 'response'})
			.pipe(
				take(1)
			);
	}

	pretrazi(kljucneRijeci: string[], stranica: number = 1): Observable<FilmTMDBModel[]> {
		const url: string = `${restDomena}/tmdb/filmovi?kljucnaRijec=${kljucneRijeci.join(',')}&stranica=${stranica}`;

		return this._http
			.get<ITMDBOdgovor>(url)
			.pipe(
				map((odgovor) => odgovor.results.map((film) => this.buildFilmTMDBModel(film)))
			);
	}

	dopusti(filmID: number): Observable<HttpResponse<Object>> {
		const url: string = `${appDomena}/filmovi/${filmID}`;

		return this._http
			.put(url, {odobren: FilmOdobren.DA}, {observe: 'response'})
			.pipe(
				take(1)
			);
	}

	odbij(filmID: number): Observable<HttpResponse<Object>> {
		const url: string = `${restDomena}/filmovi/${filmID}`;

		return this._http
			.delete(url, {observe: 'response'})
			.pipe(
				take(1)
			);
	}

	dohvatiSlike(filmID: number, opcije: SlikeOpcijeZahtjev): Observable<string[]> {
		const params: string = http.pretvoriQueryParams(opcije);
		const url: string = `${appDomena}/slike/${filmID}?${params}`;

		return this._http
			.get<string[]>(url)
			.pipe(
				take(1)
			);
	}

	postaviSliku(obrazac: FormData): Observable<HttpResponse<Object>> {
		const url: string = `${appDomena}/slike`;

		return this._http
			.post(url, obrazac, {observe: 'response'})
			.pipe(
				take(1)
			);
	}

	private buildFilmModel = (film: IFilmOdgovor): FilmModel => new FilmModel(
		film.id,
		film.id_tmdb,
		film.id_imdb,
		film.putanja_pozadina,
		film.putanja_plakat,
		film.odrastao,
		film.odobren,
		film.video,
		film.budzet,
		film.stranica,
		film.izvor_jezik,
		film.izvor_naslov,
		film.naslov,
		film.slogan,
		film.sazetak,
		film.prihod,
		film.trajanje,
		film.datum_unosa,
		film.datum_izdavanja,
		film.glasaci_ocjena,
		film.glasaci_broj,
		film.popularnost,
		film.status,
		film.zanrovi.map((zanr) =>
			new ZanrOsnovnoModel(zanr.id, zanr.opis)
		),
		new KorisnikModel(
			film.korisnik.id,
			film.korisnik.ime,
			film.korisnik.prezime,
			film.korisnik.korime,
			film.korisnik.email
		)
	);

	private buildFilmTMDBModel(film: IFilmTMDBOdgovor): FilmTMDBModel {
		return new FilmTMDBModel(
			film.id,
			film.title,
			film.popularity,
			film.release_date,
			film.vote_average,
			film.vote_count,
			film.poster_path
		)
	}
}
