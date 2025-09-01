import { useEffect, useMemo, useRef, type JSX } from "react";
import "./style/hoverCard.css";
import { DataType } from "../../../../lib/enums";
import { selectIsHoverInfoVisible } from "../mapSlice";
import { useAppSelector } from "../../../../lib/hooks/reduxHooks";
import InfoContent from "../../../shared/infoContent/InfoContent";

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

/**
 * HoverCard component displays information about a hovered map feature.
 * @component
 * @param props - The props for the component
 * @returns {JSX.Element} The rendered component
 */
export default function HoverCard(props: Props): JSX.Element {
    const { hoveredFeature, mousePos } = props;

    const hoverCardRef = useRef<HTMLDivElement>(null);

    const isHoverInfoVisible = useAppSelector(selectIsHoverInfoVisible);

    const properties = hoveredFeature?.properties as FeatureProperties | undefined;


    useEffect(() => {
        if (hoverCardRef.current && hoveredFeature) {
            const card = hoverCardRef.current;

            // Use requestAnimationFrame to ensure the card has rendered
            requestAnimationFrame(() => {
                const cardRect = card.getBoundingClientRect();

                // Only proceed if we have valid dimensions
                if (cardRect.width === 0 || cardRect.height === 0) {
                    return;
                }

                let left = mousePos.x + 10;
                let top = mousePos.y + 10;

                // Adjust position if card would overflow viewport
                if (left + cardRect.width > window.innerWidth) {
                    left = mousePos.x - cardRect.width - 10;
                }
                if (top + cardRect.height > window.innerHeight) {
                    top = mousePos.y - cardRect.height - 10;
                }

                // Ensure coordinates are never negative or NaN
                left = Math.max(0, left || 0);
                top = Math.max(0, top || 0);

                card.style.left = `${left}px`;
                card.style.top = `${top}px`;
            });
        }
    }, [mousePos, hoveredFeature]);

    const content = useMemo(() => InfoContent(properties), [properties])

    return (
        <div
            ref={hoverCardRef}
            className={`${hoveredFeature && isHoverInfoVisible ? "visible" : "hidden"}`}
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