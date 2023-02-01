import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {ZanrModel} from '../../../jezgra/modeli/jezgra/zanr.model';
import {ZanrService} from '../../../jezgra/servisi/zanr.service';

@Component({
	selector: 'app-naslovnica',
	templateUrl: './naslovnica.component.html',
	styleUrls: ['./naslovnica.component.scss']
})
export class NaslovnicaComponent implements OnInit {
	zanrovi$?: Observable<ZanrModel[]>;

	constructor(private readonly _zanrServis: ZanrService) {
	}

	ngOnInit(): void {
		this.zanrovi$ = this._zanrServis.dohvatiSve();
	}
}
