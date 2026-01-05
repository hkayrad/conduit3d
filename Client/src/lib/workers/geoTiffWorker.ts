/**
 * Web Worker for parsing GeoTiff files
 * Handles large files (>1GB) without blocking the main thread.
 * 
 * This worker supports:
 * - Parsing standard and COG GeoTIFFs
 * - Extracting CRS (Coordinate Reference System) from GeoKeys
 * - Handling large images via window sampling (resampling)
 * - Automatic normalization of raster values to 8-bit RGBA
 */

import { fromArrayBuffer, GeoTIFF, GeoTIFFImage } from "geotiff";

export interface GeoTiffWorkerMessage {
	type: "parse";
	arrayBuffer: ArrayBuffer;
}

export interface GeoTiffWorkerProgress {
	type: "progress";
	percent: number;
	message: string;
}

export interface GeoTiffWorkerResult {
	type: "result";
	imageData: ImageData;
	bounds: [number, number, number, number];
	crs: string | null;
	bandCount: number;
	width: number;
	height: number;
}

export interface GeoTiffWorkerError {
	type: "error";
	message: string;
}

export type GeoTiffWorkerResponse = GeoTiffWorkerProgress | GeoTiffWorkerResult | GeoTiffWorkerError;

/**
 * Extract EPSG code from GeoTiff GeoKeys.
 * 
 * @param image - The GeoTIFF image containing GeoKeys
 * @returns The EPSG string (e.g. "EPSG:4326") or null if not found/supported
 */
function extractCRS(image: GeoTIFFImage): string | null {
	try {
		const geoKeys = image.getGeoKeys();

		if (!geoKeys) return null;

		// Check for ProjectedCSTypeGeoKey (projected CRS)
		if (geoKeys.ProjectedCSTypeGeoKey) {
			const code = geoKeys.ProjectedCSTypeGeoKey;
			// User-defined CRS has code 32767
			if (code !== 32767) {
				return `EPSG:${code}`;
			}
		}

		// Check for GeographicTypeGeoKey (geographic CRS)
		if (geoKeys.GeographicTypeGeoKey) {
			const code = geoKeys.GeographicTypeGeoKey;
			// User-defined CRS has code 32767
			if (code !== 32767) {
				return `EPSG:${code}`;
			}
		}

		return null;
	} catch (error) {
		console.warn("Failed to extract CRS from GeoTiff:", error);
		return null;
	}
}

/**
 * Extract bounds from GeoTiff image.
 * 
 * @param image - The GeoTIFF image
 * @returns Bounding box as [minX, minY, maxX, maxY]
 */
function extractBounds(image: GeoTIFFImage): [number, number, number, number] {
	const bbox = image.getBoundingBox();
	// bbox is [minX, minY, maxX, maxY]
	return [bbox[0], bbox[1], bbox[2], bbox[3]];
}

/**
 * Normalize raster values to 0-255 range for display.
 * Uses iterative min/max finding to avoid stack overflow with large arrays.
 * 
 * @param values - Raw raster values
 * @param noDataValue - Value representing no data (transparency)
 * @returns 8-bit unsigned integer array suitable for ImageData
 */
function normalizeToUint8(values: ArrayLike<number>, noDataValue?: number): Uint8ClampedArray {
	const length = values.length;
	const result = new Uint8ClampedArray(length);

	// Find min/max iteratively to avoid stack overflow with spread operator
	let min = Infinity;
	let max = -Infinity;
	let hasValidValues = false;

	for (let i = 0; i < length; i++) {
		const v = values[i];
		if (noDataValue !== undefined && v === noDataValue) continue;
		if (v < min) min = v;
		if (v > max) max = v;
		hasValidValues = true;
	}

	if (!hasValidValues) {
		return result; // All nodata, return zeros
	}

	const range = max - min || 1; // Avoid division by zero

	for (let i = 0; i < length; i++) {
		const v = values[i];
		if (noDataValue !== undefined && v === noDataValue) {
			result[i] = 0; // Transparent for nodata
		} else {
			result[i] = Math.round(((v - min) / range) * 255);
		}
	}

	return result;
}

// Maximum dimension for output image 
// 4096x4096 = ~16M pixels, ~64MB for RGBA - safe for most browsers
const MAX_OUTPUT_DIMENSION = 16384;

/**
 * Calculate output dimensions that fit within limits while preserving aspect ratio
 */
function calculateOutputDimensions(width: number, height: number): { width: number; height: number; scaled: boolean } {
	if (width <= MAX_OUTPUT_DIMENSION && height <= MAX_OUTPUT_DIMENSION) {
		return { width, height, scaled: false };
	}

	const aspectRatio = width / height;
	let newWidth: number;
	let newHeight: number;

	if (width > height) {
		newWidth = MAX_OUTPUT_DIMENSION;
		newHeight = Math.floor(MAX_OUTPUT_DIMENSION / aspectRatio);
	} else {
		newHeight = MAX_OUTPUT_DIMENSION;
		newWidth = Math.floor(MAX_OUTPUT_DIMENSION * aspectRatio);
	}

	return { width: newWidth, height: newHeight, scaled: true };
}

