export const pretvoriQueryParams = (objekt: any) => Object.keys(objekt)
	.filter(inx => objekt[inx] !== undefined)
	.map(inx => `${encodeURIComponent(inx)}=${encodeURIComponent(objekt[inx])}`)
	.join('&');
