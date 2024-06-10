import { RGBToHex } from './color-conversion.js';
import { fetchEmojiPalette } from './fetch-emoji-palette.js';

const EMOJI_PALETTE = await fetchEmojiPalette();


export function ensureEmojiOnlyUsesPaletteColors (png) {
	const illegalColors = [];

	for (let i = 0; i < png.data.length; i += 4) {
		if (png.data[i+3] === 0) continue; //skip transparent pixels
		const color = RGBToHex(png.data[i], png.data[i+1], png.data[i+2]);
		if (!EMOJI_PALETTE.includes(color) && !illegalColors.includes(color)) 
			illegalColors.push(color);
	}

	if (illegalColors.length > 0) {
		throw 'image contains illegal colors: '+illegalColors.join(', ');
	}
}