import {environment} from '../../../../../environments/environment';

export interface ISlikeOpcijeZahtjev {
	brojSlika?: number,
	stranica?: number,
	od?: string,
	do?: string
}

export class SlikeOpcijeZahtjev {
	public readonly brojSlika: number;
	public readonly stranica: number;
	public readonly od?: string;
	public readonly do?: string;

	constructor(opcije: ISlikeOpcijeZahtjev) {
		this.brojSlika = opcije.brojSlika ?? environment.app.brojStranica;
		this.stranica = opcije.stranica ?? 1;
		this.od = opcije.od;
		this.do = opcije.do;
	}
}
