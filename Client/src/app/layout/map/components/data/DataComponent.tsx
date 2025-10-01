import { useAppSelector } from "../../../../../lib/hooks";
import { selectExtent, selectSelectedViewType, selectViewState } from "../../mapSlice";
import AdrBinaComponent from "./buildings/AdrBinaComponent";
import BuildingComponent from "./buildings/BuildingComponent";
import TrafoBinaComponent from "./buildings/TrafoBinaComponent";
import AgHatComponent from "./lines/AgHatComponent";
import OgHatComponent from "./lines/OgHatComponent";
import RekortmanComponent from "./lines/RekortmanComponent";
import AgDirekComponent from "./poles/AgDirekComponent";
import AydDirekComponent from "./poles/AydDirekComponent";
import OgMusDirekComponent from "./poles/OgMusDirekComponent";

type Props = {
    allPoles: GeoJSON.Feature[];
    setAdrBina: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>;
    setBuildingBina: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>;
    setTrafoBina: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>;
    setAgDirek: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>;
    setOgMusDirek: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>;
    setAydDirek: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>;
    setAgHat: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>;
    setOgHat: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>;
    setRekortman: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>;
}

/**
 * DataComponent is responsible for fetching all data-related components.
 * @component
 * @param props - The props for the component
 * @returns The rendered component
 */
export default function DataComponent(props: Props): React.ReactNode {
    const {
        allPoles,
        setAdrBina,
        setBuildingBina,
        setTrafoBina,
        setAgDirek,
        setOgMusDirek,
        setAydDirek,
        setAgHat,
        setOgHat,
        setRekortman
    } = props;

    const extent = useAppSelector(selectExtent);
    const { cartesian } = useAppSelector(selectViewState);
    const { zoom } = cartesian;
    const selectedViewType = useAppSelector(selectSelectedViewType);

    return (
        <>
            <BuildingComponent
                setData={setBuildingBina}
                extent={extent}
                zoom={zoom}
                selectedViewType={selectedViewType}
            />
            <AdrBinaComponent
                setData={setAdrBina}
                extent={extent}
                zoom={zoom}
                selectedViewType={selectedViewType}
            />
            <TrafoBinaComponent
                setData={setTrafoBina}
                extent={extent}
                zoom={zoom}
                selectedViewType={selectedViewType}
            />

            <AgDirekComponent
                setData={setAgDirek}
                extent={extent}
                zoom={zoom}
                selectedViewType={selectedViewType}
            />
            <OgMusDirekComponent
                setData={setOgMusDirek}
                extent={extent}
                zoom={zoom}
                selectedViewType={selectedViewType}
            />
            <AydDirekComponent
                setData={setAydDirek}
                extent={extent}
                zoom={zoom}
                selectedViewType={selectedViewType}
            />

            <AgHatComponent
                setData={setAgHat}
                allPoles={allPoles}
                extent={extent}
            />
            <OgHatComponent
                setData={setOgHat}
                allPoles={allPoles}
                extent={extent}
            />
            <RekortmanComponent
                setData={setRekortman}
                allPoles={allPoles}
                extent={extent}
            />
        </>
    )
}