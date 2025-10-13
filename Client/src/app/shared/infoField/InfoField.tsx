type Props = {
    label: string;
    value: string | number | undefined;
    capitalize?: boolean
}

/**
 * InfoField component displays a label and value pair.
 * @component
 * @param param0 - The props for the component
 * @returns The rendered component
 */
export default function InfoField({ label, value, capitalize = false }: Readonly<Props>): React.ReactNode | null {
    if (!value) return null;

    return (
        <p key={label} >
            {label}: <span className={capitalize ? "capitalize" : ""}> {value} </span>
        </p>
    );
}