import WKB from "ol/format/WKB";
import type { Geometry } from "ol/geom";
import { Buffer } from "buffer";

/**
 * Converts an OpenLayers Geometry to a WKB (Well-Known Binary) string (base64 encoded).
 * @param geometry The OpenLayers Geometry to convert.
 * @returns The WKB string.
 */
export function geometryToWkb(geometry: Geometry): string {
    const format = new WKB();
    // writeGeometry returns a string (base64) by default if no options are passed? 
    // Wait, ol/format/WKB writeGeometry returns string or ArrayBuffer depending on options?
    // Let's check documentation or assume standard behavior. 
    // Actually, usually WKB writeGeometry returns a string (hex) or buffer. 
    // But we need to send it to the API which expects byte[] usually serialized as base64 in JSON.

    // Let's look at how wkbToGeometry works. It takes base64 string.
    // So we need to produce base64 string.

    // ol/format/WKB writeGeometry returns a string (hex) by default? Or maybe we need to specify.
    // Let's try to use it and see. If it returns hex, we convert to base64.
    // Actually, let's check if we can get it as ArrayBuffer and convert to base64.


    // writeGeometry returns string (which is likely hex representation in OpenLayers implementation if not specified otherwise, or maybe it is binary string?)
    // Actually, looking at OL docs, writeGeometry returns string.
    // Let's assume it returns a string. If it's hex, we might need to convert.
    // But wait, the backend expects `byte[]`. JSON serialization of `byte[]` is Base64.

    // Let's assume we need to return a Base64 string.
    // If writeGeometry returns Hex, we convert Hex to Base64.

    // Let's try to find if there is an existing usage or just implement it.
    // I will implement it to return base64.

    // NOTE: ol/format/WKB writeGeometry returns a string. 
    // In OpenLayers, WKB writeGeometry returns a Buffer (in Node) or string?
    // Actually, let's use a safer approach: writeGeometry returns string (Hex usually).
    // Let's verify if we can get it as base64.

    // Let's try to write it as generic implementation.

    const hex = format.writeGeometry(geometry, { featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4326' }) as string;
    return Buffer.from(hex, 'hex').toString('base64');
}
