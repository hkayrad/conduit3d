import type { JSX } from "react";

type Props = {
    label: string;
    value: string | number | undefined;
    capitalize?: boolean
}

/**
 * InfoField component displays a label and value pair.
 * @component
 * @param param0 - The props for the component
 * @returns {JSX.Element} The rendered component
 */
export default function InfoField({ label, value, capitalize = false }: Props): JSX.Element | null {
    if (!value) return null;
    return (
        <p key={label} >
            {label}: <span className={capitalize ? "capitalize" : ""}> {value} </span>
        </p>
    );
}