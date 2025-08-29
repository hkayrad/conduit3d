import "./style/settingToggleButton.css";

type Props = {
    active: boolean;
    toggle: (state: boolean) => void;
    hideLabel: React.ReactNode;
    showLabel: React.ReactNode;
}

export default function SettingToggleButton(props: Props) {
    const { active, toggle, hideLabel, showLabel } = props;
    return (
        <div className="layer-control-toggle-switch">
            <button className={`toggle-button ${!active ? "active" : ""}`} onClick={() => toggle(false)}>{hideLabel}</button>
            <button className={`toggle-button ${active ? "active" : ""}`} onClick={() => toggle(true)}>{showLabel}</button>
        </div>
    )
}