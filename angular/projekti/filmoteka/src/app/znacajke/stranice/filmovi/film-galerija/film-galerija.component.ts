import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Params, Router} from '@angular/router';
import {FilmService} from '../../../../jezgra/servisi/film.service';
import {Observable, Subscription, take} from 'rxjs';
import {FilmModel} from '../../../../jezgra/modeli/jezgra/film.model';
import {ISlikeOpcijeZahtjev, SlikeOpcijeZahtjev} from '../../../../jezgra/modeli/api/zahtjevi/slike-opcije.zahtjev';

@Component({
	selector: 'app-film-galerija',
	templateUrl: './film-galerija.component.html',
	styleUrls: ['./film-galerija.component.scss']
})
export class FilmGalerijaComponent implements OnInit, OnDestroy {
	stranica: number;
	film?: FilmModel;
	putanjeSlika$?: Observable<string[]>;
	private _rutaPathSub?: Subscription;
	private _rutaQuerySub?: Subscription;
	private _params?: ParamMap;

	constructor(
		private readonly _ruta: ActivatedRoute,
		private readonly _ruter: Router,
		private readonly _filmServis: FilmService
	) {
		this.stranica = 1;
	}

	ngOnInit(): void {
		this.subPathParam().then(() =>
			this.subQueryParams()
		);
	}

	ngOnDestroy(): void {
		this._rutaPathSub?.unsubscribe();
		this._rutaQuerySub?.unsubscribe();
	}

	onChangeDatumOd(e: any): void {
		this.setPocetnaStranica();

		this.setQueryParams({
			stranica: 1,
			od: e.value ? new Date(e.value).toISOString().split('T')[0] : null
		});
	}

	onChangeDatumDo(e: any): void {
		this.setPocetnaStranica();

		this.setQueryParams({
			stranica: 1,
			do: e.value ? new Date(e.value).toISOString().split('T')[0] : null
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

	azurirajSlike(): void {
		this.dohvatiPutanjeSlika();
	}

	private subPathParam = (): Promise<void> =>
		new Promise((uspjeh, neuspjeh) => {
			this._rutaPathSub = this._ruta.paramMap.subscribe({
				next: async (params) => {
					const filmID = parseInt(params.get('id') ?? '');
					if (filmID) {
						this.film = await this.dohvatiFilm(filmID);
					}
					uspjeh();
				},
				error: (err) => neuspjeh()
			});
		});

	private subQueryParams(): void {
		this._rutaQuerySub = this._ruta.queryParamMap.subscribe({
			next: (params) => {
				this._params = params;
				this.azurirajStranicenje();
				this.dohvatiPutanjeSlika();
			}
		});
	}

	private dohvatiFilm = async (filmID: number): Promise<FilmModel | undefined> =>
		new Promise((uspjeh, neuspjeh) => {
			this._filmServis.dohvati(filmID)
				.pipe(take(1))
				.subscribe({
					next: (film) => uspjeh(film),
					error: (err) => neuspjeh(undefined)
				});
		});

	private dohvatiPutanjeSlika(): void {
		if (this.film) this.putanjeSlika$ = this._filmServis.dohvatiSlike(this.film.id, this.getSlikaFiltar());
	}

	private getSlikaFiltar = (): SlikeOpcijeZahtjev =>
		new SlikeOpcijeZahtjev(this.buildSlikeFiltar());

	private buildSlikeFiltar = (): ISlikeOpcijeZahtjev => ({
		stranica: this.getQueryParamStranica(),
		od: this.getDatumParam('od'),
		do: this.getDatumParam('do')
	});

	private azurirajStranicenje() {
		const paramStranica = this.getQueryParamStranica();
		if (paramStranica) {
			this.stranica = paramStranica;
		}
	}

	private setPocetnaStranica(): void {
		this.stranica = 1;
	}

	private setQueryParams(params: Params): void {
		this._ruter.navigate([], {
			relativeTo: this._ruta,
			queryParams: params,
			queryParamsHandling: 'merge'
		});
	}

	private getQueryParamStranica(): number | undefined {
		return this.getNumQueryParam('stranica');
	}

	private getNumQueryParam(naziv: string): number | undefined {
		const param = this._params?.get(naziv);

		if (param) {
			const paramId: number = parseInt(param);
			return paramId ?? undefined;
		}
		return undefined;
	}

	private getDatumParam(naziv: string): string | undefined {
		const datum = this._params?.get(naziv);
		return datum ?? undefined;
	}
}
