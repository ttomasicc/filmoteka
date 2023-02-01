import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {map, Observable, Subject} from 'rxjs';
import {PrijavaZahtjev} from '../modeli/api/zahtjevi/prijava.zahtjev';
import {appDomena} from './filmoteka-konfig';
import {Rola} from '../modeli/jezgra/role';
import {RegistracijaZahtjev} from '../modeli/api/zahtjevi/registracija.zahtjev';
import {KorisnikAzuriranjeZahtjev} from '../modeli/api/zahtjevi/korisnik-azuriranje.zahtjev';
import {IKorisnikOdgovor} from '../modeli/api/odgovori/korisnik.odgovor';
import {KorisnikModel} from '../modeli/jezgra/korisnik.model';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private _isUlogiran: Subject<boolean>;

	getIsUlogiran(): Observable<boolean> {
		return this._isUlogiran.asObservable();
	}

	setIsUlogiran(stanje: boolean) {
		this._isUlogiran.next(stanje);
	}

	constructor(private readonly _http: HttpClient) {
		this._isUlogiran = new Subject();
	}

	dohvatiJWT(): Observable<string | null> {
		const url: string = `${appDomena}/jwt`;
		return this._http
			.get<{ token: string | null }>(url)
			.pipe(
				map((odgovor) => odgovor.token)
			);
	}

	dohvatiRolu(): Observable<Rola> {
		const url: string = `${appDomena}/jwt/uloga`;
		return this._http
			.get<{ uloga: number }>(url)
			.pipe(
				map((odgovor) => this.getRola(odgovor.uloga))
			)
	}

	dohvatiKorisnika() : Observable<KorisnikModel> {
		const url: string = `${appDomena}/korisnici/trenutno`;
		return this._http
			.get<IKorisnikOdgovor>(url)
			.pipe(
				map((korisnik) => new KorisnikModel(
					korisnik.id,
					korisnik.ime,
					korisnik.prezime,
					korisnik.korime,
					korisnik.email)
				)
			);
	}

	prijavi(korisnik: PrijavaZahtjev): Observable<HttpResponse<Object>> {
		const url: string = `${appDomena}/korisnici/prijava`;
		return this._http
			.post(url, korisnik, {observe: 'response'});
	}

	registriraj(korisnik: RegistracijaZahtjev): Observable<HttpResponse<Object>> {
		const url: string = `${appDomena}/korisnici/registracija`;
		return this._http
			.post(url, korisnik, {observe: 'response'});
	}

	odjavi(): Observable<HttpResponse<Object>> {
		const url: string = `${appDomena}/korisnici/odjava`;
		return this._http
			.get(url, {observe: 'response'});
	}

	azuriraj(korisnik: KorisnikAzuriranjeZahtjev): Observable<HttpResponse<Object>> {
		const url: string = `${appDomena}/korisnici/trenutno`;
		return this._http
			.put(url, korisnik, {observe: 'response'});
	}

	private getRola(rola: number): Rola {
		switch (rola) {
			case 1:
				return Rola.ADMIN;
			case 2:
				return Rola.KORISNIK;
			default:
				return Rola.JAVNO;
		}
	}
}
