import { LucideArrowRight, LucideX } from "lucide-react";
import "./style/featureInfo.css"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataType } from "../../../../lib/enums";
import { renderField } from "../../../../lib/utils/renderInfoField";
import type { PickingInfo } from "deck.gl";

type Props = {
    info: PickingInfo;
    zIndex: number;
    onClose: () => void;
    onFocus: () => void;
    onFlyTo: () => void;
};

export default function FeatureInfo(props: Props) {
    const { info, zIndex, onClose, onFocus, onFlyTo } = props;
    const { object, x, y } = info;
    const { properties } = object || {};

    const [position, setPosition] = useState<{ x: number; y: number }>({ x, y });
    const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    const windowRef = useRef<HTMLDivElement>(null);

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
    }, [properties]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (windowRef.current) {
            const rect = windowRef.current.getBoundingClientRect();
            setOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
            setIsDragging(true);
        }
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging)
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
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        }

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
                <p>Feature Details: {properties!.id}</p>
                <div className="dragger-buttons">
                    <button onClick={onFlyTo}><LucideArrowRight /></button>
                    <button onClick={onClose}><LucideX /></button>
                </div>
            </div>
            <div className="content">
                {content}
            </div>
        </div>
    )
}