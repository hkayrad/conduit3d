import type { JSX } from "react";
import { useAppSelector } from "../../../../lib/hooks/reduxHooks";
import { selectExtent } from "../mapSlice";
import AdrBinaComponent from "./buildings/AdrBinaComponent";
import TrafoBinaComponent from "./buildings/TrafoBinaComponent";
import AgHatComponent from "./lines/AgHatComponent";
import OgHatComponent from "./lines/OgHatComponent";
import RekortmanComponent from "./lines/RekortmanComponent";
import AgDirekComponent from "./poles/AgDirekComponent";
import AydDirekComponent from "./poles/AydDirekComponent";
import OgMusDirekComponent from "./poles/OgMusDirekComponent";

type Props = {
    allPoles: GeoJSON.Feature[];
    setAdrBina: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>;
    setTrafoBina: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>;
    setAgDirek: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>;
    setOgMusDirek: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>;
    setAydDirek: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>;
    setAgHat: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>;
    setOgHat: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>;
    setRekortman: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection>>;
}

/**
 * DataComponent is responsible for rendering all data-related components.
 * @component
 * @param props - The props for the component
 * @returns {JSX.Element} The rendered component
 */
export default function DataComponent(props: Props): JSX.Element {
    const {
        allPoles,
        setAdrBina,
        setTrafoBina,
        setAgDirek,
        setOgMusDirek,
        setAydDirek,
        setAgHat,
        setOgHat,
        setRekortman
    } = props;

    const extent = useAppSelector(selectExtent);

    return (
        <>
            <AdrBinaComponent
                setData={setAdrBina}
                extent={extent}
            />
            <TrafoBinaComponent
                setData={setTrafoBina}
                extent={extent}
            />

            <AgDirekComponent
                setData={setAgDirek}
                extent={extent}
            />
            <OgMusDirekComponent
                setData={setOgMusDirek}
                extent={extent}
            />
            <AydDirekComponent
                setData={setAydDirek}
                extent={extent}
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