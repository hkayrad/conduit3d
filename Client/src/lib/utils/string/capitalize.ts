/**
 * Capitalizes the first letter of a string.
 * @param val The string to capitalize.
 * @returns The capitalized string.
 */
export function capitalizeFirstLetter(val: string) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}