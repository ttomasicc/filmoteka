import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../jezgra/servisi/auth.service';
import {Router} from '@angular/router';
import {obradiUlaznePodatke} from '../../../jezgra/moduli/validacija';
import {IErrorOdgovor} from '../../../jezgra/modeli/api/odgovori/error.odgovor';
import {RegistracijaZahtjev} from '../../../jezgra/modeli/api/zahtjevi/registracija.zahtjev';
import {ReCaptchaService} from '../../../jezgra/servisi/re-captcha.service';
import {take} from 'rxjs';

@Component({
	selector: 'app-registracija',
	templateUrl: './registracija.component.html',
	styleUrls: ['./registracija.component.scss']
})
export class RegistracijaComponent implements OnInit, AfterViewInit, OnDestroy {
	registracijaGrupa!: FormGroup;
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

	registracija() {
		if (this.registracijaGrupa.valid && !this.registracijaGrupa.pristine) {
			this._recaptchaServis.getRecaptchaToken('registracija')
				.pipe(take(1))
				.subscribe({
					next: (token) => {
						const korisnik: RegistracijaZahtjev = this.buildKorisnik(token);
						this.execRegistracija(korisnik);
					},
					error: (err) => this.setErr({greska: err})
				});
		}
	}

	isNotValidno = (polje: string): boolean | undefined => this.registracijaGrupa.get(polje)?.invalid &&
		(this.registracijaGrupa.get(polje)?.dirty || this.registracijaGrupa.get(polje)?.touched);

	private buildForm() {
		this.registracijaGrupa = this._fb.group({
			ime: ['', Validators.compose([
				Validators.required,
				Validators.minLength(3),
				Validators.maxLength(50)
			])],
			prezime: ['', Validators.compose([
				Validators.required,
				Validators.minLength(3),
				Validators.maxLength(70)
			])],
			korime: ['', Validators.compose([
				Validators.required,
				Validators.minLength(3),
				Validators.maxLength(50)
			])],
			email: ['', Validators.compose([
				Validators.required,
				Validators.email
			])],
			lozinka: ['', [Validators.required]]
		});
	}

	private setGRecaptchaOpacity(opacity: number) {
		const gRecaptchaZnacka: HTMLElement | null = document.querySelector('.grecaptcha-badge');
		if (gRecaptchaZnacka) gRecaptchaZnacka.style.opacity = `${opacity}`;
	}

	private buildKorisnik(token: string): RegistracijaZahtjev {
		return obradiUlaznePodatke(new RegistracijaZahtjev(
			this.registracijaGrupa.value.ime,
			this.registracijaGrupa.value.prezime,
			this.registracijaGrupa.value.korime,
			this.registracijaGrupa.value.email,
			this.registracijaGrupa.value.lozinka,
			token
		));
	}

	private execRegistracija(korisnik: RegistracijaZahtjev): void {
		this._authServis.registriraj(korisnik)
			.subscribe({
				error: (err) => this.setErr(<IErrorOdgovor>err.error),
				complete: () => {
					alert('Registracija uspješna!');
					this._ruter.navigate(['/prijava']);
				}
			});
	}

	private setErr(err: IErrorOdgovor): void {
		this.error = err.greska;
		setTimeout(() => this.error = '', 3000);
	}
}
