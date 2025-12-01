import type { Extent } from "../../types";
import { CHUNK_SIZE, DATA_FETCH_DELAY_MS, MAX_CHUNK_AMOUNT } from "../../constants";
import { Logger } from "../logger";
import { sleep } from "../sleep";
import { C3D_MapViewType } from "../../enums";

export const handleDataFetch = async (
    isLoadingRef: React.RefObject<boolean>,
    abortControllerRef: React.RefObject<AbortController | null>,
    extent: Extent,
    zoom: number,
    selectedViewType: C3D_MapViewType,
    fetchNextChunk: (page: number, signal?: AbortSignal) => Promise<GeoJSON.FeatureCollection>,
    setData: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>
) => {
    if (selectedViewType !== C3D_MapViewType.FirstPerson && zoom < 15)
        return;

    const newController = new AbortController();

    try {
        // Cancel any ongoing request
        if (abortControllerRef.current)
            abortControllerRef.current.abort();

        // Create new abort controller for this request
        abortControllerRef.current = newController;
        const signal = newController.signal;

        isLoadingRef.current = true;

        if (extent?.maxX == null || extent?.maxY == null || extent?.minX == null || extent?.minY == null) {
            isLoadingRef.current = false;
            return;
        }

        let currentPage = 1;
        let allData = [];

        while (currentPage <= MAX_CHUNK_AMOUNT) {
            if (signal.aborted) {
                Logger.debug("Fetch was cancelled");
                break;
            }

            const chunk = await fetchNextChunk(currentPage, signal);

            if (chunk.features.length === 0) {
                Logger.debug(`No more data available at page ${currentPage}`);
                break;
            }

            // Update data with new chunk
            allData.push(chunk);

            currentPage++;

            // Break if we got less than expected (last page)
            if (chunk.features.length < CHUNK_SIZE) {
                Logger.debug(`Reached last page at ${currentPage - 1}`);
                break;
            }

            // Add a small delay to prevent blocking the main thread
            await sleep(DATA_FETCH_DELAY_MS);
        }

        // Only set data if not aborted
        if (!signal.aborted) {
            setData(allData);
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
        // Only reset loading if this is still the active request
        if (abortControllerRef.current === newController) {
            isLoadingRef.current = false;
        }
    }
};