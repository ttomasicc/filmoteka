import {Injectable} from '@angular/core';
import {
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpInterceptor
} from '@angular/common/http';
import {from, lastValueFrom, Observable} from 'rxjs';
import {AuthService} from '../servisi/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

	constructor(private _authServis: AuthService) {
	}

	intercept(zahtjev: HttpRequest<unknown>, sljedeci: HttpHandler): Observable<HttpEvent<unknown>> {
		const corsZahtjev = zahtjev.clone({
			withCredentials: true
		});

		if (this.isJWTzahtjev(corsZahtjev)) {
			return sljedeci.handle(corsZahtjev);
		}

		return from(this.postaviJWT(corsZahtjev, sljedeci));
	}

	private async postaviJWT(zahtjev: HttpRequest<unknown>, sljedeci: HttpHandler) {
		const token = await lastValueFrom(this._authServis.dohvatiJWT());

		if (token) {
			const authZahtjev = zahtjev.clone({
				setHeaders: {Authorization: `Bearer ${token}`}
			});

			return await lastValueFrom(sljedeci.handle(authZahtjev));
		}
		return await lastValueFrom(sljedeci.handle(zahtjev));
	}

	private isJWTzahtjev(zahtjev: HttpRequest<unknown>) {
		return /jwt/i.test(zahtjev.url);
	}
}
