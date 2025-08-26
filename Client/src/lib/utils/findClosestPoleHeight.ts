// SEND FEATURE ARRAY
export default function findClosestPoleHeight(coord: number[], poleFeatures: any[]): number {
    if (!poleFeatures) return 10;

    let minDist = Infinity;
    let height = 10;
    for (const pole of poleFeatures) {
        const [x, y] = pole.geometry.coordinates;
        const dist = Math.hypot(coord[0] - x, coord[1] - y);
        if (dist < minDist) {
            minDist = dist;
            height = pole.properties.height;
        }
    }
    return height;
}