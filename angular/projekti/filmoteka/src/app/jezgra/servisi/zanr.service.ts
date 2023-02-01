import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {ZanrModel} from '../modeli/jezgra/zanr.model';
import {map, Observable, Subject, take} from 'rxjs';
import {IZanrOdgovor} from '../modeli/api/odgovori/zanr.odgovor';
import {restDomena} from './filmoteka-konfig';
import {IZanrTMDBOdgovor} from '../modeli/api/odgovori/zanrTMDB.odgovor';
import {ZanrZahtjev} from '../modeli/api/zahtjevi/zanr.zahtjev';

@Injectable({
	providedIn: 'root'
})
export class ZanrService {
	private _promjene: Subject<void>;

	getPromjene(): Observable<void> {
		return this._promjene.asObservable();
	}

	setPromjena(): void {
		this._promjene.next();
	}

	constructor(private readonly _http: HttpClient) {
		this._promjene = new Subject();
	}

	dohvatiSve(): Observable<ZanrModel[]> {
		const url: string = `${restDomena}/zanr`;

		return this._http
			.get<IZanrOdgovor[]>(url)
			.pipe(
				map((odgovor) => odgovor?.map(
					(zanr) => new ZanrModel(zanr.id, zanr.opis, zanr.id_tmdb)
				))
			);
	}

	dohvatiSveTMDB(): Observable<ZanrModel[]> {
		const url: string = `${restDomena}/tmdb/zanr`;

		return this._http
			.get<IZanrTMDBOdgovor[]>(url)
			.pipe(
				map((odgovor) => odgovor?.map(
					(zanr) => new ZanrModel(-1, zanr.name, zanr.id)
				))
			);
	}

	azuriraj(zanr: ZanrModel): Observable<HttpResponse<Object>> {
		const url: string = `${restDomena}/zanr/${zanr.id}`;

		return this._http
			.put(url, {opis: zanr.opis}, {observe: 'response'})
			.pipe(
				take(1)
			);
	}

	dodaj(zanr: ZanrZahtjev): Observable<HttpResponse<Object>> {
		const url: string = `${restDomena}/zanr`;

		return this._http
			.post(url, zanr, {observe: 'response'})
			.pipe(
				take(1)
			);
	}

	obrisi(zanrID: number): Observable<HttpResponse<Object>> {
		const url: string = `${restDomena}/zanr/${zanrID}`;

		return this._http
			.delete(url, {observe: 'response'})
			.pipe(
				take(1)
			);
	}

	obrisiNekoristene(): Observable<HttpResponse<Object>> {
		const url: string = `${restDomena}/zanr`;

		return this._http
			.delete(url, {observe: 'response'})
			.pipe(
				take(1)
			);
	}
}
