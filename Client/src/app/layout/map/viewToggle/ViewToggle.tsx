import { Map, PersonStanding } from "lucide-react";
import { C3D_MapViewType } from "../../../../lib/enums";
import { useAppDispatch, useAppSelector } from "../../../../lib/hooks";
import { selectSelectedViewType } from "../mapSlice";
import "./style/viewToggle.css";

export default function ViewToggle(): React.ReactNode {
    const dispatch = useAppDispatch();

    const selectedView: C3D_MapViewType = useAppSelector(selectSelectedViewType);

    return (
        <div className="view-toggle">
            <div className={`selector ${selectedView === C3D_MapViewType.FirstPerson ? "active" : ""}`}></div>
            <button
                className="toggle-button"
                onClick={() => dispatch({ type: "map/setSelectedViewType", payload: C3D_MapViewType.Cartesian })}
                title="Cartesian View"
            >
                <Map />
            </button>
            <button
                className="toggle-button"
                onClick={() => dispatch({ type: "map/setSelectedViewType", payload: C3D_MapViewType.FirstPerson })}
                title="First Person View"
            >
                <PersonStanding />
            </button>
        </div>
    )
}