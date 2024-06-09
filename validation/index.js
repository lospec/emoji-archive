import fsp from 'fs/promises';
import { PNG } from 'pngjs';

const CURRENT_EMOJIS_PATH = '../current';
const OLD_EMOJIS_PATH = '../old';

const CURRENT_EMOJI_FILES = await fsp.readdir(CURRENT_EMOJIS_PATH);
const OLD_EMOJI_FILES = await fsp.readdir(OLD_EMOJIS_PATH);

for (const emojiFileName of CURRENT_EMOJI_FILES) {
	let emojiTrueName = emojiFileName.split('.')[0];

	try {
		if (!emojiFileName.includes('.png')) throw new Error('not a PNG file');

		const currentImage = await fsp.readFile(`${CURRENT_EMOJIS_PATH}/${emojiFileName}`);
		const currentImagePNG = PNG.sync.read(currentImage);
		if (currentImagePNG.width !== 16 || currentImagePNG.height !== 16) throw new Error('image size is not 16x16');

		console.log('✔️ current/'+emojiFileName);
	} catch (error) {
		console.log('❌ current/'+emojiFileName, error.message);
		process.exitCode = 1
	}

}

