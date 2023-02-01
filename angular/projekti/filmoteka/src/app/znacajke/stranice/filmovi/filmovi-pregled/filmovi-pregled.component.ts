import {
	Component,
	OnDestroy,
	OnInit
} from '@angular/core';
import {
	FilmOpcijeZahtjev, FilmSort,
	filmSortLabeleMapiranje,
	IFilmOpcijeZahtjev
} from '../../../../jezgra/modeli/api/zahtjevi/film-opcije.zahtjev';
import {Observable, Subscription} from 'rxjs';
import {ZanrModel} from '../../../../jezgra/modeli/jezgra/zanr.model';
import {ZanrService} from '../../../../jezgra/servisi/zanr.service';
import {FilmService} from '../../../../jezgra/servisi/film.service';
import {ActivatedRoute, ParamMap, Params, Router} from '@angular/router';
import {FilmModel} from '../../../../jezgra/modeli/jezgra/film.model';

@Component({
	selector: 'app-filmovi-pregled',
	templateUrl: './filmovi-pregled.component.html',
	styleUrls: ['./filmovi-pregled.component.scss']
})
export class FilmoviPregledComponent implements OnInit, OnDestroy {
	filmovi$?: Observable<FilmModel[]>;
	zanrovi$?: Observable<ZanrModel[]>;
	sortOpcije = filmSortLabeleMapiranje;
	stranica: number = 1;

	private _rutaSub?: Subscription;
	private _params?: ParamMap;

	constructor(
		private readonly _ruta: ActivatedRoute,
		private readonly _ruter: Router,
		private readonly _filmServis: FilmService,
		private readonly _zanrServis: ZanrService
	) {
	}

	ngOnInit(): void {
		this.zanrovi$ = this._zanrServis.dohvatiSve();
		this.subQueryParams();
	}

	ngOnDestroy(): void {
		this._rutaSub?.unsubscribe();
	}

	onChangeZanr(e: any): void {
		this.setPocetnaStranica();

		const zanrId = parseInt(e.value);
		this.setQueryParams({
			stranica: 1,
			zanr: (zanrId && zanrId !== -1) ? zanrId : null
		});
	}

	onChangeSort(e: any): void {
		this.setPocetnaStranica();

		const sortOpcija = filmSortLabeleMapiranje.find((sortOpcija) => sortOpcija.sort === e.value);
		this.setQueryParams({
			stranica: 1,
			sort: sortOpcija ? sortOpcija.sort : null
		});
	}

	onChangeDatum(e: any): void {
		this.setPocetnaStranica();
		this.setQueryParams({
			stranica: 1,
			datum: e.value ? new Date(e.value).toISOString().split('T')[0] : null
		});
	}

	onChangeStranica(stranica: number | undefined = 1): void {
		if (stranica > 0) {
			this.stranica = stranica;
			this.setQueryParams({
				stranica: this.stranica
			});
		}
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
				this.filmovi$ = this._filmServis.dohvatiSve(this.getFilmFiltar());
			}
		});
	}

	private getFilmFiltar = (): FilmOpcijeZahtjev =>
		new FilmOpcijeZahtjev(this.buildFilmFiltar());

	private buildFilmFiltar = (): IFilmOpcijeZahtjev => ({
		stranica: this.getQueryParamStranica(),
		zanr: this.getQueryParamZanr(),
		sortiraj: this.getQueryParamSort(),
		datum: this.getQueryParamDatum()
	});

	private getQueryParamStranica(): number | undefined {
		return this.getNumQueryParam('stranica');
	}

	private getQueryParamZanr(): number | undefined {
		return this.getNumQueryParam('zanr');
	}

	private getQueryParamSort(): FilmSort | undefined {
		const sort = this._params?.get('sort');

		if (sort) {
			const filmSort = filmSortLabeleMapiranje.find((sortOpcija) => sortOpcija.sort === sort);
			return filmSort ? filmSort.sort : undefined;
		}
		return undefined;
	}

	private getQueryParamDatum(): string | undefined {
		const datum = this._params?.get('datum');
		return datum ? datum : undefined;
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
