import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../../jezgra/servisi/auth.service';
import {IErrorOdgovor} from '../../../jezgra/modeli/api/odgovori/error.odgovor';
import {AbstractControl, AbstractControlOptions, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ReCaptchaService} from '../../../jezgra/servisi/re-captcha.service';
import {Router} from '@angular/router';
import {RegistracijaZahtjev} from '../../../jezgra/modeli/api/zahtjevi/registracija.zahtjev';
import {obradiUlaznePodatke} from '../../../jezgra/moduli/validacija';
import {KorisnikAzuriranjeZahtjev} from '../../../jezgra/modeli/api/zahtjevi/korisnik-azuriranje.zahtjev';
import {KorisnikModel} from '../../../jezgra/modeli/jezgra/korisnik.model';
import {Observable, Subscription, tap} from 'rxjs';

@Component({
	selector: 'app-profil',
	templateUrl: './profil.component.html',
	styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit, AfterViewInit, OnDestroy {
	korisnik$?: Observable<KorisnikModel>;
	forma!: FormGroup;
	poruka: string = '';

	private _korisnikSub?: Subscription;

	constructor(
		private readonly _fb: FormBuilder,
		private readonly _recaptchaServis: ReCaptchaService,
		private readonly _authServis: AuthService,
		private readonly _ruter: Router
	) {
	}

	ngOnInit(): void {
		this.buildForm();
		this.korisnik$ = this._authServis.dohvatiKorisnika()
			.pipe(
				tap((korisnik) => this.forma.patchValue({
					ime: korisnik.ime,
					prezime: korisnik.prezime
				}))
			);
	}

	ngAfterViewInit(): void {
		this.setGRecaptchaOpacity(100);
	}

	ngOnDestroy() {
		this._korisnikSub?.unsubscribe();
		this.setGRecaptchaOpacity(0);
	}

	azuriraj() {
		if (this.forma.valid && !this.forma.pristine) {
			this._recaptchaServis.getRecaptchaToken('azuriranje').subscribe({
				next: (token) => {
					this.execAzuriranje(this.buildKorisnik(token));
					this.forma.patchValue({lozinka: ''});
				},
				error: (err) => this.setPoruka((<IErrorOdgovor>err.error).greska)
			});
		}
	}

	isNotValidno = (polje: string): boolean | undefined => this.forma.get(polje)?.invalid &&
		(this.forma.get(polje)?.dirty || this.forma.get(polje)?.touched);

	private buildForm() {
		this.forma = this._fb.group({
			ime: ['', Validators.compose([
				Validators.minLength(3),
				Validators.maxLength(50)
			])],
			prezime: ['', Validators.compose([
				Validators.minLength(3),
				Validators.maxLength(70)
			])],
			lozinka: ['']
		});
	}

	private setGRecaptchaOpacity(opacity: number) {
		const gRecaptchaZnacka: HTMLElement | null = document.querySelector('.grecaptcha-badge');
		if (gRecaptchaZnacka) gRecaptchaZnacka.style.opacity = `${opacity}`;
	}

	private buildKorisnik(token: string): KorisnikAzuriranjeZahtjev {
		return obradiUlaznePodatke(new KorisnikAzuriranjeZahtjev(
			this.forma.value.ime,
			this.forma.value.prezime,
			this.forma.value.lozinka,
			token
		));
	}

	private execAzuriranje(korisnik: KorisnikAzuriranjeZahtjev): void {
		this._authServis.azuriraj(korisnik)
			.subscribe({
				error: (err) => this.setPoruka((<IErrorOdgovor>err.error).greska),
				complete: () => this.setPoruka('Uspješno ažurirano!')
			});
	}

	private setPoruka(tekst: string): void {
		this.poruka = tekst;
		setTimeout(() => this.poruka = '', 3000);
	}
}
