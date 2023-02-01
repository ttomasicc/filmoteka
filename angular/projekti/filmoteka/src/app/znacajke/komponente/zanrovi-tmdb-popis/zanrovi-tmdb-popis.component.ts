import {Component} from '@angular/core';
import {Observable} from 'rxjs';
import {ZanrModel} from '../../../jezgra/modeli/jezgra/zanr.model';
import {ZanrService} from '../../../jezgra/servisi/zanr.service';
import {ZanrZahtjev} from '../../../jezgra/modeli/api/zahtjevi/zanr.zahtjev';

@Component({
	selector: 'app-zanrovi-tmdb-popis',
	templateUrl: './zanrovi-tmdb-popis.component.html',
	styleUrls: ['./zanrovi-tmdb-popis.component.scss']
})
export class ZanroviTMDBPopisComponent {
	zanrovi$?: Observable<ZanrModel[]>;
	selektiraniZanrovi: ZanrZahtjev[];
	poruke: string[];

	constructor(private readonly _zanrServis: ZanrService) {
		this.selektiraniZanrovi = [];
		this.poruke = [];
	}

	ngOnInit(): void {
		this.zanrovi$ = this._zanrServis.dohvatiSveTMDB();
	}

	onChangeKlik(e: any) {
		if (e.checked) {
			const zanrZahtjev: ZanrZahtjev = new ZanrZahtjev(e.dataset.id, e.dataset.opis);
			this.selektiraniZanrovi.push(zanrZahtjev);
		} else {
			this.selektiraniZanrovi = this.selektiraniZanrovi.filter((zanr) => zanr.id_tmdb !== e.dataset.id);
		}
	}

	async dodajSelektirane(): Promise<void> {
		const unikatniZanrovi: ZanrZahtjev[] = await this.ukloniPostojeceZanrove();
		if (unikatniZanrovi.length) {
			unikatniZanrovi.forEach((zanr) => this.dodajZanr(zanr));
			this._zanrServis.setPromjena();
		}
	}

	private ukloniPostojeceZanrove = async (): Promise<ZanrZahtjev[]> => new Promise((uspjeh, neuspjeh) => {
		this._zanrServis.dohvatiSve().subscribe({
			next: (zanrovi) => uspjeh(this.filtriraj(zanrovi ?? [])),
			error: (err) => neuspjeh([])
		});
	});

	private filtriraj = (postojeciZanrovi: ZanrModel[]): ZanrZahtjev[] =>
		this.selektiraniZanrovi.filter((selektiraniZanr) => {
			const inx: number = postojeciZanrovi.findIndex((postojeciZanr) =>
				postojeciZanr.idTMDB == selektiraniZanr.id_tmdb
			);

			if (inx === -1) {
				return true;
			}

			this.setPoruka(`Žanr ${selektiraniZanr.opis} već postoji, preskačem.`);
			return false;
		});

	private dodajZanr(zanr: ZanrZahtjev): void {
		this._zanrServis.dodaj(zanr).subscribe({
			complete: () => this.setPoruka(`Žanr ${zanr.opis} uspješno dodan.`),
			error: (err) => this.setPoruka(`Dodavanje žanra trenutno nije moguće.`)
		});
	}

	setPoruka(poruka: string) {
		this.poruke.push(poruka);
		setTimeout(() => {
			this.poruke = this.poruke.filter((p) => p !== poruka);
		}, 5000);
	}
}
