import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {ZanrModel} from '../../../jezgra/modeli/jezgra/zanr.model';
import {ZanrService} from '../../../jezgra/servisi/zanr.service';

enum Stanje {
	NORMALNO,
	UREDIVANJE
}

@Component({
	selector: 'app-zanrovi-popis',
	templateUrl: './zanrovi-popis.component.html',
	styleUrls: ['./zanrovi-popis.component.scss']
})
export class ZanroviPopisComponent implements OnInit, OnDestroy{
	zanrovi$?: Observable<ZanrModel[]>;
	selektiraniZanr?: ZanrModel;
	stanje: Stanje;
	stanjeType = Stanje;
	private _promjeneSub?: Subscription;

	constructor(private readonly _zanrServis: ZanrService) {
		this.stanje = Stanje.NORMALNO;
	}

	ngOnInit(): void {
		this.dohvatiSveZanrove();
		this.pretplatiSeNaPromjene();
	}

	ngOnDestroy(): void {
		this._promjeneSub?.unsubscribe();
	}

	ukloni(zanr: ZanrModel): void {
		this._zanrServis.obrisi(zanr.id).subscribe({
			complete: () => this.dohvatiSveZanrove(),
			error: () => alert(`Nije moguće obrisati žanr ${zanr.opis}.`)
		});
	}

	ukloniNekoristene(): void {
		this._zanrServis.obrisiNekoristene().subscribe({
			complete: () => this.dohvatiSveZanrove(),
			error: (err) => alert('Trenutno nije moguće obrisati nekorištene žanrove.')
		});
	}

	azuriraj(e: any): void {
		const noviOpis: string = e.value.trim();
		this.azurirajZanr(noviOpis);
	}

	omoguciAzuriranje(zanr: ZanrModel) {
		this.selektiraniZanr = zanr;
		this.stanje = Stanje.UREDIVANJE;
	}

	onemoguciAzuriranje() {
		this.selektiraniZanr = undefined;
		this.stanje = Stanje.NORMALNO;
	}

	private pretplatiSeNaPromjene(): void {
		this._promjeneSub = this._zanrServis.getPromjene().subscribe({
			next: () => this.dohvatiSveZanrove()
		});
	}

	private dohvatiSveZanrove() {
		this.zanrovi$ = this._zanrServis.dohvatiSve();
	}

	private azurirajZanr(noviOpis: string) {
		if (this.selektiraniZanr && noviOpis !== '') {
			const noviZanr: ZanrModel = new ZanrModel(
				this.selektiraniZanr.id,
				noviOpis.charAt(0).toUpperCase() + noviOpis.slice(1),
				this.selektiraniZanr.idTMDB
			);

			this._zanrServis.azuriraj(noviZanr).subscribe({
				complete: () => this.dohvatiSveZanrove(),
				error: (err) => alert(`Žanr ${noviOpis} već postoji.`)
			});
		}

		this.onemoguciAzuriranje();
	}
}
