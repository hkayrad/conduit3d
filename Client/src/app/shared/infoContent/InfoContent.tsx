import InfoField from "../infoField/InfoField";

const formatLabel = (key: string) => {
  // Insert space before capital letters
  const spaced = key.replace(/([A-Z])/g, " $1");
  // Capitalize the first letter
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/**
 * InfoContent component displays information fields based on the properties provided.
 * @component
 * @param properties - The properties for the component
 * @param coordinate - Optional coordinates to display
 * @returns The rendered component
 */
export default function InfoContent(
  properties: any,
  coordinate?: number[],
): React.ReactNode | null {
  if (!properties) return null;

  return (
    <>
      {Object.entries(properties).map(([key, value]) => {
        if (key === "dataType") return null;
        return (
          <InfoField
            key={key}
            label={formatLabel(key)}
            value={value as string | number}
          />
        );
      })}
      {coordinate && (
        <InfoField
          label="Position"
          value={`${coordinate[0].toFixed(5)}, ${coordinate[1].toFixed(5)}`}
        />
      )}
    </>
  );
}
