import fsp from 'fs/promises';

export async function parseCsv (path) {
	const csv = await fsp.readFile(path, 'utf-8');
	const lines = csv.split(/\r?\n/);
	const headers = lines[0].split(',');

	let outputObject = {}
	for (let i = 1; i < lines.length; i++) {
		const obj = {};
		const currentLine = lines[i].split(',');

		for (let j = 0; j < headers.length; j++) {
			obj[headers[j]] = currentLine[j];
		}

		outputObject[obj['name']+'_v'+obj['version']] = obj;
	}

	return outputObject;
}