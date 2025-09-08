import { useEffect, useMemo, useRef, useState } from "react";
import "./style/hoverCard.css";
import { FeatureType } from "../../../../lib/enums";
import { selectIsHoverInfoVisible } from "../mapSlice";
import { useAppSelector } from "../../../../lib/hooks";
import InfoContent from "../../../shared/infoContent/InfoContent";

type Props = {
    mousePos: { x: number, y: number };
    hoveredFeature: GeoJSON.Feature | null;
}

type FeatureProperties = {
    dataType: FeatureType;
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
 * @returns The rendered component
 */
export default function HoverCard(props: Props): React.ReactNode {
    const { hoveredFeature, mousePos } = props;

    const properties = hoveredFeature?.properties as FeatureProperties | undefined;

    const hoverCardRef = useRef<HTMLDivElement>(null);
    const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
    const lastTimeRef = useRef<number | null>(null);
    const velocityRef = useRef<{ x: number; y: number; magnitude: number }>({ x: 0, y: 0, magnitude: 0 });

    const [mouseVelocity, setMouseVelocity] = useState({ x: 0, y: 0, magnitude: 0 });

    const isHoverInfoVisible = useAppSelector(selectIsHoverInfoVisible);

    useEffect(() => {
        const currentTime = performance.now();

        if (lastPositionRef.current && lastTimeRef.current) {
            const deltaX = mousePos.x - lastPositionRef.current.x;
            const deltaY = mousePos.y - lastPositionRef.current.y;
            const deltaTime = currentTime - lastTimeRef.current;

            if (deltaTime > 0) {
                const velocityX = deltaX / deltaTime; // pixels per millisecond
                const velocityY = deltaY / deltaTime;
                const magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

                velocityRef.current = {
                    x: velocityX * 1000, // Convert to pixels per second
                    y: velocityY * 1000,
                    magnitude: magnitude * 1000
                };

                setMouseVelocity(velocityRef.current);
            }
        }

        lastPositionRef.current = { x: mousePos.x, y: mousePos.y };
        lastTimeRef.current = currentTime;
    }, [mousePos]);

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
            className={`${hoveredFeature && isHoverInfoVisible && mouseVelocity.magnitude < 1000 ? "visible" : "hidden"}`}
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