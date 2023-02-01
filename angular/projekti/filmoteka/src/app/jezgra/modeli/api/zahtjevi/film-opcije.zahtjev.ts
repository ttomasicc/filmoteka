import {environment} from '../../../../../environments/environment';

export enum FilmSort {
	DATUM = 'd',
	NAZIV = 'n',
	ZANR = 'z'
}

export const filmSortLabeleMapiranje: { sort: FilmSort, labela: string }[] = [
	{sort: FilmSort.NAZIV, labela: 'Naziv filma'},
	{sort: FilmSort.ZANR, labela: 'Naziv žanra'},
	{sort: FilmSort.DATUM, labela: 'Datum unosa'}
];

export enum FilmOdobren {
	NE,
	DA
}

export interface IFilmOpcijeZahtjev {
	brojFilmova?: number,
	stranica?: number,
	datum?: string,
	zanr?: number,
	naziv?: string,
	sortiraj?: FilmSort,
	odobren?: FilmOdobren
}

export class FilmOpcijeZahtjev {
	public readonly brojFilmova: number;
	public readonly stranica: number;
	public readonly datum?: string;
	public readonly zanr?: number;
	public readonly naziv?: string;
	public readonly sortiraj?: FilmSort;
	public readonly odobren: FilmOdobren;

	constructor(opcije: IFilmOpcijeZahtjev) {
		this.brojFilmova = opcije.brojFilmova ?? environment.app.brojStranica;
		this.stranica = opcije.stranica ?? 1;
		this.datum = opcije.datum;
		this.zanr = opcije.zanr;
		this.naziv = opcije.naziv;
		this.sortiraj = opcije.sortiraj;
		this.odobren = opcije.odobren === undefined ? FilmOdobren.DA : opcije.odobren;
	}
}
