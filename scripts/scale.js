import fsp from 'fs/promises';
import { PNG } from 'pngjs';

const CURRENT_EMOJIS_PATH = '../current';
const CURRENT_EMOJI_FILES = await fsp.readdir(CURRENT_EMOJIS_PATH);

if (process.argv.length !== 3) {
	console.log("scale must be passed as an argument");
	process.exit(1);
}

const scale = parseInt(process.argv[2]);

if (isNaN(scale)) {
	console.log("scale must be a number");
	process.exit(1);
}

var output_path = `../_scaled_${scale}x`;
try {await fsp.access(output_path);} 
catch (err) {	await fsp.mkdir(output_path);console.log('created folder '+output_path);}

console.log('scaling images by a factor of '+scale);

let scaledImages = 0;

for (const emojiFileName of CURRENT_EMOJI_FILES) {
	const currentImage = await fsp.readFile(`${CURRENT_EMOJIS_PATH}/${emojiFileName}`);
	const sourcePng = PNG.sync.read(currentImage);
	const targetPng = new PNG({width: sourcePng.width*scale, height: sourcePng.height*scale});

	for (let y = 0; y < sourcePng.height; y++) {
		for (let x = 0; x < sourcePng.width; x++) {
			const idx = (sourcePng.width * y + x) << 2;
			const color = {
				r: sourcePng.data[idx],
				g: sourcePng.data[idx+1],
				b: sourcePng.data[idx+2],
				a: sourcePng.data[idx+3]
			};

			for (let dy = 0; dy < scale; dy++) {
				for (let dx = 0; dx < scale; dx++) {
					const targetIdx = (targetPng.width * (y*scale + dy) + (x*scale + dx)) << 2;
					targetPng.data[targetIdx] = color.r;
					targetPng.data[targetIdx+1] = color.g;
					targetPng.data[targetIdx+2] = color.b;
					targetPng.data[targetIdx+3] = color.a;
				}
			}
		}
	}

	const output = PNG.sync.write(targetPng);
	await fsp.writeFile(`${output_path}/${emojiFileName}`, output);
	console.log('scaled',emojiFileName);
	scaledImages++;
}

console.log('done scaling',scaledImages,'images, saved to',output_path);
