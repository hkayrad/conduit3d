import "./style/loader.css";
import { LoaderIcon } from "lucide-react";
import { useAppSelector } from "../../../lib/hooks/reduxHooks";
import { selectIsDataLoading } from "../../layout/map/mapSlice";

export default function Loader() {
    const isDataLoading = useAppSelector(selectIsDataLoading);;

    return (
        <div
            className={`loader ${isDataLoading ? "visible" : ""}`}
        >
            <LoaderIcon id="loader-icon" />
        </div>
    )
}