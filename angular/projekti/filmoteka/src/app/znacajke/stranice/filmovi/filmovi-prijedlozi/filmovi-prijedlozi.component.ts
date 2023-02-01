import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FilmModel} from '../../../../jezgra/modeli/jezgra/film.model';
import {FilmService} from '../../../../jezgra/servisi/film.service';
import {FilmOdobren, FilmOpcijeZahtjev} from '../../../../jezgra/modeli/api/zahtjevi/film-opcije.zahtjev';

@Component({
	selector: 'app-filmovi-prijedlozi',
	templateUrl: './filmovi-prijedlozi.component.html',
	styleUrls: ['./filmovi-prijedlozi.component.scss']
})
export class FilmoviPrijedloziComponent implements OnInit {
	filmovi$?: Observable<FilmModel[]>;

	constructor(private readonly _filmServis: FilmService) {
	}

	ngOnInit(): void {
		this.azurirajPogled();
	}

	azurirajPogled(): void {
		this.filmovi$ = this._filmServis.dohvatiSve(new FilmOpcijeZahtjev({
			brojFilmova: Number.MAX_SAFE_INTEGER,
			odobren: FilmOdobren.NE
		}));
	}
}
