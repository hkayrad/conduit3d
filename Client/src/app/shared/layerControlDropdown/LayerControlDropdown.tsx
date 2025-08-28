import { useState } from "react";
import "./style/layerControlDropdown.css";
import { ChevronDown, Eye, EyeClosed } from "lucide-react";

type Props = {
    icon: React.ReactNode,
    name: string,
    isLayerVisible: boolean,
    toggleLayer: () => void,
    children?: React.ReactNode
}

export default function LayerControlDropdown(props: Props) {
    const { icon, name, isLayerVisible, toggleLayer, children } = props;

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`layer-control-dropdown ${isOpen && children ? "open" : "closed"}`} onClick={() => setIsOpen(!isOpen)}>
            <div className="controller">
                <div className="left">
                    {icon}
                    <span>{name}</span>
                </div>
                <div className="right">
                    <button onClick={(e) => {
                        e.stopPropagation();
                        toggleLayer();
                    }}>
                        {isLayerVisible ? <Eye /> : <EyeClosed />}
                    </button>
                    {children && <ChevronDown className={isOpen && children ? "open" : "closed"} />}
                </div>
            </div>
            {children &&
                <div onClick={(e) => e.stopPropagation()} className={`content ${isOpen && children ? "open" : "closed"}`}>
                    <div className="content-wrapper">
                        {children}
                    </div>
                </div>
            }
        </div>
    )
}