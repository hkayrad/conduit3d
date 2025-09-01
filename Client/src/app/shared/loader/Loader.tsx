import "./style/loader.css";
import { LoaderIcon } from "lucide-react";
import { useAppSelector } from "../../../lib/hooks/reduxHooks";
import { selectIsDataLoading } from "../../layout/map/mapSlice";
import type { JSX } from "react";

/**
 * Loader component displays a loading spinner when data is being loaded.
 * @component
 * @returns {JSX.Element} The rendered component
 */
export default function Loader(): JSX.Element {
    const isDataLoading = useAppSelector(selectIsDataLoading);

    return (
        <div
            className={`loader ${isDataLoading ? "visible" : ""}`}
        >
            <LoaderIcon id="loader-icon" />
        </div>
    )
}