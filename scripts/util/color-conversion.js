export function RGBToHex (r,g,b) {
	return ((r << 16) + (g << 8) + b).toString(16).padStart(6, '0');
}

export function HexToRGB (hex) {
	return [
		parseInt(hex.substring(0, 2), 16),
		parseInt(hex.substring(2, 4), 16),
		parseInt(hex.substring(4, 6), 16)
	];
}