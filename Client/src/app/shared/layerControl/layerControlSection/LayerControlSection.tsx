import type { JSX } from "react";
import "./style/layerControlSection.css"

type Props = {
    title: string;
    children?: React.ReactNode;
}

/**
 * LayerControlSection component displays a section for layer controls.
 * @component
 * @param props - The props for the component
 * @returns {JSX.Element} The rendered component
 */
export default function LayerControlSection(props: Props): JSX.Element {
    const { title, children } = props;
    return (
        <div className="layer-control-section">
            <h4>{title}</h4>
            {children}
        </div>
    )
}