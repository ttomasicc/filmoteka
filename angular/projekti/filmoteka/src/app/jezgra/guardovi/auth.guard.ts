import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {lastValueFrom, Observable} from 'rxjs';
import {AuthService} from '../servisi/auth.service';
import {Rola} from '../modeli/jezgra/role';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate {

	constructor(
		private readonly _authServis: AuthService,
		private readonly _ruter: Router
	) {
	}

	canActivate(
		ruta: ActivatedRouteSnapshot,
		stanje: RouterStateSnapshot
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		const rola: Rola = ruta.data['rola'];

		if (rola) {
			return this.preusmjeri(rola)
		} else {
			return true;
		}
	}

	private async preusmjeri(rola: Rola): Promise<boolean | UrlTree> {
		const isAuth: boolean = await this.autoriziraj(rola);
		return isAuth ? true : this._ruter.createUrlTree(['/error/forbidden']);
	}

	private async autoriziraj(trazenaRola: Rola) : Promise<boolean> {
		const korisnikRola: Rola = await this.dohvatiRoluKorisnika();

		if (trazenaRola === Rola.ADMIN) {
			return korisnikRola === Rola.ADMIN;
		} else if (trazenaRola === Rola.KORISNIK) {
			return korisnikRola !== Rola.JAVNO;
		} else {
			return true;
		}
	}

	private async dohvatiRoluKorisnika(): Promise<Rola> {
		return lastValueFrom(this._authServis.dohvatiRolu());
	}
}
