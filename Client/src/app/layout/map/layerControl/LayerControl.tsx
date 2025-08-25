import { useState } from "react";
import "./style/layerControl.css"
import { ChevronRight, Layers2 } from "lucide-react";

export default function LayerControl() {
    const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);
    return <div className="layer-control">
        <button
            id="layer-control-toggle"
            onClick={() => setIsControlsOpen(!isControlsOpen)}>
            {isControlsOpen ? <ChevronRight /> : <Layers2 />}
        </button>
    </div>
}