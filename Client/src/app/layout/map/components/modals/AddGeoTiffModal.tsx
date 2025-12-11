import React, { useState, useRef, useCallback } from "react";
import { useAppDispatch } from "../../../../../lib/hooks";
import { addGeoTiffLayer } from "../../mapSlice";
import { AlertTriangle, Info, FileImage } from "lucide-react";
import {
	reprojectBounds,
	normalizeCRS,
	isCRSSupported,
	SUPPORTED_CRS_OPTIONS,
} from "../../../../../lib/utils/projection";
import type { GeoTiffWorkerResponse } from "../../../../../lib/workers/geoTiffWorker";
import type { BandMapping } from "../../../../../lib/types";
import "./style/addGeoTiffModal.scss";

interface AddGeoTiffModalProps {
	isOpen: boolean;
	onClose: () => void;
}

// RAM warning threshold (500MB)
const RAM_WARNING_THRESHOLD = 500 * 1024 * 1024;

// Format file size for display
function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function AddGeoTiffModal({ isOpen, onClose }: AddGeoTiffModalProps) {
	const dispatch = useAppDispatch();
	const workerRef = useRef<Worker | null>(null);

	// Form state
	const [name, setName] = useState("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	// Parsing state
	const [isParsing, setIsParsing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [progressMessage, setProgressMessage] = useState("");

	// Parsed data state
	const [parsedData, setParsedData] = useState<{
		imageData: ImageData;
		bounds: [number, number, number, number];
		crs: string | null;
		bandCount: number;
		width: number;
		height: number;
	} | null>(null);

	// CRS state
	const [detectedCRS, setDetectedCRS] = useState<string | null>(null);
	const [selectedCRS, setSelectedCRS] = useState<string>("EPSG:4326");
	const [crsAutoDetected, setCrsAutoDetected] = useState(false);

	// Band mapping state
	const [bandMode, setBandMode] = useState<"rgb" | "grayscale">("rgb");
	const [redBand, setRedBand] = useState(0);
	const [greenBand, setGreenBand] = useState(1);
	const [blueBand, setBlueBand] = useState(2);
	const [grayBand, setGrayBand] = useState(0);

	// Error state
	const [error, setError] = useState<string | null>(null);

	const resetState = useCallback(() => {
		setName("");
		setSelectedFile(null);
		setIsParsing(false);
		setProgress(0);
		setProgressMessage("");
		setParsedData(null);
		setDetectedCRS(null);
		setSelectedCRS("EPSG:4326");
		setCrsAutoDetected(false);
		setBandMode("rgb");
		setRedBand(0);
		setGreenBand(1);
		setBlueBand(2);
		setGrayBand(0);
		setError(null);

		// Terminate worker if exists
		if (workerRef.current) {
			workerRef.current.terminate();
			workerRef.current = null;
		}
	}, []);

	const handleClose = useCallback(() => {
		resetState();
		onClose();
	}, [resetState, onClose]);

	const handleFileSelect = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			setSelectedFile(file);
			setError(null);
			setParsedData(null);
			setDetectedCRS(null);
			setCrsAutoDetected(false);

			// Auto-set name from filename
			if (!name) {
				const baseName = file.name.replace(/\.(tif|tiff|geotiff)$/i, "");
				setName(baseName);
			}

			// Start parsing
			setIsParsing(true);
			setProgress(0);
			setProgressMessage("Initializing...");

			try {
				// Read file as ArrayBuffer
				const arrayBuffer = await file.arrayBuffer();

				// Create Web Worker
				workerRef.current = new Worker(
					new URL("../../../../../lib/workers/geoTiffWorker.ts", import.meta.url),
					{ type: "module" },
				);

				workerRef.current.onmessage = (event: MessageEvent<GeoTiffWorkerResponse>) => {
					const response = event.data;

					if (response.type === "progress") {
						setProgress(response.percent);
						setProgressMessage(response.message);
					} else if (response.type === "result") {
						setParsedData({
							imageData: response.imageData,
							bounds: response.bounds,
							crs: response.crs,
							bandCount: response.bandCount,
							width: response.width,
							height: response.height,
						});

						// Handle CRS
						const normalizedCRS = normalizeCRS(response.crs);
						if (normalizedCRS && isCRSSupported(normalizedCRS)) {
							setDetectedCRS(normalizedCRS);
							setSelectedCRS(normalizedCRS);
							setCrsAutoDetected(true);
						} else if (normalizedCRS) {
							setDetectedCRS(normalizedCRS);
							setCrsAutoDetected(false);
							setError(`Detected CRS "${normalizedCRS}" is not supported. Please select a CRS manually.`);
						} else {
							setCrsAutoDetected(false);
						}

						// Set appropriate band mode based on band count
						if (response.bandCount < 3) {
							setBandMode("grayscale");
						}

						setProgress(100);
						setProgressMessage("Complete!");
						setIsParsing(false);

						// Cleanup worker
						workerRef.current?.terminate();
						workerRef.current = null;
					} else if (response.type === "error") {
						setError(response.message);
						setIsParsing(false);
						workerRef.current?.terminate();
						workerRef.current = null;
					}
				};

				workerRef.current.onerror = (err) => {
					setError(`Worker error: ${err.message}`);
					setIsParsing(false);
					workerRef.current?.terminate();
					workerRef.current = null;
				};

				// Send file to worker
				workerRef.current.postMessage({ type: "parse", arrayBuffer }, [arrayBuffer]);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to read file");
				setIsParsing(false);
			}
		},
		[name],
	);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();

			if (!parsedData || !name) return;

			// Reproject bounds to WGS84 if needed
			let finalBounds = parsedData.bounds;
			if (selectedCRS !== "EPSG:4326") {
				try {
					finalBounds = reprojectBounds(parsedData.bounds, selectedCRS, "EPSG:4326");
				} catch (err) {
					setError(`Failed to reproject bounds: ${err instanceof Error ? err.message : "Unknown error"}`);
					return;
				}
			}

			// Create band mapping
			const bandMapping: BandMapping =
				bandMode === "rgb"
					? {
							mode: "rgb",
							redBand,
							greenBand,
							blueBand,
						}
					: {
							mode: "grayscale",
							grayBand,
						};

			// Add layer to Redux
			dispatch(
				addGeoTiffLayer({
					id: Math.random().toString(36).substr(2, 9),
					name,
					bounds: finalBounds,
					visible: true,
					opacity: 1,
					imageData: parsedData.imageData,
					sourceCRS: selectedCRS,
					fileSize: selectedFile?.size || 0,
					bandCount: parsedData.bandCount,
					bandMapping,
				}),
			);

			handleClose();
		},
		[parsedData, name, selectedCRS, bandMode, redBand, greenBand, blueBand, grayBand, selectedFile, dispatch, handleClose],
	);

	if (!isOpen) return null;

	const showRamWarning = selectedFile && selectedFile.size > RAM_WARNING_THRESHOLD;
	const estimatedRam = selectedFile ? selectedFile.size * 4 : 0; // Rough estimate: ~4x for decoded RGBA
	const canSubmit = parsedData && name && !isParsing && !error;

	return (
		<>
			<div className="modal-overlay" onClick={handleClose} />
			<div className="add-geotiff-modal" onKeyDown={(e) => e.stopPropagation()}>
				<h2>
					<FileImage size={20} style={{ marginRight: 8, verticalAlign: "middle" }} />
					Add GeoTiff Layer
				</h2>

				<form onSubmit={handleSubmit}>
					{/* File Input */}
					<div className="form-group">
						<label htmlFor="geotiff-file">GeoTiff File</label>
						<div className="file-input-wrapper">
							<input
								id="geotiff-file"
								type="file"
								accept=".tif,.tiff,.geotiff"
								onChange={handleFileSelect}
								disabled={isParsing}
							/>
						</div>
						<div className="help-text">Supports .tif, .tiff, .geotiff files</div>
					</div>

					{/* RAM Warning */}
					{showRamWarning && (
						<div className="warning-box">
							<div className="warning-title">
								<AlertTriangle size={16} />
								Large File Warning
							</div>
							<div className="warning-text">
								This file is {formatFileSize(selectedFile!.size)}. Estimated RAM usage: ~
								{formatFileSize(estimatedRam)}. Large files may cause performance issues or browser crashes.
							</div>
						</div>
					)}

					{/* Progress Bar */}
					{isParsing && (
						<div className="progress-container">
							<div className="progress-header">
								<span>Parsing GeoTiff...</span>
								<span>{progress}%</span>
							</div>
							<div className="progress-bar-wrapper">
								<div className="progress-bar" style={{ width: `${progress}%` }} />
							</div>
							<div className="progress-message">{progressMessage}</div>
						</div>
					)}

					{/* Error Display */}
					{error && (
						<div className="warning-box">
							<div className="warning-title">
								<AlertTriangle size={16} />
								Error
							</div>
							<div className="warning-text">{error}</div>
						</div>
					)}

					{/* Parsed Metadata */}
					{parsedData && (
						<div className="metadata-section">
							<h3>Image Information</h3>
							<div className="metadata-grid">
								<span className="metadata-label">Dimensions:</span>
								<span className="metadata-value">
									{parsedData.width} × {parsedData.height} px
								</span>
								<span className="metadata-label">Bands:</span>
								<span className="metadata-value">{parsedData.bandCount}</span>
								<span className="metadata-label">File Size:</span>
								<span className="metadata-value">{formatFileSize(selectedFile?.size || 0)}</span>
							</div>
						</div>
					)}

					{/* CRS Selection */}
					{parsedData && (
						<>
							{crsAutoDetected ? (
								<div className="info-box">
									<div className="info-title">
										<Info size={16} />
										CRS Detected
									</div>
									<div className="info-text">
										Coordinate Reference System automatically detected: {detectedCRS}
									</div>
								</div>
							) : (
								<div className="crs-warning-box">
									<div className="warning-title">
										<AlertTriangle size={16} />
										CRS Not Detected
									</div>
									<div className="warning-text">
										Could not auto-detect the coordinate system.
										{detectedCRS && ` Detected "${detectedCRS}" but it's not in our supported list.`}
										{" "}Please select manually:
									</div>
								</div>
							)}

							<div className="form-group">
								<label htmlFor="crs-select">Coordinate Reference System</label>
								<select
									id="crs-select"
									value={selectedCRS}
									onChange={(e) => setSelectedCRS(e.target.value)}
								>
									{SUPPORTED_CRS_OPTIONS.map((option) => (
										<option key={option.code} value={option.code}>
											{option.code} - {option.name}
										</option>
									))}
								</select>
							</div>
						</>
					)}

					{/* Band Mapping (only for multi-band images) */}
					{parsedData && parsedData.bandCount > 1 && (
						<div className="band-mapping-section">
							<h3>Band Mapping</h3>
							<div className="band-mode-toggle">
								<button
									type="button"
									className={bandMode === "rgb" ? "active" : ""}
									onClick={() => setBandMode("rgb")}
									disabled={parsedData.bandCount < 3}
								>
									RGB
								</button>
								<button
									type="button"
									className={bandMode === "grayscale" ? "active" : ""}
									onClick={() => setBandMode("grayscale")}
								>
									Grayscale
								</button>
							</div>

							{bandMode === "rgb" && parsedData.bandCount >= 3 ? (
								<div className="band-selectors">
									<div className="band-selector">
										<label>Red Channel</label>
										<select value={redBand} onChange={(e) => setRedBand(Number(e.target.value))}>
											{Array.from({ length: parsedData.bandCount }, (_, i) => (
												<option key={i} value={i}>
													Band {i + 1}
												</option>
											))}
										</select>
									</div>
									<div className="band-selector">
										<label>Green Channel</label>
										<select value={greenBand} onChange={(e) => setGreenBand(Number(e.target.value))}>
											{Array.from({ length: parsedData.bandCount }, (_, i) => (
												<option key={i} value={i}>
													Band {i + 1}
												</option>
											))}
										</select>
									</div>
									<div className="band-selector">
										<label>Blue Channel</label>
										<select value={blueBand} onChange={(e) => setBlueBand(Number(e.target.value))}>
											{Array.from({ length: parsedData.bandCount }, (_, i) => (
												<option key={i} value={i}>
													Band {i + 1}
												</option>
											))}
										</select>
									</div>
								</div>
							) : (
								<div className="band-selectors grayscale">
									<div className="band-selector">
										<label>Display Band</label>
										<select value={grayBand} onChange={(e) => setGrayBand(Number(e.target.value))}>
											{Array.from({ length: parsedData.bandCount }, (_, i) => (
												<option key={i} value={i}>
													Band {i + 1}
												</option>
											))}
										</select>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Layer Name */}
					<div className="form-group">
						<label htmlFor="layer-name">Layer Name</label>
						<input
							id="layer-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g. Satellite Image"
							required
						/>
					</div>

					{/* Actions */}
					<div className="modal-actions">
						<button type="button" className="cancel-btn" onClick={handleClose}>
							Cancel
						</button>
						<button type="submit" className="add-btn" disabled={!canSubmit}>
							Add Layer
						</button>
					</div>
				</form>
			</div>
		</>
	);
}
