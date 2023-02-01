import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../../jezgra/servisi/auth.service';
import {Rola} from '../../../jezgra/modeli/jezgra/role';
import {Observable, Subscription} from 'rxjs';
import {Router} from '@angular/router';

@Component({
	selector: 'app-navigacija',
	templateUrl: './navigacija.component.html',
	styleUrls: ['./navigacija.component.scss']
})
export class NavigacijaComponent implements OnInit, OnDestroy {

	rola$?: Observable<Rola>;
	RolaType = Rola;

	private _subscription?: Subscription;

	constructor(
		private readonly _authServis: AuthService,
		private readonly _ruter: Router
	) {
	}

	ngOnInit(): void {
		this.rola$ = this._authServis.dohvatiRolu();
		this._subscription = this._authServis.getIsUlogiran().subscribe(_ => {
			this.ngOnDestroy();
			this.ngOnInit();
		});
	}

	ngOnDestroy(): void {
		this._subscription?.unsubscribe();
	}

	odjava() {
		this._authServis.odjavi()
			.subscribe({
				error: _ => alert('Neuspješna odjava'),
				complete: () => {
					this._authServis.setIsUlogiran(false);
					this._ruter.navigate(['/']);
				}
			});
	}
}
