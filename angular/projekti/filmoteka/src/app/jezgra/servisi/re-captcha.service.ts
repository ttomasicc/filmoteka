import {Injectable} from '@angular/core';
import {Observable, Observer, take} from 'rxjs';
import {ReCaptchaV3Service} from 'ng-recaptcha';

@Injectable({
	providedIn: 'root'
})
export class ReCaptchaService {

	constructor(private readonly _reCaptchaV3Servis: ReCaptchaV3Service) {
	}

	getRecaptchaToken = (akcija: string): Observable<string> =>
		new Observable<string>((observer: Observer<string>) =>
			this._reCaptchaV3Servis
				.execute(akcija)
				.pipe(take(1))
				.subscribe({
					next: (token) => {
						observer.next(token);
						observer.complete();
					},
					error: (err) => observer.error(err)
				})
		);
}
