export function hexToRgba(hex: string): [number, number, number, number] {
    if (!/^#([A-Fa-f0-9]{8})$/.test(hex)) {
        throw new Error('Invalid hex format. Expected "#aabbccdd".');
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const a = parseInt(hex.slice(7, 9), 16);
    return [r, g, b, a];
}