/**
 * Find the largest image in the TIFF (the full resolution image)
 * Some TIFFs store overviews in unusual order
 */
async function findLargestImage(tiff: GeoTIFF): Promise<GeoTIFFImage> {
	const imageCount = await tiff.getImageCount();

	let largestImage = await tiff.getImage(0);
	let largestPixels = largestImage.getWidth() * largestImage.getHeight();

	for (let i = 1; i < imageCount; i++) {
		try {
			const img = await tiff.getImage(i);
			const pixels = img.getWidth() * img.getHeight();

			if (pixels > largestPixels) {
				largestImage = img;
				largestPixels = pixels;
			}
		} catch {
			continue;
		}
	}

	return largestImage;
}

/**
 * Find the best overview image for the target resolution
 * Returns the smallest image that's still larger than target dimensions
 */
async function findBestImage(tiff: GeoTIFF, targetWidth: number, targetHeight: number): Promise<GeoTIFFImage> {
	const imageCount = await tiff.getImageCount();

	// If only one image, return it
	if (imageCount === 1) {
		return tiff.getImage(0);
	}

	// Start with the first image as our best candidate
	let bestImage = await tiff.getImage(0);
	let bestWidth = bestImage.getWidth();
	let bestHeight = bestImage.getHeight();

	for (let i = 1; i < imageCount; i++) {
		try {
			const img = await tiff.getImage(i);
			const imgWidth = img.getWidth();
			const imgHeight = img.getHeight();

			// Skip if this image is smaller than our target
			if (imgWidth < targetWidth || imgHeight < targetHeight) {
				continue;
			}

			// Use this image if it's smaller than our current best but still larger than target
			if (imgWidth < bestWidth || bestWidth < targetWidth) {
				bestImage = img;
				bestWidth = imgWidth;
				bestHeight = imgHeight;
			}
		} catch {
			// Some images might not be readable overviews
			continue;
		}
	}

	// If best image is still smaller than target, find the largest available
	if (bestWidth < targetWidth || bestHeight < targetHeight) {
		return findLargestImage(tiff);
	}

	return bestImage;
}

/**
 * Parse GeoTiff and create ImageData for rendering
 */
