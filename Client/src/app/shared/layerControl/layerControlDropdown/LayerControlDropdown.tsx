import React, { useState } from "react";
import "./style/layerControlDropdown.css";
import { ChevronDown, Eye, EyeClosed } from "lucide-react";

type Props = {
    icon: React.ReactNode,
    name: string,
    isLayerVisible: boolean,
    toggleLayer: () => void,
    children?: React.ReactNode
}

/**
 * LayerControlDropdown component displays a dropdown for layer controls.
 * @component
 * @param props - The props for the component
 * @returns The rendered component
 */
export default function LayerControlDropdown(props: Readonly<Props>): React.ReactNode {
    const { icon, name, isLayerVisible, toggleLayer, children } = props;

    const [isOpen, setIsOpen] = useState(false);

    return (
        <button
            className={`layer-control-dropdown ${isOpen && children ? "open" : "closed"}`}
            onClick={() => {
                children ? setIsOpen(!isOpen) : toggleLayer();
            }}
            onKeyDown={() => { }}
        >
            <div className="controller">
                <div className="left">
                    {icon}
                    <span>{name}</span>
                </div>
                <div className="right">
                    <button onClick={(e) => {
                        e.stopPropagation();
                        toggleLayer();
                    }}
                        title={isLayerVisible ? "Hide Layer" : "Show Layer"}>
                        {isLayerVisible ? <Eye /> : <EyeClosed />}
                    </button>
                    {children && <ChevronDown className={isOpen && children ? "open" : "closed"} />}
                </div>
            </div>
            {children &&
                <div
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={() => {}}
                    className={`content ${isOpen && children ? "open" : "closed"}`}
                >
                    <div className="content-wrapper">
                        {children}
                    </div>
                </div>
            }
        </button>
    )
}