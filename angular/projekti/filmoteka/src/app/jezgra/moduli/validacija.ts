export function obradiUlaznePodatke<T>(objekt: any): T {
	for (const kljuc in objekt) {
		if (typeof objekt[kljuc] === 'string') {
			objekt[kljuc] = izbaciHTMLznakove(objekt[kljuc] as string);
		}
	}
	return objekt as T;
}

const izbaciHTMLznakove = (tekst: string): string => tekst
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/'/g, '&quot;')
	.replace(/'/g, '&#027;');
