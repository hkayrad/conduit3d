import "./style/layerControlSection.css"

type Props = {
    title: string;
    children?: React.ReactNode;
}

export default function LayerControlSection(props: Props) {
    const { title, children } = props;
    return (
        <div className="layer-control-section">
            <h4>{title}</h4>
            {children}
        </div>
    )
}