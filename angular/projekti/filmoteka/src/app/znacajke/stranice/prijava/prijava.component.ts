import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {PrijavaZahtjev} from '../../../jezgra/modeli/api/zahtjevi/prijava.zahtjev';
import {obradiUlaznePodatke} from '../../../jezgra/moduli/validacija';
import {AuthService} from '../../../jezgra/servisi/auth.service';
import {Router} from '@angular/router';
import {IErrorOdgovor} from '../../../jezgra/modeli/api/odgovori/error.odgovor';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ReCaptchaService} from '../../../jezgra/servisi/re-captcha.service';
import {take} from 'rxjs';

@Component({
	selector: 'app-prijava',
	templateUrl: './prijava.component.html',
	styleUrls: ['./prijava.component.scss']
})
export class PrijavaComponent implements OnInit, AfterViewInit, OnDestroy {
	loginGrupa!: FormGroup;
	error: string = '';

	constructor(
		private readonly _fb: FormBuilder,
		private readonly _recaptchaServis: ReCaptchaService,
		private readonly _authServis: AuthService,
		private readonly _ruter: Router
	) {
	}

	ngOnInit(): void {
		this.buildForm();
	}

	ngAfterViewInit(): void {
		this.setGRecaptchaOpacity(100);
	}

	ngOnDestroy() {
		this.setGRecaptchaOpacity(0);
	}

	prijava() {
		if (this.loginGrupa.valid && !this.loginGrupa.pristine) {
			this._recaptchaServis.getRecaptchaToken('prijava')
				.pipe(take(1))
				.subscribe({
					next: (token) => {
						const korisnik: PrijavaZahtjev = this.buildKorisnik(token);
						this.execPrijava(korisnik);
					},
					error: (err) => this.setErr({greska: err})
				});
		}
	}

	isNotValidno = (polje: string): boolean | undefined => this.loginGrupa.get(polje)?.invalid &&
		(this.loginGrupa.get(polje)?.dirty || this.loginGrupa.get(polje)?.touched);

	private buildForm() {
		this.loginGrupa = this._fb.group({
			korime: ['', Validators.compose([
				Validators.required,
				Validators.minLength(3),
				Validators.maxLength(50)])
			],
			lozinka: ['', [Validators.required]]
		});
	}

	private setGRecaptchaOpacity(opacity: number) {
		const gRecaptchaZnacka: HTMLElement | null = document.querySelector('.grecaptcha-badge');
		if (gRecaptchaZnacka) gRecaptchaZnacka.style.opacity = `${opacity}`;
	}

	private buildKorisnik(token: string): PrijavaZahtjev {
		return obradiUlaznePodatke(new PrijavaZahtjev(
			this.loginGrupa.value.korime,
			this.loginGrupa.value.lozinka,
			token
		));
	}

	private execPrijava(korisnik: PrijavaZahtjev): void {
		this._authServis.prijavi(korisnik)
			.subscribe({
				error: (err) => this.setErr(<IErrorOdgovor>err.error),
				complete: () => {
					this._authServis.setIsUlogiran(true);
					this._ruter.navigate(['/']);
				}
			});
	}

	private setErr(err: IErrorOdgovor): void {
		this.error = err.greska;
		setTimeout(() => this.error = '', 3000);
	}
}
