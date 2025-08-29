import { useEffect, useMemo, useRef } from "react";
import "./style/hoverCard.css";
import { DataType } from "../../../../lib/enums";

type Props = {
    mousePos: { x: number, y: number };
    hoveredFeature: GeoJSON.Feature | null;
}

type FeatureProperties = {
    dataType: DataType;
    name?: string;
    height?: number;
    floorCount?: number;
    type?: string;
    kodu?: string;
    direkNo?: string;
    cinsi?: string;
    tipi?: string;
    boyOzellik?: string;
    kesit?: string;
}

const renderField = (label: string, value: string | number | undefined, capitalize = false) => {
    if (!value) return null;
    return (
        <p key={label}>
            {label}: <span className={capitalize ? "capitalize" : ""}>{value}</span>
        </p>
    );
};

export default function HoverCard(props: Props) {
    const { hoveredFeature, mousePos } = props;

    const hoverCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (hoverCardRef.current) {
            const card = hoverCardRef.current;
            const cardRect = card.getBoundingClientRect();

            let left = mousePos.x + 10;
            let top = mousePos.y + 10;

            // Adjust position if card would overflow viewport
            if (left + cardRect.width > window.innerWidth) {
                left = mousePos.x - cardRect.width - 10;
            }
            if (top + cardRect.height > window.innerHeight) {
                top = mousePos.y - cardRect.height - 10;
            }

            card.style.left = `${left}px`;
            card.style.top = `${top}px`;
        }
    }, [mousePos, hoveredFeature]);

    const properties = hoveredFeature?.properties as FeatureProperties | undefined;

    const content = useMemo(() => {
        if (!properties) return null;

        switch (properties.dataType) {
            case DataType.BUILDING:
                return (
                    <>
                        {renderField("Name", properties.name, true)}
                        {renderField("Height", `${properties.height} m`)}
                        {renderField("Floor Count", properties.floorCount)}
                        {renderField("Type", properties.type, true)}
                    </>
                );

            case DataType.TRAFO:
                return (
                    <>
                        {renderField("Name", properties.name)}
                        {renderField("Code", properties.kodu)}
                    </>
                );

            case DataType.POLE:
                return (
                    <>
                        {renderField("Pole No", properties.direkNo)}
                        {renderField("Cinsi", properties.cinsi)}
                        {renderField("Type", properties.tipi)}
                        {renderField("Height", `${properties.height} m`)}
                        {renderField("Pole Features", properties.boyOzellik)}
                    </>
                );

            case DataType.LINE:
                return (
                    <>
                        {renderField("Cinsi", properties.cinsi)}
                        {renderField("Type", properties.tipi)}
                        {renderField("Section", properties.kesit)}
                    </>
                );

            case DataType.REKORTMAN:
                return (
                    <>
                        {renderField("Cinsi", properties.tipi)}
                        {renderField("Section", properties.kesit)}
                    </>
                );

            default:
                return null;
        }
    }, [properties])

    return (
        <div
            ref={hoverCardRef}
            className={`${hoveredFeature ? "visible" : "hidden"}`}
            id="hover-card">
            {hoveredFeature && (
                <div id="content">
                    <h3><span>{hoveredFeature.properties!.dataType}</span></h3>
                    <div id="divider"></div>
                    {content}
                </div>
            )}
        </div>
    )
}