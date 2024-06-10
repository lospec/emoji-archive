
const URL = 'https://lospec.com/palette-list/lospec-emoji.json';

export async function fetchEmojiPalette () {
	const response = await fetch(URL);
	const data = await response.json();
	return data.colors;
}