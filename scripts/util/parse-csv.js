import fsp from 'fs/promises';

export async function parseCsv (path) {
	const csv = await fsp.readFile(path, 'utf-8');
	const lines = csv.split(/\r?\n/);
	const headers = lines[0].split(',');

	let outputObject = {}
	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		if (line.length == 0 && i == lines.length-1) continue;

		const obj = {};
		const currentLine = line.split(',');

		obj._columns = currentLine.length;

		for (let j = 0; j < headers.length; j++) {
			obj[headers[j]] = currentLine[j];
		}

		outputObject[obj['name']+'_v'+obj['version']] = obj;
	}

	return outputObject;
}