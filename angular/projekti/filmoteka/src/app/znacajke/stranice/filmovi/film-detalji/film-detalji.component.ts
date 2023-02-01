import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {FilmModel} from '../../../../jezgra/modeli/jezgra/film.model';
import {ActivatedRoute} from '@angular/router';
import {FilmService} from '../../../../jezgra/servisi/film.service';

@Component({
	selector: 'app-film-detalji',
	templateUrl: './film-detalji.component.html',
	styleUrls: ['./film-detalji.component.scss']
})
export class FilmDetaljiComponent implements OnInit, OnDestroy {
	film$?: Observable<FilmModel>;
	private _rutaSub?: Subscription;

	constructor(
		private readonly _ruta: ActivatedRoute,
		private readonly _filmServis: FilmService
	) {
	}

	ngOnInit(): void {
		this.subPathParam();
	}

	ngOnDestroy(): void {
		this._rutaSub?.unsubscribe();
	}

	private subPathParam(): void {
		this._rutaSub = this._ruta.paramMap.subscribe({
			next: (params) => {
				this.dohvatiFilm(params.get('id'));
			}
		});
	}

	private dohvatiFilm(filmId: string | null): void {
		const id = parseInt(filmId ? filmId : '');
		if (id && id > 0) {
			this.film$ = this._filmServis.dohvati(id);
		}
	}
}
