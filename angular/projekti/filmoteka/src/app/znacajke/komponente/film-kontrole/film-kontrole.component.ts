import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {FilmService} from '../../../jezgra/servisi/film.service';

@Component({
	selector: 'app-film-kontrole[filmID]',
	templateUrl: './film-kontrole.component.html',
	styleUrls: ['./film-kontrole.component.scss']
})
export class FilmKontroleComponent implements OnDestroy {
	@Input('filmID') filmID!: number;
	@Output() obrisi: EventEmitter<void> = new EventEmitter();

	constructor(private readonly _filmServis: FilmService) {
	}

	ngOnDestroy(): void {
		this.obrisi.emit();
    }

	dopusti(): void {
		this._filmServis.dopusti(this.filmID).subscribe({
			complete: () => this.ngOnDestroy(),
			error: (err) => alert('Trenutno nije moguće odobriti film.')
		});
	}

	odbij(): void {
		this._filmServis.odbij(this.filmID).subscribe({
			complete: () => this.ngOnDestroy(),
			error: (err) => alert('Trenutno nije moguće odbiti film.')
		});
	}
}
