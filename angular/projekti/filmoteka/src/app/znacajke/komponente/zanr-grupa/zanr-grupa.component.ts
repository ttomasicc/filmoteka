import {Component, Input, OnInit} from '@angular/core';
import {ZanrModel} from '../../../jezgra/modeli/jezgra/zanr.model';
import {FilmService} from '../../../jezgra/servisi/film.service';
import {FilmModel} from '../../../jezgra/modeli/jezgra/film.model';
import {Observable} from 'rxjs';
import {FilmOpcijeZahtjev} from '../../../jezgra/modeli/api/zahtjevi/film-opcije.zahtjev';

@Component({
	selector: 'app-zanr-grupa[zanr]',
	templateUrl: './zanr-grupa.component.html',
	styleUrls: ['./zanr-grupa.component.scss']
})
export class ZanrGrupaComponent implements OnInit {
	@Input('zanr') zanr!: ZanrModel;

	filmovi$?: Observable<FilmModel[]>;

	constructor(private _filmServis: FilmService) {
	}

	ngOnInit(): void {
		this.filmovi$ = this._filmServis.dohvatiSve(new FilmOpcijeZahtjev({
			zanr: this.zanr.id
		}));
	}
}
