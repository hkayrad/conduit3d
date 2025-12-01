import "./style/settingToggleButton.scss";

type Props = {
    active: boolean;
    toggle: (state: boolean) => void;
    hideLabel: React.ReactNode;
    showLabel: React.ReactNode;
    hideTitle?: string;
    showTitle?: string;
}

/**
 * SettingToggleButton component displays a toggle button for layer settings.
 * @component
 * @param props - The props for the component
 * @returns The rendered component
 */
export default function SettingToggleButton(props: Readonly<Props>): React.ReactNode {
    const { active, toggle, hideLabel, showLabel, hideTitle, showTitle } = props;

    return (
        <div className="layer-control-toggle-switch">
            <button className={`toggle-button`} title={hideTitle} onClick={() => toggle(false)}>
                <span className="button-label">{hideLabel}</span>
            </button>
            <button className={`toggle-button`} title={showTitle} onClick={() => toggle(true)}>
                <span className="button-label">{showLabel}</span>
            </button>
            <div className={`toggle-slider ${active ? "active" : ""}`} />
        </div>
    )
}
