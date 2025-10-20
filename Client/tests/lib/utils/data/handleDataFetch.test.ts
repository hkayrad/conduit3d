import { vi, describe, it, expect, beforeEach } from "vitest";
import type { Extent } from "../../../../src/lib/types";
import { C3D_MapViewType } from "../../../../src/lib/enums";
import { handleDataFetch } from "../../../../src/lib/utils/data/handleDataFetch";
import { CHUNK_SIZE, MAX_CHUNK_AMOUNT } from "../../../../src/lib/constants";

import { Logger as LoggerMock } from "../../../../src/lib/utils/logger";
vi.mock("../../../../src/lib/utils/logger", () => ({
    Logger: {
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("../../../../src/lib/utils/sleep", () => ({
    sleep: vi.fn(() => Promise.resolve()),
}));

describe("handleDataFetch", () => {
    let isLoadingRef: React.RefObject<boolean>;
    let abortControllerRef: React.RefObject<AbortController | null>;
    let extent: Extent;
    let setData: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        isLoadingRef = { current: false };
        abortControllerRef = { current: null };
        extent = { maxX: 100, maxY: 100, minX: 0, minY: 0 };
        setData = vi.fn();
    });

    it("does not fetch if selectedViewType is not FirstPerson and zoom < 15", async () => {
        const fetchNextChunk = vi.fn();

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            14,
            C3D_MapViewType.Cartesian,
            fetchNextChunk,
            setData,
        );

        expect(fetchNextChunk).not.toHaveBeenCalled();
        expect(setData).not.toHaveBeenCalled();
    });

    it("allows fetch if selectedViewType is FirstPerson regardless of zoom", async () => {
        const fetchNextChunk = vi.fn().mockResolvedValue({
            type: "FeatureCollection",
            features: []
        });

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            5, // zoom < 15
            C3D_MapViewType.FirstPerson,
            fetchNextChunk,
            setData,
        );

        expect(fetchNextChunk).toHaveBeenCalledTimes(1);
    });

    it("allows fetch if zoom >= 15 regardless of view type", async () => {
        const fetchNextChunk = vi.fn().mockResolvedValue(async () => ({
            type: "FeatureCollection",
            features: []
        }));

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            15,
            C3D_MapViewType.Cartesian,
            fetchNextChunk,
            setData,
        );

        expect(fetchNextChunk).toHaveBeenCalledTimes(1);
    });

    it("does not fetch if isLoadingRef.current is true", async () => {
        isLoadingRef.current = true;
        const fetchNextChunk = vi.fn();

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            15,
            C3D_MapViewType.FirstPerson,
            fetchNextChunk,
            setData,
        );

        expect(fetchNextChunk).not.toHaveBeenCalled();
        expect(setData).not.toHaveBeenCalled();
    });

    it("aborts previous request before starting new one", async () => {
        const oldAbortController = new AbortController();
        const abortSpy = vi.spyOn(oldAbortController, "abort");
        abortControllerRef.current = oldAbortController;

        const fetchNextChunk = vi.fn().mockResolvedValue({
            type: "FeatureCollection",
            features: []
        });

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            15,
            C3D_MapViewType.FirstPerson,
            fetchNextChunk,
            setData,
        );

        expect(abortSpy).toHaveBeenCalledTimes(1);
    });

    it("does not fetch if extent.maxX is missing", async () => {
        extent.maxX = undefined as any;
        const fetchNextChunk = vi.fn();

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            15,
            C3D_MapViewType.FirstPerson,
            fetchNextChunk,
            setData,
        );

        expect(fetchNextChunk).not.toHaveBeenCalled();
        expect(isLoadingRef.current).toBe(false);
    });

    it("does not fetch if extent.maxY is missing", async () => {
        extent.maxY = undefined as any;
        const fetchNextChunk = vi.fn();

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            15,
            C3D_MapViewType.FirstPerson,
            fetchNextChunk,
            setData,
        );

        expect(fetchNextChunk).not.toHaveBeenCalled();
    });

    it("does not fetch if extent.minX is missing", async () => {
        extent.minX = undefined as any;
        const fetchNextChunk = vi.fn();

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            15,
            C3D_MapViewType.FirstPerson,
            fetchNextChunk,
            setData,
        );

        expect(fetchNextChunk).not.toHaveBeenCalled();
    });

    it("does not fetch if extent.minY is missing", async () => {
        extent.minY = undefined as any;
        const fetchNextChunk = vi.fn();

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            15,
            C3D_MapViewType.FirstPerson,
            fetchNextChunk,
            setData,
        );

        expect(fetchNextChunk).not.toHaveBeenCalled();
    });

    it("fetches single page when features length is less than CHUNK_SIZE", async () => {
        const chunk = {
            type: "FeatureCollection" as const,
            features: new Array(5).fill({ type: "Feature" })
        };
        const fetchNextChunk = vi.fn().mockResolvedValue(chunk);

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            15,
            C3D_MapViewType.FirstPerson,
            fetchNextChunk,
            setData,
        );

        expect(fetchNextChunk).toHaveBeenCalledTimes(1);
        expect(setData).toHaveBeenCalledWith([chunk]);
        expect(LoggerMock.debug).toHaveBeenCalledWith("Reached last page at 1");
    });

    it("fetches multiple pages until last page with less than CHUNK_SIZE features", async () => {
        const chunks = [
            { type: "FeatureCollection" as const, features: new Array(CHUNK_SIZE).fill({}) },
            { type: "FeatureCollection" as const, features: new Array(CHUNK_SIZE).fill({}) },
            { type: "FeatureCollection" as const, features: new Array(5).fill({}) },
        ];

        const fetchNextChunk = vi.fn().mockImplementation(async (page: number) => chunks[page - 1]);

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            16,
            C3D_MapViewType.FirstPerson,
            fetchNextChunk,
            setData
        );

        expect(fetchNextChunk).toHaveBeenCalledTimes(3);
        expect(setData).toHaveBeenCalledWith(chunks);
        expect(LoggerMock.debug).toHaveBeenCalledWith("Reached last page at 3");
    });

    it("stops fetching when empty features array is returned", async () => {
        const chunks = [
            { type: "FeatureCollection" as const, features: new Array(CHUNK_SIZE).fill({}) },
            { type: "FeatureCollection" as const, features: [] },
        ];

        const fetchNextChunk = vi.fn().mockImplementation(async (page: number) => chunks[page - 1]);

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            15,
            C3D_MapViewType.FirstPerson,
            fetchNextChunk,
            setData
        );

        expect(fetchNextChunk).toHaveBeenCalledTimes(2);
        expect(setData).toHaveBeenCalledWith([chunks[0]]);
        expect(LoggerMock.debug).toHaveBeenCalledWith("No more data available at page 2");
    });

    it("stops fetching when MAX_CHUNK_AMOUNT is reached", async () => {
        const chunk = {
            type: "FeatureCollection" as const,
            features: new Array(CHUNK_SIZE).fill({})
        };
        const fetchNextChunk = vi.fn().mockResolvedValue(chunk);

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            15,
            C3D_MapViewType.FirstPerson,
            fetchNextChunk,
            setData
        );

        expect(fetchNextChunk).toHaveBeenCalledTimes(MAX_CHUNK_AMOUNT);
    });

    it("stops fetching when abort signal is triggered before fetch", async () => {
        const fetchNextChunk = vi.fn().mockImplementation(async (page: number, signal?: AbortSignal) => {
            if (page === 2) {
                abortControllerRef.current?.abort();
            }
            return {
                type: "FeatureCollection" as const,
                features: new Array(CHUNK_SIZE).fill({})
            };
        });

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            15,
            C3D_MapViewType.FirstPerson,
            fetchNextChunk,
            setData,
        );

        expect(fetchNextChunk).toHaveBeenCalledTimes(2);
    });

    it("stops fetching when abort signal is triggered after fetch", async () => {
        let callCount = 0;
        const fetchNextChunk = vi.fn().mockImplementation(async () => {
            callCount++;
            const result = {
                type: "FeatureCollection" as const,
                features: new Array(CHUNK_SIZE).fill({})
            };
            if (callCount === 1) {
                abortControllerRef.current?.abort();
            }
            return result;
        });

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            15,
            C3D_MapViewType.FirstPerson,
            fetchNextChunk,
            setData,
        );

        expect(fetchNextChunk).toHaveBeenCalledTimes(1);
        expect(isLoadingRef.current).toBe(false);
    });

    it("handles axios cancellation error", async () => {
        const fetchNextChunk = vi.fn().mockRejectedValue("Request cancelled");

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            15,
            C3D_MapViewType.FirstPerson,
            fetchNextChunk,
            setData,
        );

        expect(LoggerMock.warn).toHaveBeenCalledWith("Request was cancelled by axios");
        expect(isLoadingRef.current).toBe(false);
    });

    it("handles general fetch error", async () => {
        const error = new Error("Network error");
        const fetchNextChunk = vi.fn().mockRejectedValue(error);

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            15,
            C3D_MapViewType.FirstPerson,
            fetchNextChunk,
            setData,
        );

        expect(LoggerMock.error).toHaveBeenCalledWith("Error in fetch:", error);
        expect(isLoadingRef.current).toBe(false);
    });

    it("sets isLoadingRef to true during fetch and false after completion", async () => {
        const fetchNextChunk = vi.fn().mockImplementation(async () => {
            expect(isLoadingRef.current).toBe(true);
            return { type: "FeatureCollection" as const, features: [] };
        });

        expect(isLoadingRef.current).toBe(false);

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            15,
            C3D_MapViewType.FirstPerson,
            fetchNextChunk,
            setData,
        );

        expect(isLoadingRef.current).toBe(false);
    });

    it("creates new AbortController for each fetch", async () => {
        const fetchNextChunk = vi.fn().mockResolvedValue({
            type: "FeatureCollection" as const,
            features: []
        });

        expect(abortControllerRef.current).toBeNull();

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            15,
            C3D_MapViewType.FirstPerson,
            fetchNextChunk,
            setData,
        );

        expect(abortControllerRef.current).toBeInstanceOf(AbortController);
    });

    it("passes abort signal to fetchNextChunk", async () => {
        const fetchNextChunk = vi.fn().mockResolvedValue({
            type: "FeatureCollection" as const,
            features: []
        });

        await handleDataFetch(
            isLoadingRef,
            abortControllerRef,
            extent,
            15,
            C3D_MapViewType.FirstPerson,
            fetchNextChunk,
            setData,
        );

        expect(fetchNextChunk).toHaveBeenCalledWith(
            1,
            expect.any(AbortSignal)
        );
    });
});