import {Component} from '@angular/core';

@Component({
	selector: 'app-podnozje',
	templateUrl: './podnozje.component.html',
	styleUrls: ['./podnozje.component.scss']
})
export class PodnozjeComponent {
	trenutnaGodina: number = new Date().getFullYear();
}
