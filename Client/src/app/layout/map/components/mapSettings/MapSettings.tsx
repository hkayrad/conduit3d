import "./style/mapSettings.css";
import { Settings, X } from "lucide-react";
import { useAppSelector } from "../../../../../lib/hooks"
import { selectConfig } from "../../../../configSlice"
import { useState } from "react";
import { capitalizeFirstLetter } from "../../../../../lib/utils";

export default function MapSettings() {
    const config = useAppSelector(selectConfig);

    const [isSettingsWindowOpen, setIsSettingsWindowOpen] = useState(false);

    const handleSaveSettings = () => {

    }

    return (
        <>
            <div className="map-settings-toggle">
                <button
                    onClick={() => setIsSettingsWindowOpen(!isSettingsWindowOpen)}
                    title="Open Map Settings"
                >
                    <Settings />
                </button>
            </div>
            {isSettingsWindowOpen && (
                <div className="map-settings-window">
                    <div className="window-header">
                        <h3>Map Settings</h3>
                        <button onClick={() => setIsSettingsWindowOpen(false)}><X /></button>
                    </div>
                    {config &&
                        Object.entries(config).map(([key, setting]) => (
                            key.endsWith("_COLOR") &&
                            <div className="setting-item" key={key}>
                                <label htmlFor={key}>{capitalizeFirstLetter(key.replace(/_/g, " ").toLowerCase())}</label>
                                <input
                                    type="color"
                                    id={key}
                                    name={key}
                                    defaultValue={setting.slice(0, 7)}
                                // onChange={(e) => handleColorChange(key, e.target.value)}
                                />
                            </div>
                        ))
                    }
                </div>
            )}
        </>
    )
}