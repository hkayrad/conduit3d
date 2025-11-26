export const generateRandomColor = () =>
    `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`;

export const normalizeColor = (
    color: string | [number, number, number, number],
): string => {
    if (Array.isArray(color)) {
        // Convert [r, g, b, a] to rgba string
        return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255})`;
    }
    return color;
};
