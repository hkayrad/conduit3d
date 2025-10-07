import { LucideArrowRight, LucideX } from "lucide-react";
import "./style/featureInfo.css"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PickingInfo } from "deck.gl";
import InfoContent from "../../../../shared/infoContent/InfoContent";
import { useAppSelector } from "../../../../../lib/hooks";
import { selectSelectedViewType } from "../../mapSlice";
import { C3D_MapViewType } from "../../../../../lib/enums";
import { capitalizeFirstLetter } from "../../../../../lib/utils";

type Props = {
    info: PickingInfo;
    zIndex: number;
    onClose: () => void;
    onFocus: () => void;
    onFlyTo: () => void;
};

/**
 * FeatureInfo component displays information about a selected map feature.
 * @component
 * @param props - The props for the component
 * @returns The rendered component
 */
export default function FeatureInfo(props: Props): React.ReactNode {
    const { info, zIndex, onClose, onFocus, onFlyTo } = props;
    const { object, coordinate, x, y } = info;
    const { properties } = object || {};

    const selectedViewType = useAppSelector(selectSelectedViewType);

    const [position, setPosition] = useState<{ x: number; y: number }>({ x, y });
    const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    const windowRef = useRef<HTMLDivElement>(null);

    const content = useMemo(() => InfoContent(properties, coordinate!), [coordinate, properties]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!windowRef.current)
            return;

        const rect = windowRef.current.getBoundingClientRect();
        setOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging)
            return;

        setPosition({
            x: e.clientX - offset.x,
            y: e.clientY - offset.y
        });
    }, [isDragging, offset]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    }, [handleMouseMove]);

    useEffect(() => {
        if (!isDragging)
            return;

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const onMouseDown = (e: React.MouseEvent) => {
        handleMouseDown(e);
        onFocus();
    }

    return (
        <div
            className="feature-info-popup"
            style={{ left: position.x, top: position.y, zIndex }}
            ref={windowRef}
        >
            <div className="header" onMouseDown={onMouseDown} style={{ cursor: isDragging ? "grabbing" : "grab" }}>
                <p>{capitalizeFirstLetter(properties.dataType)}</p>
                <div className="dragger-buttons">
                    {selectedViewType === C3D_MapViewType.Cartesian &&
                        <button onClick={onFlyTo}><LucideArrowRight /></button>
                    }
                    <button onClick={onClose}><LucideX /></button>
                </div>
            </div>
            <div className="content">
                {content}
            </div>
        </div>
    )
}