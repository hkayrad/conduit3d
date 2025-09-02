/**
 * Apply an ease-in-out cubic transition to a value.
 * @param x The input value (between 0 and 1).
 * @returns The eased value.
 */
export function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}