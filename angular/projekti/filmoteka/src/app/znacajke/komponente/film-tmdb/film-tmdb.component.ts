import {Component, Input} from '@angular/core';
import {FilmTMDBModel} from '../../../jezgra/modeli/jezgra/filmTMDB.model';
import {FilmService} from '../../../jezgra/servisi/film.service';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
	selector: 'app-film-tmdb[film]',
	templateUrl: './film-tmdb.component.html',
	styleUrls: ['./film-tmdb.component.scss']
})
export class FilmTMDBComponent {
	@Input('film') film!: FilmTMDBModel;

	constructor(
		private readonly _filmServis: FilmService
	) {
	}

	dodajPrijedlog(): void {
		this._filmServis.dodaj(this.film.id)
			.subscribe({
				complete: () => alert(`Film ${this.film.naslov} je uspješno dodan kao prijedlog!`),
				error: (err) => this.obradiErr(err)
			});
	}

	private obradiErr = (err: HttpErrorResponse): void =>
		err.status === 409 ? alert(`Film ${this.film.naslov} već postoji!`) :
			alert(`Nemoguće dodati film ${this.film.naslov}!`);

}
