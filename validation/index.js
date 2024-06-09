import { error } from 'console';
import fsp from 'fs/promises';
import { PNG } from 'pngjs';

const CURRENT_EMOJIS_PATH = '../current';
const OLD_EMOJIS_PATH = '../old';

const CURRENT_EMOJI_FILES = await fsp.readdir(CURRENT_EMOJIS_PATH);
const OLD_EMOJI_FILES = await fsp.readdir(OLD_EMOJIS_PATH);

console.log("checking current emojis...");

for (const emojiFileName of CURRENT_EMOJI_FILES) {
	let emojiTrueName = emojiFileName.split('.')[0];
	let errors = [];

	if (!/^[a-z]+$/.test(emojiTrueName)) errors.push('name contains invalid characters');

	if (emojiFileName.includes('.png')) {
		try {
			const currentImage = await fsp.readFile(`${CURRENT_EMOJIS_PATH}/${emojiFileName}`);
			const png = PNG.sync.read(currentImage);

			if (png.width !== 16) errors.push('image width is '+png.width+' instead of 16');
			if (png.height !== 16) errors.push('image height is '+png.height+' instead of 16');
			

		} catch (err) {
			errors.push('failed to load png: '+err);
		}
	}
	else errors.push('file extension is not .png');


	if (errors.length == 0) console.log('✔️ current/'+emojiFileName);
	else {
		//loop through errors and print out each one
		errors.forEach((err) => {
			console.error('❌ current/'+emojiFileName+' - '+err);
		});
		process.exitCode = 1;
	}
}