async function parseGeoTiff(
	arrayBuffer: ArrayBuffer,
	postProgress: (progress: GeoTiffWorkerProgress) => void,
): Promise<GeoTiffWorkerResult> {
	postProgress({ type: "progress", percent: 5, message: "Reading GeoTiff file..." });

	const tiff: GeoTIFF = await fromArrayBuffer(arrayBuffer);

	postProgress({ type: "progress", percent: 10, message: "Parsing GeoTiff metadata..." });

	// Find the largest image to get true original dimensions
	// Some TIFFs have overviews stored in unusual order
	const largestImage = await findLargestImage(tiff);
	const originalWidth = largestImage.getWidth();
	const originalHeight = largestImage.getHeight();
	const bandCount = largestImage.getSamplesPerPixel();

	// Calculate output dimensions
	const { width: outputWidth, height: outputHeight, scaled } = calculateOutputDimensions(originalWidth, originalHeight);

	if (scaled) {
		postProgress({
			type: "progress",
			percent: 15,
			message: `Image: ${originalWidth}x${originalHeight} → resampling to ${outputWidth}x${outputHeight}`,
		});
	} else {
		postProgress({ type: "progress", percent: 15, message: `Image: ${originalWidth}x${originalHeight}, ${bandCount} band(s)` });
	}

	// Extract CRS and bounds from the largest (full resolution) image
	const crs = extractCRS(largestImage);
	const bounds = extractBounds(largestImage);

	postProgress({ type: "progress", percent: 20, message: "Finding best resolution..." });

	// Find the best overview image to read from
	const sourceImage = await findBestImage(tiff, outputWidth, outputHeight);
	const sourceWidth = sourceImage.getWidth();
	const sourceHeight = sourceImage.getHeight();

	// Check if the source image is still too large to decode
	// Browser typed arrays are limited to ~2GB, and we need space for multiple bands
	// For images without overviews, geotiff.js needs to decode the full image
	const maxSafePixels = 400_000_000 / bandCount; // ~400MB budget divided by bands
	const sourcePixels = sourceWidth * sourceHeight;

	let rasters;
	let actualOutputWidth = outputWidth;
	let actualOutputHeight = outputHeight;

	if (sourcePixels > maxSafePixels) {
		// Image is too large - try to read using window sampling
		// This reads every Nth pixel in both directions
		postProgress({
			type: "progress",
			percent: 25,
			message: `Image very large (${sourceWidth}x${sourceHeight}), using window sampling...`,
		});

		// Calculate step size to sample the image
		const stepX = Math.ceil(sourceWidth / outputWidth);
		const stepY = Math.ceil(sourceHeight / outputHeight);

		// Adjust output dimensions based on actual sampling
		actualOutputWidth = Math.ceil(sourceWidth / stepX);
		actualOutputHeight = Math.ceil(sourceHeight / stepY);

		// Check if even the sampled read would be too large
		const sampledSourcePixels = actualOutputWidth * actualOutputHeight;
		if (sampledSourcePixels * bandCount > 400_000_000) {
			throw new Error(
				`Image too large to process even with sampling: ${sourceWidth}x${sourceHeight} pixels (${bandCount} bands). ` +
				`Please convert to a Cloud Optimized GeoTIFF (COG) using: ` +
				`gdal_translate input.tif output.tif -of COG -co COMPRESS=LZW`
			);
		}

		postProgress({ type: "progress", percent: 30, message: `Sampling at 1:${stepX} ratio...` });

		// Read with window - read the full extent but at reduced resolution
		// Using the resampleMethod with explicit width/height
		try {
			rasters = await sourceImage.readRasters({
				interleave: false,
				width: actualOutputWidth,
				height: actualOutputHeight,
				resampleMethod: "nearest", // Use nearest for very large images (faster)
			});
		} catch (readError) {
			// If direct resampling fails, the image likely doesn't support it
			throw new Error(
				`Cannot process this GeoTIFF format. The image is ${sourceWidth}x${sourceHeight} pixels ` +
				`and doesn't support direct resampling. Please convert to a Cloud Optimized GeoTIFF (COG) using: ` +
				`gdal_translate input.tif output.tif -of COG -co COMPRESS=LZW -co OVERVIEWS=AUTO`
			);
		}
	} else {
		postProgress({
			type: "progress",
			percent: 25,
			message: `Reading from ${sourceWidth}x${sourceHeight} source...`
		});

		postProgress({ type: "progress", percent: 30, message: "Reading raster data..." });

		// Read raster data with resampling
		rasters = await sourceImage.readRasters({
			interleave: false,
			width: outputWidth,
			height: outputHeight,
			resampleMethod: "bilinear",
		});
	}

	postProgress({ type: "progress", percent: 70, message: "Processing image data..." });

	// Create RGBA ImageData with the output dimensions
	const imageData = new ImageData(actualOutputWidth, actualOutputHeight);
	const data = imageData.data;

	// Get file description to check for nodata value
	const fileDirectory = sourceImage.fileDirectory;
	const noDataValue = fileDirectory?.GDAL_NODATA ? parseFloat(fileDirectory.GDAL_NODATA) : undefined;

	postProgress({ type: "progress", percent: 80, message: "Converting to display format..." });

	const pixelCount = actualOutputWidth * actualOutputHeight;

	if (bandCount >= 3) {
		// RGB or RGBA image - use first 3 bands as RGB
		const redBand = normalizeToUint8(rasters[0] as ArrayLike<number>, noDataValue);
		const greenBand = normalizeToUint8(rasters[1] as ArrayLike<number>, noDataValue);
		const blueBand = normalizeToUint8(rasters[2] as ArrayLike<number>, noDataValue);

		for (let i = 0; i < pixelCount; i++) {
			const idx = i * 4;
			data[idx] = redBand[i]; // R
			data[idx + 1] = greenBand[i]; // G
			data[idx + 2] = blueBand[i]; // B
			// Alpha: transparent if all bands are 0 (likely nodata), otherwise opaque
			data[idx + 3] = redBand[i] === 0 && greenBand[i] === 0 && blueBand[i] === 0 ? 0 : 255;
		}
	} else {
		// Grayscale - use single band for all RGB channels
		const grayBand = normalizeToUint8(rasters[0] as ArrayLike<number>, noDataValue);

		for (let i = 0; i < pixelCount; i++) {
			const idx = i * 4;
			const value = grayBand[i];
			data[idx] = value; // R
			data[idx + 1] = value; // G
			data[idx + 2] = value; // B
			data[idx + 3] = value === 0 ? 0 : 255; // Alpha: transparent for zero values
		}
	}

	postProgress({ type: "progress", percent: 95, message: "Finalizing..." });

	return {
		type: "result",
		imageData,
		bounds,
		crs,
		bandCount,
		width: actualOutputWidth,
		height: actualOutputHeight,
	};
}

// Web Worker message handler
self.onmessage = async (event: MessageEvent<GeoTiffWorkerMessage>) => {
	const { type, arrayBuffer } = event.data;

	if (type !== "parse") {
		self.postMessage({
			type: "error",
			message: `Unknown message type: ${type}`,
		} as GeoTiffWorkerError);
		return;
	}

	try {
		const result = await parseGeoTiff(arrayBuffer, (progress) => {
			self.postMessage(progress);
		});

		self.postMessage(result);
	} catch (error) {
		self.postMessage({
			type: "error",
			message: error instanceof Error ? error.message : "Failed to parse GeoTiff",
		} as GeoTiffWorkerError);
	}
};

export { };
