import { Image } from '@node-3d/core';

function checkCapture(path: string, width: number, height: number, pixels: Buffer): void {
	if (!/\.png$/i.test(path)) throw new Error('Capture path must end in .png');
	if (width < 1 || height < 1 || pixels.length < width * height * 4) {
		throw new Error('Capture buffer is too small');
	}
}

/** Verify visible image variation in a scene without a GUI panel. */
export function scenePixelVariation(width: number, height: number, pixels: Buffer): number {
	const background = [pixels[0], pixels[1], pixels[2]];
	let changed = 0;
	for (let y = 0; y < height && changed < 8; y++) {
		for (let x = 0; x < width && changed < 8; x++) {
			const offset = (y * width + x) * 4;
			const difference =
				Math.abs(pixels[offset] - background[0]) +
				Math.abs(pixels[offset + 1] - background[1]) +
				Math.abs(pixels[offset + 2] - background[2]);
			if (difference > 24) changed++;
		}
	}
	return changed;
}

/** Verify visible image variation in a scene without a GUI panel. */
export function saveSceneCapture(
	path: string,
	width: number,
	height: number,
	pixels: Buffer,
): void {
	checkCapture(path, width, height, pixels);
	if (process.argv.includes('--trace')) console.log(`Scene capture entering ${width}x${height}`);
	const changed = scenePixelVariation(width, height, pixels);
	if (process.argv.includes('--trace')) console.log(`Scene capture sampled ${changed}`);
	if (changed < 8) throw new Error(`Scene capture looks empty: ${changed} sampled pixels differ`);
	if (process.argv.includes('--trace'))
		console.log(`Scene capture has ${changed} differing samples`);
	const image = Image.fromPixels(width, height, 32, pixels);
	if (process.argv.includes('--trace')) console.log('Scene capture image created');
	image.save(path);
	if (process.argv.includes('--trace')) console.log('Scene capture image saved');
}

/** Verify and save the native panel from bottom-up OpenGL RGBA pixels. */
export function saveVerifiedCapture(
	path: string,
	width: number,
	height: number,
	pixels: Buffer,
): void {
	checkCapture(path, width, height, pixels);
	if (width < 415 || height < 100 || pixels.length < width * height * 4) {
		throw new Error('Capture dimensions are too small for the panel probe');
	}
	for (const x of [100, 200, 300]) {
		const offset = ((height - 26) * width + x) * 4;
		const red = pixels[offset];
		const green = pixels[offset + 1];
		const blue = pixels[offset + 2];
		if (blue < 80 || blue <= green || green <= red) {
			throw new Error(`Panel header missing at ${x},25: ${red},${green},${blue}`);
		}
	}
	Image.fromPixels(width, height, 32, pixels).save(path);

	// A small crop remains legible in image viewers that downsample full-frame previews.
	const cropWidth = 450;
	const cropHeight = 100;
	const crop = Buffer.allocUnsafeSlow(cropWidth * cropHeight * 4);
	for (let row = 0; row < cropHeight; row++) {
		const source = (height - cropHeight + row) * width * 4;
		pixels.copy(crop, row * cropWidth * 4, source, source + cropWidth * 4);
	}
	Image.fromPixels(cropWidth, cropHeight, 32, crop).save(path.replace(/\.png$/i, '-panel.png'));
}
