import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NaslovnicaComponent} from './znacajke/stranice/naslovnica/naslovnica.component';
import {NavigacijaComponent} from './znacajke/komponente/navigacija/navigacija.component';
import {PodnozjeComponent} from './znacajke/komponente/podnozje/podnozje.component';
import {HttpClientModule} from '@angular/common/http';
import {ZanrGrupaComponent} from './znacajke/komponente/zanr-grupa/zanr-grupa.component';
import {FilmComponent} from './znacajke/komponente/film/film.component';
import {interceptori} from './jezgra/interceptori/interceptori';
import {PrijavaComponent} from './znacajke/stranice/prijava/prijava.component';
import {ReactiveFormsModule} from '@angular/forms';
import {DokumentacijaComponent} from './znacajke/stranice/dokumentacija/dokumentacija.component';
import {RegistracijaComponent} from './znacajke/stranice/registracija/registracija.component';
import {ProfilComponent} from './znacajke/stranice/profil/profil.component';
import {ForbiddenComponent} from './znacajke/errors/forbidden/forbidden.component';
import {NotFoundComponent} from './znacajke/errors/notfound/not-found.component';
import {ErrorComponent} from './znacajke/errors/error/error.component';
import {FilmoviPregledComponent} from './znacajke/stranice/filmovi/filmovi-pregled/filmovi-pregled.component';
import {FilmoviComponent} from './znacajke/stranice/filmovi/filmovi/filmovi.component';
import {FilmDetaljiComponent} from './znacajke/stranice/filmovi/film-detalji/film-detalji.component';
import {FilmGalerijaComponent} from './znacajke/stranice/filmovi/film-galerija/film-galerija.component';
import {
	FilmoviPretrazivanjeComponent
} from './znacajke/stranice/filmovi/filmovi-pretrazivanje/filmovi-pretrazivanje.component';
import {FilmTMDBComponent} from './znacajke/komponente/film-tmdb/film-tmdb.component';
import {FilmoviPrijedloziComponent} from './znacajke/stranice/filmovi/filmovi-prijedlozi/filmovi-prijedlozi.component';
import {FilmKontroleComponent} from './znacajke/komponente/film-kontrole/film-kontrole.component';
import {ZanroviComponent} from './znacajke/stranice/zanrovi/zanrovi.component';
import {ZanroviPopisComponent} from './znacajke/komponente/zanrovi-popis/zanrovi-popis.component';
import {ZanroviTMDBPopisComponent} from './znacajke/komponente/zanrovi-tmdb-popis/zanrovi-tmdb-popis.component';
import {FormaSlikaComponent} from './znacajke/komponente/forma-slika/forma-slika.component';
import {environment} from '../environments/environment';

@NgModule({
	declarations: [
		AppComponent,
		NaslovnicaComponent,
		NavigacijaComponent,
		PodnozjeComponent,
		ZanrGrupaComponent,
		FilmComponent,
		PrijavaComponent,
		DokumentacijaComponent,
		RegistracijaComponent,
		ProfilComponent,
		ForbiddenComponent,
		NotFoundComponent,
		ErrorComponent,
		FilmoviPregledComponent,
		FilmoviComponent,
		FilmDetaljiComponent,
		FilmGalerijaComponent,
		FilmoviPretrazivanjeComponent,
		FilmTMDBComponent,
		FilmoviPrijedloziComponent,
		FilmKontroleComponent,
		ZanroviComponent,
		ZanroviPopisComponent,
		ZanroviTMDBPopisComponent,
		FormaSlikaComponent
	],
	imports: [
		BrowserModule,
		HttpClientModule,
		AppRoutingModule,
		ReactiveFormsModule,
		RecaptchaV3Module
	],
	providers: [
		interceptori,
		{
			provide: RECAPTCHA_V3_SITE_KEY,
			useValue: environment.recaptcha.siteKey
		}
	],
	bootstrap: [AppComponent]
})
export class AppModule {
}
