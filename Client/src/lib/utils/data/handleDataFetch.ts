import type { Extent } from "../../types";
import { CHUNK_SIZE, MAX_CHUNK_AMOUNT } from "../../constants";
import { Logger } from "../logger";
import { sleep } from "../sleep";

export const handleDataFetch = async (
    isLoadingRef: React.RefObject<boolean>,
    abortControllerRef: React.RefObject<AbortController | null>,
    extent: Extent,
    fetchNextChunk: (page: number, signal?: AbortSignal) => Promise<GeoJSON.FeatureCollection>,
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>
) => {
    try {
        // Prevent multiple concurrent fetches
        if (isLoadingRef.current) return;

        isLoadingRef.current = true;

        // Cancel any ongoing request
        if (abortControllerRef.current)
            abortControllerRef.current.abort();

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        if (!extent.maxX || !extent.maxY || !extent.minX || !extent.minY) {
            isLoadingRef.current = false;
            return;
        }

        let currentPage = 1;

        while (currentPage <= MAX_CHUNK_AMOUNT) {
            if (signal.aborted) {
                Logger.debug("Fetch was cancelled");
                break;
            }

            const chunk = await fetchNextChunk(currentPage, signal);

            if (signal.aborted) {
                break;
            }

            if (chunk.features.length === 0) {
                Logger.debug(`No more data available at page ${currentPage}`);
                break;
            }

            // Update data with new chunk
            setData((prevData: GeoJSON.FeatureCollection[]) => [chunk, ...prevData].slice(0, MAX_CHUNK_AMOUNT));

            currentPage++;

            // Break if we got less than expected (last page)
            if (chunk.features.length < CHUNK_SIZE) {
                Logger.debug(`Reached last page at ${currentPage - 1}`);
                break;
            }

            // Add a small delay to prevent blocking the main thread
            await sleep(50);
        }
    } catch (error) {
        if (abortControllerRef.current?.signal.aborted) {
            Logger.warn("Fetch was cancelled");
        } else if (error === "Request cancelled") {
            Logger.warn("Request was cancelled by axios");
            return;
        }
        else {
            Logger.error("Error in fetch:", error);
        }
    } finally {
        isLoadingRef.current = false;
    }
};