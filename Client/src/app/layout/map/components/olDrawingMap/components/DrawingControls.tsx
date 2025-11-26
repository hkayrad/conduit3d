import { Circle, Activity, Hexagon, Trash2, Save, Move, Pencil } from "lucide-react";
import type { DrawingMode } from "../hooks/useOlDrawingMap";
import "./style/drawingControls.scss";

type Props = {
    drawingMode: DrawingMode;
    setDrawingMode: (mode: DrawingMode) => void;
    hasFeatures: boolean;
    onClear: () => void;
    onSave: () => void;
    onDelete: () => void;
    hasSelection: boolean;
};

export default function DrawingControls({
    drawingMode,
    setDrawingMode,
    hasFeatures,
    onClear,
    onSave,
    onDelete,
    hasSelection,
}: Props) {
    return (
        <div className="ol-drawing-map-controls">
            <div className={`drawing-group ${hasFeatures ? "" : "hideBorder"}`}>
                <button
                    onClick={() =>
                        setDrawingMode(drawingMode === "Point" ? "None" : "Point")
                    }
                    className={drawingMode === "Point" ? "active" : ""}
                    title="Point"
                >
                    <Circle size={20} />
                    <span>Point</span>
                </button>
                <button
                    onClick={() =>
                        setDrawingMode(drawingMode === "LineString" ? "None" : "LineString")
                    }
                    className={drawingMode === "LineString" ? "active" : ""}
                    title="LineString"
                >
                    <Activity size={20} />
                    <span>Line</span>
                </button>
                <button
                    onClick={() =>
                        setDrawingMode(drawingMode === "Polygon" ? "None" : "Polygon")
                    }
                    className={drawingMode === "Polygon" ? "active" : ""}
                    title="Polygon"
                >
                    <Hexagon size={20} />
                    <span>Polygon</span>
                </button>
                <button
                    onClick={() =>
                        setDrawingMode(drawingMode === "Move" ? "None" : "Move")
                    }
                    className={drawingMode === "Move" ? "active" : ""}
                    title="Move Feature"
                >
                    <Move size={20} />
                    <span>Move</span>
                </button>
                <button
                    onClick={() =>
                        setDrawingMode(drawingMode === "Edit" ? "None" : "Edit")
                    }
                    className={drawingMode === "Edit" ? "active" : ""}
                    title="Edit Feature"
                >
                    <Pencil size={20} />
                    <span>Edit</span>
                </button>
            </div>
            <button
                onClick={onDelete}
                className={`delete-btn ${hasSelection ? "" : "button-hidden"}`}
                title="Delete Selected"
                disabled={!hasSelection}
            >
                <Trash2 size={20} />
                <span>Delete</span>
            </button>
            <button
                onClick={onClear}
                className={`clear-btn ${hasFeatures ? "" : "button-hidden"}`}
                title="Clear All"
            >
                <Trash2 size={20} />
                <span>Clear</span>
            </button>
            <button
                onClick={onSave}
                className={`${hasFeatures ? "" : "button-hidden"}`}
                title="Save"
                disabled={!hasFeatures}
            >
                <Save size={20} />
                <span>Save</span>
            </button>
        </div>
    );
}
