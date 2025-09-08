import "./style/loader.css";
import { LoaderIcon } from "lucide-react";
import { useAppSelector } from "../../../lib/hooks";
import { selectIsDataLoading } from "../../layout/map/mapSlice";

/**
 * Loader component displays a loading spinner when data is being loaded.
 * @component
 * @returns The rendered component
 */
export default function Loader(): React.ReactNode {
    const isDataLoading = useAppSelector(selectIsDataLoading);

    return (
        <div
            className={`loader ${isDataLoading ? "visible" : ""}`}
        >
            <LoaderIcon id="loader-icon" />
        </div>
    )
}