import type { JSX } from "react";
import "./style/settingToggleButton.css";

type Props = {
    active: boolean;
    toggle: (state: boolean) => void;
    hideLabel: React.ReactNode;
    showLabel: React.ReactNode;
}

/**
 * SettingToggleButton component displays a toggle button for layer settings.
 * @component
 * @param props - The props for the component
 * @returns {JSX.Element} The rendered component
 */
export default function SettingToggleButton(props: Props): JSX.Element {
    const { active, toggle, hideLabel, showLabel } = props;
    return (
        <div className="layer-control-toggle-switch">
            <button className={`toggle-button`} onClick={() => toggle(false)}>{hideLabel}</button>
            <button className={`toggle-button`} onClick={() => toggle(true)}>{showLabel}</button>
            <div className={`toggle-slider ${active ? "active" : ""}`} />
        </div>
    )
}