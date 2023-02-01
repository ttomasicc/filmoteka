import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FilmService} from '../../../jezgra/servisi/film.service';
import {IErrorOdgovor} from '../../../jezgra/modeli/api/odgovori/error.odgovor';

@Component({
	selector: 'app-forma-slika[filmID]',
	templateUrl: './forma-slika.component.html',
	styleUrls: ['./forma-slika.component.scss']
})
export class FormaSlikaComponent implements OnInit {
	@Input('filmID') filmID!: number;
	@Output() promjena: EventEmitter<void>;
	forma!: FormGroup;

	constructor(
		private readonly _fb: FormBuilder,
		private readonly _filmServis: FilmService
	) {
		this.promjena = new EventEmitter();
	}

	ngOnInit(): void {
		this.buildForm();
	}

	onChangeDat(e: any): void {
		if (e.files.length > 0) {
			this.obradiSliku(e.files[0]);
		}
	}

	postaviSliku(): void {
		if (this.forma.valid) {
			const obrazac: FormData = new FormData();
			obrazac.append('slika', this.forma.get('slikaSrc')?.value);
			obrazac.append('id', this.filmID.toString());

			this._filmServis.postaviSliku(obrazac).subscribe({
				complete: () => {
					this.promjena.emit();
					this.forma.reset();
				},
				error: (err) => {
					alert((<IErrorOdgovor>err.error).greska);
				}
			});
		}
	}

	private obradiSliku(slika: any): void {
		if (slika.size > 500 * 1024) {
			this.forma.patchValue({
				slika: ''
			});
			alert('Prevelika slika.');
			return;
		}

		this.forma.patchValue({
			slikaSrc: slika
		});
	}

	private buildForm(): void {
		this.forma = this._fb.group({
			slika: ['', Validators.compose([Validators.required])],
			slikaSrc: ['', Validators.compose([Validators.required])]
		});
	}
}
