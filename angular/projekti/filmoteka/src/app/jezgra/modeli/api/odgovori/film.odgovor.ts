import {IZanrOsnovnoOdgovor} from './zanr-osnovno.odgovor';
import {IKorisnikOdgovor} from './korisnik.odgovor';

export interface IFilmOdgovor {
	id: number,
	id_tmdb: number,
	id_imdb: string,
	putanja_pozadina: string,
	putanja_plakat: string,
	odrastao: boolean,
	odobren: boolean,
	video: boolean,
	budzet: number,
	stranica: string,
	izvor_jezik: string,
	izvor_naslov: string,
	naslov: string,
	slogan: string,
	sazetak: string,
	prihod: number,
	trajanje: number,
	datum_unosa: Date,
	datum_izdavanja: Date,
	glasaci_ocjena: number,
	glasaci_broj: number,
	popularnost: number,
	status: string,
	zanrovi: IZanrOsnovnoOdgovor[],
	korisnik: IKorisnikOdgovor
}
