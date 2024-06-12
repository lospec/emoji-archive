import fsp from 'fs/promises';
import { PNG } from 'pngjs';
import { parseCsv } from './util/parse-csv.js';

const START_TIME = Date.now();

const CURRENT_EMOJIS_PATH = '../current';
var CURRENT_EMOJI_FILES = await fsp.readdir(CURRENT_EMOJIS_PATH);
const EMOJI_CREDITS = await parseCsv('../credits.csv');

const OUTPUT_PATH = '../_compilation';
try {await fsp.access(OUTPUT_PATH);} 
catch (err) {	await fsp.mkdir(OUTPUT_PATH);console.log('created folder '+OUTPUT_PATH);}

const args = process.argv;

if (args.indexOf('-h') !== -1 || args.indexOf('-help') !== -1) {
	console.log('this script compiles all emojis into a single png file');
	console.log('Usage: node compile.js [-c columns] [-m margins] [-o offset]');
	console.log('-h or -help: display this message');
	console.log('-c or -columns: number of columns');
	console.log('-m or -margins: margin between emojis, horizontally and vertically, in pixels');
	console.log('-o or -offset: offset of each row horizontally from one above, in pixels');
	console.log('-s or -shuffle: shuffle the order of emojis');
	console.log('-j or -jitter: randomize the position of emojis by up to this many pixels');
	console.log('-r or -repeat: place every emoji this many times');
	console.log('-z or -zoom: integer to scale up the result by');
	console.log('-g or -categories: a comma separated list of categories to include (defaults to all)');
	process.exit(0);
}

let columns = 0;
let margins = 0;
let offset = 0;
let repeat = 0;
let shuffle = false;
let jitter = 0;
let zoom = 1;
let categories = ['all'];


ifArgumentSpecified('-g', '-categories', (value) => {
	if (!value) throw new Error('Categories value must be a string')
	if (value === 'all') return;
	categories = value.split(',');
	CURRENT_EMOJI_FILES = CURRENT_EMOJI_FILES.filter((emoji) => {
		let emojiTrueName = emoji.split('.')[0];
		let emojiData = EMOJI_CREDITS[emojiTrueName+'_v1'];
		return categories.includes(emojiData.category);
	});
});


ifArgumentSpecified('-r', '-repeat', (value) => {
	value = parseInt(value);
	if (isNaN(value)) throw new Error('Repeat value must be a number')
	repeat = value;
	let newEmojis = [];
	for (let i = 0; i < repeat; i++) 
		newEmojis = newEmojis.concat(CURRENT_EMOJI_FILES);
	CURRENT_EMOJI_FILES = newEmojis;
});

ifArgumentSpecified('-c', '-columns', (value) => {
	console.log('columns index found');
	value = parseInt(value);
	if (isNaN(value)) throw new Error('Columns value must be a number')
	columns = value;
}, () => {
	console.log('columns index not found');
	columns = Math.floor(Math.sqrt(CURRENT_EMOJI_FILES.length));
});

ifArgumentSpecified('-m', '-margins', (value) => {
	value = parseInt(value);
	if (isNaN(value)) throw new Error('Margins value must be a number')
	margins = value;
});

ifArgumentSpecified('-o', '-offset', (value) => {
	value = parseInt(value);
	if (isNaN(value)) throw new Error('Offset value must be a number')
	offset = value;
});

ifArgumentSpecified('-s', '-shuffle', () => {
	shuffle = true;
	//shuffle emojis
	for (let i = CURRENT_EMOJI_FILES.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[ CURRENT_EMOJI_FILES[i], CURRENT_EMOJI_FILES[j] ] = [ CURRENT_EMOJI_FILES[j], CURRENT_EMOJI_FILES[i] ];
	}
});

ifArgumentSpecified('-j', '-jitter', (value) => {
	value = parseInt(value);
	if (isNaN(value)) throw new Error('Jitter value must be a number')
	jitter = value;
});

ifArgumentSpecified('-z', '-zoom', (value) => {
	value = parseInt(value);
	if (zoom < 1) throw new Error('Zoom value must be greater than 0')
	if (isNaN(value)) throw new Error('Zoom value must be a number')
	zoom = value;
});

function ifArgumentSpecified (shorthandSwitch, longSwitch, functionIfSpecified, functionIfNotSpecified) {
	let argumentIndex = args.indexOf(shorthandSwitch) || args.indexOf(longSwitch);
	if (argumentIndex !== -1)
		functionIfSpecified(args[argumentIndex + 1]);
	else if (functionIfNotSpecified) 
		functionIfNotSpecified();
}

function getJitter () {
	return Math.floor(Math.random() * (jitter * 2)) - jitter;
}

let width = (16 * columns + (columns - 1) * margins) * zoom;
let height = ((16+margins) * Math.ceil(CURRENT_EMOJI_FILES.length / columns)) * zoom;

console.log("creating emoji compilation with the following settings: ");
console.log("emoji:", CURRENT_EMOJI_FILES.length);
console.log("columns: ", columns);
console.log("margins: ", margins);
console.log("offset: ", offset);
console.log("shuffle: ", shuffle);
console.log("jitter: ", jitter);
console.log("repeat: ", repeat);
console.log("zoom: ", zoom);
console.log("width: ", width);
console.log("height: ", height);
console.log("categories: ", categories);

let png = new PNG({width: width, height: height});

//load all emojis
for (let i = 0; i < CURRENT_EMOJI_FILES.length; i++) {
	let emojiFileName = CURRENT_EMOJI_FILES[i];
	let emojiTrueName = emojiFileName.split('.')[0];
	let emojiData = EMOJI_CREDITS[emojiTrueName+'_v1'];
	let currentImage = await fsp.readFile(`${CURRENT_EMOJIS_PATH}/${emojiFileName}`);
	let pngData = PNG.sync.read(currentImage).data;

	let row = Math.floor(i / columns);

	let x = ((i % columns) * (16 + margins) + row * offset + getJitter())*zoom;
	let y = (row * (16 + margins) + getJitter()) * zoom;

	for (let j = 0; j < 16; j++) {
		for (let k = 0; k < 16; k++) {
			let index = (j * 16 + k) * 4;
			let pngIndex = (((y + j * zoom) * width + x + k * zoom) * 4);

			if (pngData[index + 3] === 0) continue; //skip transparent pixels
			for (let l = 0; l < 4; l++) {
				png.data[pngIndex + l] = pngData[index + l];

				//repeat pixel for zoom
				if (zoom > 1) {
					for (let px = 0; px < zoom; px++) {
						for (let py = 0; py < zoom; py++) {
							png.data[pngIndex + l + (py * width + px) * 4] = pngData[index + l];
						}
					}
				}
			}
		}
	}
}

//save png
await fsp.writeFile(`${OUTPUT_PATH}/compiled.png`, PNG.sync.write(png));
const TIME_TAKEN = Date.now() - START_TIME;
console.log('compiled.png created in '+TIME_TAKEN+'ms');