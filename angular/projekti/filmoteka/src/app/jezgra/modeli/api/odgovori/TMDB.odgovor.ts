import {IFilmTMDBOdgovor} from './filmTMDB.odgovor';

export interface ITMDBOdgovor {
	page: number,
	results: IFilmTMDBOdgovor[],
	total_pages: number,
	total_results: number
}
