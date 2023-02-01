import {ZanrOsnovnoModel} from './zanr-osnovno.model';

export class ZanrModel extends ZanrOsnovnoModel {
	constructor(
		id: number,
		opis: string,
		public idTMDB: number
	) {
		super(id, opis);
	}
}
