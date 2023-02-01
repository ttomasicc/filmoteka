export class FilmTMDBModel {
	constructor(
		public id: number,
		public naslov: string,
		public popularnost: number,
		public datumIzdavanja: Date,
		public ocjenaGlasaca: number,
		public brojGlasaca: number,
		public putanjaPlakat: string
	) {
	}
}
