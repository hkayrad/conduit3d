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

export default function DataComponent(props: Props) {
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

    return (
        <>
            <AdrBinaComponent
                setData={setAdrBina}
            />
            <TrafoBinaComponent
                setData={setTrafoBina}
            />
            <AgDirekComponent
                setData={setAgDirek}
            />
            <OgMusDirekComponent
                setData={setOgMusDirek}
            />
            <AydDirekComponent
                setData={setAydDirek}
            />
            <AgHatComponent
                setData={setAgHat}
                allPoles={allPoles}
            />
            <OgHatComponent
                setData={setOgHat}
                allPoles={allPoles}
            />
            <RekortmanComponent
                setData={setRekortman}
                allPoles={allPoles}
            />
        </>
    )
}