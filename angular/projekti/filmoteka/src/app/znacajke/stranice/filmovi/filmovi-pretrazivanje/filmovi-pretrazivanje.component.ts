import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Params, Router} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FilmService} from '../../../../jezgra/servisi/film.service';
import {FilmTMDBModel} from '../../../../jezgra/modeli/jezgra/filmTMDB.model';

@Component({
	selector: 'app-filmovi-pretrazivanje',
	templateUrl: './filmovi-pretrazivanje.component.html',
	styleUrls: ['./filmovi-pretrazivanje.component.scss']
})
export class FilmoviPretrazivanjeComponent implements OnInit, OnDestroy {
	formGrupa!: FormGroup;
	filmovi$?: Observable<FilmTMDBModel[]>;
	stranica: number = 1;

	private _rutaSub?: Subscription;
	private _params?: ParamMap;

	constructor(
		private readonly _fb: FormBuilder,
		private readonly _ruta: ActivatedRoute,
		private readonly _ruter: Router,
		private readonly _filmServis : FilmService
	) {
	}

	ngOnDestroy(): void {
		this._rutaSub?.unsubscribe();
	}

	ngOnInit(): void {
		this.buildForm();
		this.subQueryParams();
	}

	pretrazi(): void {
		if (this.formGrupa.valid && !this.formGrupa.pristine) {
			this.setPocetnaStranica();
			this.setQueryParams({
				stranica: 1,
				kljucneRijeci: encodeURIComponent(this.formGrupa.value.kljucneRijeci.trim())
			});
		}
	}

	onChangeStranica(stranica: number | undefined = 1): void {
		if (stranica > 0) {
			this.stranica = stranica;
			this.setQueryParams({
				stranica: this.stranica
			});
		}
	}

	private buildForm(): void {
		this.formGrupa = this._fb.group({
			kljucneRijeci: ['', Validators.compose([Validators.required])]
		});
	}

	private setPocetnaStranica(): void {
		this.stranica = 1;
	}

	private azurirajStranicenje(): void {
		const paramStranica = this.getQueryParamStranica();
		if (paramStranica) {
			this.stranica = paramStranica;
		}
	}

	private subQueryParams(): void {
		this._rutaSub = this._ruta.queryParamMap.subscribe({
			next: (params) => {
				this._params = params;
				this.azurirajStranicenje();

				const kljucneRijeci = this.getQueryParamKljucneRijeci();
				if (kljucneRijeci[0] !== '') {
					this.filmovi$ = this._filmServis.pretrazi(kljucneRijeci, this.stranica);
				}
			}
		});
	}

	private getQueryParamKljucneRijeci(): string[] {
		const kljucneRijeciString = this._params?.get('kljucneRijeci') ?? '';
		return decodeURIComponent(kljucneRijeciString).split(' ');
	}

	private getQueryParamStranica(): number | undefined {
		return this.getNumQueryParam('stranica');
	}

	private getNumQueryParam(naziv: string): number | undefined {
		const param = this._params?.get(naziv);

		if (param) {
			const paramId: number = parseInt(param);
			return paramId > 0 ? paramId : undefined;
		}
		return undefined;
	}

	private setQueryParams(params: Params): void {
		this._ruter.navigate([], {
			relativeTo: this._ruta,
			queryParams: params,
			queryParamsHandling: 'merge'
		});
	}
}
