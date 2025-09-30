import './style/shortcutsInfo.css';
import { Keyboard } from "lucide-react";
import { useState } from "react";

export default function ShortcutsInfo() {
    const [isShortcutsInfoHovered, setIsShortcutsInfoHovered] = useState(false);
    const [isShortcutsInfoToggled, setIsShortcutsInfoToggled] = useState(false);

    return (
        <>
            <div
                className="shortcut-container-icon"
                onMouseEnter={() => setIsShortcutsInfoHovered(true)}
                onMouseLeave={() => setIsShortcutsInfoHovered(false)}
                onClick={() => setIsShortcutsInfoToggled(!isShortcutsInfoToggled)}
            >
                <Keyboard />
            </div>
            <div className={`shortcuts-info ${isShortcutsInfoHovered || isShortcutsInfoToggled ? "" : "hidden"}`}>
                <h3>Keyboard Shortcuts</h3>
                <p><span><kbd>Ctrl</kbd><kbd>Del</kbd></span> : Close Popup Windows</p>
                <p><span><kbd>Ctrl</kbd><kbd>/</kbd></span> : Focus Search Bar</p>
                <p><span><kbd>Esc</kbd></span> : Unfocus Search Bar</p>
                <p><span><kbd>Shift</kbd><kbd>W</kbd></span> : Wireframe Mode</p>
                <p><span><kbd>Shift</kbd><kbd>C</kbd></span> : Cartesian View</p>
                <p><span><kbd>Shift</kbd><kbd>F</kbd></span> : First Person View</p>
                <p><span><kbd>Shift</kbd><kbd>S</kbd></span> : Toggle Street View</p>
                <p><span><kbd>Shift</kbd><kbd>1-8</kbd></span> : Toggle Feature Layers</p>
                <p><span><kbd>Shift</kbd><kbd>0</kbd></span> : Toggle Basemap</p>
            </div>
        </>
    );
}