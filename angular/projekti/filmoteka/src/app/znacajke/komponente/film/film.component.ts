import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FilmModel} from '../../../jezgra/modeli/jezgra/film.model';

@Component({
	selector: 'app-film[film]',
	templateUrl: './film.component.html',
	styleUrls: ['./film.component.scss']
})
export class FilmComponent implements OnInit, OnDestroy {
	@Input('film') film!: FilmModel;
	@Input('kontrole') kontrole?: boolean;
	@Output() obrisi: EventEmitter<void> = new EventEmitter();
	zanrovi!: string;

	constructor() {
		this.kontrole = this.kontrole ?? false;
	}

	ngOnInit(): void {
		this.zanrovi = this.film.zanrovi.map(zanr => zanr.opis).join(', ');
	}

	ngOnDestroy(): void {
		this.obrisi.emit();
	}

	destroy = () => this.ngOnDestroy()
}
