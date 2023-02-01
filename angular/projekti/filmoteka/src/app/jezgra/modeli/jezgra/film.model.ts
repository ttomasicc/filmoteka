import {KorisnikModel} from './korisnik.model';
import {ZanrOsnovnoModel} from './zanr-osnovno.model';

export class FilmModel {
	constructor(
		public id: number,
		public idTMDB: number,
		public idIMDB: string,
		public putanjaPozadina: string,
		public putanjaPlakat: string,
		public odrastao: boolean,
		public odobren: boolean,
		public video: boolean,
		public budzet: number,
		public stranica: string,
		public izvorniJezik: string,
		public izvorniNaslov: string,
		public naslov: string,
		public slogan: string,
		public sazetak: string,
		public prihod: number,
		public trajanje: number,
		public datumUnosa: Date,
		public datumIzdavanja: Date,
		public ocjenaGlasaca: number,
		public brojGlasaca: number,
		public popularnost: number,
		public status: string,
		public zanrovi: ZanrOsnovnoModel[],
		public korisnik: KorisnikModel
	) {
	}
}
