import { Buffer } from "buffer";
import wkx from "wkx";
import type { Geometry } from "geojson";

export function wkbToGeometry(wkb: string): Geometry {
    const wkbBuffer = Buffer.from(wkb, "base64");
    const geometry = wkx.Geometry.parse(wkbBuffer);
    return geometry.toGeoJSON() as Geometry;
}