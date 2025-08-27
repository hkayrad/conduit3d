import { useCallback, useEffect, useRef } from "react";
import "./style/loader.css";
import { LoaderIcon } from "lucide-react";
import { useAppSelector } from "../../../lib/hooks/reduxHooks";
import { selectIsDataLoading } from "../../layout/map/mapSlice";

export default function Loader() {
    const loaderRef = useRef<HTMLDivElement>(null!);

    const isDataLoading = useAppSelector(selectIsDataLoading);

    const handleMouseMove = useCallback((e: any) => {
        const loader = loaderRef.current;
        if (loader) {
            const { clientX, clientY } = e;
            loader.style.left = `${clientX + 10}px`;
            loader.style.top = `${clientY + 10}px`;
        }
    }, []);

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <div
            ref={loaderRef}
            className={`loader ${isDataLoading ? "visible" : ""}`}
        >
            <LoaderIcon id="loader-icon" />
        </div>
    )
}