import fsp from 'fs/promises';
import { PNG } from 'pngjs';

import { parseCsv } from './util/parse-csv.js';
import { ensureEmojiOnlyUsesPaletteColors } from './util/check-emoji-colors.js';
import { comesFirstAlphabetically } from './util/comes-first-alphabetically.js';

const CURRENT_EMOJIS_PATH = '../current';
const OLD_EMOJIS_PATH = '../old';


//import data/discord-emoji-list.json

const DISCORD_EMOJI_LIST = JSON.parse(await fsp.readFile('./data/discord-emoji-list.json', 'utf-8'));
const CURRENT_EMOJI_FILES = await fsp.readdir(CURRENT_EMOJIS_PATH);
const EMOJI_CREDITS = await parseCsv('../credits.csv');
const OLD_EMOJI_FILES = await fsp.readdir(OLD_EMOJIS_PATH);
const CATEGORIES = (await fsp.readFile('./data/categories.csv', 'utf-8')).split(',');
console.log('\nvalidating credits.csv...');

//loop through all emojis in credits.csv
// make sure each one is either the same as the one before it with the version increased by 1, or comes after the one before it alphabetically
let lastEmoji = '';
let lastVersion = 0;
for (const emoji in EMOJI_CREDITS) {
	if (lastEmoji) {
		let version = parseInt(emoji.split('_')[1].replace('v', ''));
		if (version > 1) {
			if (version !== lastVersion+1) {
				console.error('❌ '+emoji+' - bad version, should come after '+lastEmoji);
				process.exitCode = 1;
			}
			if (EMOJI_CREDITS[emoji].category !== EMOJI_CREDITS[lastEmoji].category) {
				console.error('❌ '+emoji+' - doesn\'t match category of previous version');
				process.exitCode = 1;
			}
		}
		else if (emoji !== lastEmoji) {
			if (comesFirstAlphabetically(EMOJI_CREDITS[emoji].name, EMOJI_CREDITS[lastEmoji].name)) {
				console.error('❌ '+emoji+' - should come before '+lastEmoji+ ' alphabetically');
				process.exitCode = 1;
			}
		}

		lastVersion = version;
	}
	lastEmoji = emoji;

	if (!EMOJI_CREDITS[emoji].name) {
		console.error('❌ '+emoji+' - missing name');
		process.exitCode = 1;
	}
	if (!EMOJI_CREDITS[emoji].author) {
		console.error('❌ '+emoji+' - missing author');
		process.exitCode = 1;
	}
	if (!EMOJI_CREDITS[emoji].date) {
		console.error('❌ '+emoji+' - missing date');
		process.exitCode = 1;
	}
	if (!EMOJI_CREDITS[emoji].category) {
		console.error('❌ '+emoji+' - missing category');
		process.exitCode = 1;
	}
}



console.log("\nchecking current emojis...");

for (const emojiFileName of CURRENT_EMOJI_FILES) {
	let emojiTrueName = emojiFileName.split('.')[0];
	let errors = [];

	if (!/^[a-z0-9]+$/.test(emojiTrueName)) errors.push('name contains invalid characters');
	if (DISCORD_EMOJI_LIST.includes(emojiTrueName)) errors.push('emoji name already used by discord');

	let credit = EMOJI_CREDITS[emojiTrueName+"_v1"];
	if (credit) {
		let latestVersion = 1;
		while (EMOJI_CREDITS[emojiTrueName+"_v"+(latestVersion+1)]) latestVersion++;
		credit = EMOJI_CREDITS[emojiTrueName+"_v"+latestVersion];

		if (!credit.author || credit.author.length == 0) errors.push('missing original_author');
		if (!credit.date || credit.date.length == 0) errors.push('missing date');

		if (!credit.category || credit.category.length == 0) errors.push('missing category');
		else if (!CATEGORIES.includes(credit.category)) errors.push('invalid category "'+credit.category+'")');

		else if (!/^\d{4}-\d{2}-\d{2}$/.test(credit.date)) errors.push('date is not in yyyy-mm-dd format');
	} else
		errors.push('missing credit');

	if (emojiFileName.includes('.png')) {
		try {
			const currentImage = await fsp.readFile(`${CURRENT_EMOJIS_PATH}/${emojiFileName}`);
			const png = PNG.sync.read(currentImage);

			if (png.width !== 16) errors.push('image width is '+png.width+' instead of 16');
			if (png.height !== 16) errors.push('image height is '+png.height+' instead of 16');
			try {ensureEmojiOnlyUsesPaletteColors(png)} catch (err) {errors.push(err)}


		} catch (err) {
			errors.push('failed to load png: '+err);
		}
	}
	else errors.push('file extension is not .png');


	if (errors.length == 0) console.log('✔️ current/'+emojiFileName);
	else {
		errors.forEach((err) => {console.error('❌ current/'+emojiFileName+' - '+err);});
		process.exitCode = 1;
	}
}


console.log("\nchecking old emojis...");

for (const emojiFileName of OLD_EMOJI_FILES) {
	let emojiFullName = emojiFileName.split('.')[0];
	let emojiTrueName = emojiFullName.split('_')[0];
	let emojiVersion = emojiFullName.split('_')[1].replace('v', '');
	let errors = [];

	if (!/^[a-z0-9]+$/.test(emojiTrueName)) errors.push('name contains invalid characters');
	if (!/^\d+$/.test(emojiVersion)) errors.push('version "'+emojiVersion+'" is not a number');

	let version = EMOJI_CREDITS[emojiFullName];
	if (version) {
		
		if (version.version > 1){
			let previousVersion = emojiTrueName+'_v'+(version.version-1) + '.png';
			if (!OLD_EMOJI_FILES.includes(previousVersion)) errors.push('previous version (v'+(version.version-1)+') does not exist');
		}

		if (!version.author || version.author.length == 0) errors.push('missing author');

		if (!version.date || version.date.length == 0) errors.push('missing date');
		else if (!/^\d{4}-\d{2}-\d{2}$/.test(version.date)) errors.push('date is not in yyyy-mm-dd format');

	} else
		errors.push('missing version info');

	if (!CURRENT_EMOJI_FILES.includes(emojiTrueName+'.png')) errors.push('corresponding current emoji not found');

	if (!emojiFileName.includes('.png')) errors.push('file extension is not .png');

	if (errors.length == 0) console.log('✔️ old/'+emojiFileName);
	else {
		errors.forEach((err) => {console.error('❌ old/'+emojiFileName+' - '+err);});
		process.exitCode = 1;
	}
}

if (process.exitCode) console.error('\nRESULT: ❌ validation failed');
else console.log('\nRESULT: ✔️ validation passed');


function failValidation (message) {
	console.error('❌ '+message);
	process.exitCode = 1;
}