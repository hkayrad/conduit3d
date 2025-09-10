import './style/shortcutsInfo.css';
import { Keyboard } from "lucide-react";
import { useState } from "react";

export default function ShortcutsInfo() {
    const [isShortcutsInfoHovered, setIsShortcutsInfoHovered] = useState(false);

    return (
        <>
            <div
                className="icon"
                onMouseEnter={() => setIsShortcutsInfoHovered(true)}
                onMouseLeave={() => setIsShortcutsInfoHovered(false)}
            >
                <Keyboard />
            </div>
            <div className={`shortcuts-info ${isShortcutsInfoHovered ? "visible" : ""}`}>
                <h3>Keyboard Shortcuts</h3>
                <p><kbd>Ctrl</kbd> + <kbd>Del</kbd> : Close Popup Windows</p>
            </div>
        </>
    );
}