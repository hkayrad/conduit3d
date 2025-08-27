import { useState } from "react";
import "./style/layerControlDropdown.css";
import { ChevronDown, Eye, EyeClosed } from "lucide-react";

type Props = {
    icon: React.ReactNode,
    name: string,
    isLayerVisible: boolean,
    toggleLayer: () => void,
}

export default function LayerControlDropdown(props: Props) {
    const { icon, name, isLayerVisible, toggleLayer } = props;

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`layer-control-dropdown ${isOpen ? "open" : "closed"}`} onClick={() => setIsOpen(!isOpen)}>
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
                <ChevronDown className={isOpen ? "open" : "closed"} />
            </div>
        </div>
    )
}