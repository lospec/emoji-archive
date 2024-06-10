import fsp from 'fs/promises';
import { PNG } from 'pngjs';
import { RGBToHex, HexToRGB } from './util/color-conversion.js';
import { fetchEmojiPalette } from './util/fetch-emoji-palette.js';
import { ensureEmojiOnlyUsesPaletteColors } from './util/check-emoji-colors.js';

const CURRENT_EMOJIS_PATH = '../current';
const EMOJI_PALETTE = await fetchEmojiPalette();

const OUTPUT_PATH = '../_quantized';
//if folder doesnt exist create it
try {await fsp.access(OUTPUT_PATH);} 
catch (err) {	await fsp.mkdir(OUTPUT_PATH);console.log('created folder '+OUTPUT_PATH);}

const CURRENT_EMOJI_FILES = await fsp.readdir(CURRENT_EMOJIS_PATH);

let quantized = 0;

for (const emojiFileName of CURRENT_EMOJI_FILES) {
	const currentImage = await fsp.readFile(`${CURRENT_EMOJIS_PATH}/${emojiFileName}`);
	const png = PNG.sync.read(currentImage);

	try {ensureEmojiOnlyUsesPaletteColors(png)} catch (err) {
		quantizeImage(png);
		//save the png to a new file in the output folder
		const output = PNG.sync.write(png);
		await fsp.writeFile(`${OUTPUT_PATH}/${emojiFileName}`, output);

		quantized++;
		console.log('quantized '+emojiFileName);
	}
}

if (quantized === 0) console.log('no illegal colors found, 0 images quantized');
else
console.log('Found '+quantized+' emojis with illegal colors. Quantized images saved to '+OUTPUT_PATH+'/ folder. Review the changes, the replace originals if okay.');

function quantizeImage (png) {
	let imageData = new Uint8Array(png.data);
	for (let i = 0; i < imageData.length; i += 4) {
		if (imageData[i+3] === 0) continue; //skip transparent pixels
		const color = RGBToHex(imageData[i], imageData[i+1], imageData[i+2]);
		if (!EMOJI_PALETTE.includes(color)) {
			let closestColor = findClosestColor(imageData[i], imageData[i+1], imageData[i+2]);
			console.log('replacing color '+color+' with '+closestColor);
			imageData[i] = closestColor[0];
			imageData[i+1] = closestColor[1];
			imageData[i+2] = closestColor[2];
		}
	}
	png.data = Buffer.from(imageData);
}

function findClosestColor (r, g, b) {
	let closestColor = EMOJI_PALETTE[0];
	let closestDistance = distance(r, g, b, closestColor);
	for (const color of EMOJI_PALETTE) {
		const dist = distance(r, g, b, color);
		if (dist < closestDistance) {
			closestDistance = dist;
			closestColor = color;
		}
	}
	return HexToRGB(closestColor);
}

function distance (r1, g1, b1, color) {
	const [r2, g2, b2] = HexToRGB(color);
	return Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2);
}