export function hexToRgba(hex: string): [number, number, number, number] {
    // Remove the # if present
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    
    // Validate hex format (6 or 8 characters)
    if (!/^[A-Fa-f0-9]{6}$/.test(cleanHex) && !/^[A-Fa-f0-9]{8}$/.test(cleanHex)) {
        throw new Error('Invalid hex format. Expected "#aabbcc" or "#aabbccdd".');
    }
    
    const r = Number.parseInt(cleanHex.slice(0, 2), 16);
    const g = Number.parseInt(cleanHex.slice(2, 4), 16);
    const b = Number.parseInt(cleanHex.slice(4, 6), 16);
    
    // If 8-character hex, use the alpha value; otherwise default to 255 (fully opaque)
    const a = cleanHex.length === 8 ? Number.parseInt(cleanHex.slice(6, 8), 16) : 255;
    
    return [r, g, b, a];
}