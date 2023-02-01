import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NaslovnicaComponent} from './znacajke/stranice/naslovnica/naslovnica.component';
import {PrijavaComponent} from './znacajke/stranice/prijava/prijava.component';
import {DokumentacijaComponent} from './znacajke/stranice/dokumentacija/dokumentacija.component';
import {RegistracijaComponent} from './znacajke/stranice/registracija/registracija.component';
import {AuthGuard} from './jezgra/guardovi/auth.guard';
import {Rola} from './jezgra/modeli/jezgra/role';
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
import {FilmoviPrijedloziComponent} from './znacajke/stranice/filmovi/filmovi-prijedlozi/filmovi-prijedlozi.component';
import {ZanroviComponent} from './znacajke/stranice/zanrovi/zanrovi.component';

const rute: Routes = [
	{
		path: 'naslovnica',
		component: NaslovnicaComponent
	},
	{
		path: 'dokumentacija',
		component: DokumentacijaComponent
	},
	{
		path: 'prijava',
		component: PrijavaComponent
	},
	{
		path: 'registracija',
		component: RegistracijaComponent
	},
	{
		path: 'filmovi',
		canActivate: [AuthGuard],
		data: {
			rola: Rola.KORISNIK
		},
		component: FilmoviComponent,
		children: [
			{
				path: 'pregled',
				component: FilmoviPregledComponent
			},
			{
				path: 'pregled/:id',
				component: FilmDetaljiComponent
			},
			{
				path: 'pregled/:id/galerija',
				component: FilmGalerijaComponent
			},
			{
				path: 'pretrazivanje',
				component: FilmoviPretrazivanjeComponent
			},
			{
				path: 'prijedlozi',
				canActivate: [AuthGuard],
				data: {
					rola: Rola.ADMIN
				},
				component: FilmoviPrijedloziComponent
			},
			{path: '', redirectTo: 'pregled', pathMatch: 'full'}
		]
	},
	{
		path: 'zanrovi',
		canActivate: [AuthGuard],
		data: {
			rola: Rola.ADMIN
		},
		component: ZanroviComponent
	},
	{
		path: 'profil',
		canActivate: [AuthGuard],
		data: {
			rola: Rola.KORISNIK
		},
		component: ProfilComponent
	},
	{
		path: 'error',
		component: ErrorComponent,
		children: [
			{
				path: 'notfound',
				component: NotFoundComponent
			},
			{
				path: 'forbidden',
				component: ForbiddenComponent
			},
			{path: '', redirectTo: 'notfound', pathMatch: 'full'}
		]
	},
	{path: '', redirectTo: 'naslovnica', pathMatch: 'full'},
	{path: '**', component: NotFoundComponent}
];

@NgModule({
	imports: [RouterModule.forRoot(rute)],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
