import { useAppSelector } from "../../../../../lib/hooks";
import {
  selectExtent,
  selectSelectedViewType,
  selectViewState,
} from "../../mapSlice";
import AdrBinaComponent from "./buildings/AdrBinaComponent";
import AdrYolComponent from "./buildings/AdrYolComponent";
import BuildingComponent from "./buildings/BuildingComponent";
import TrafoBinaComponent from "./buildings/TrafoBinaComponent";
import AgHatComponent from "./lines/AgHatComponent";
import OgHatComponent from "./lines/OgHatComponent";
import RekortmanComponent from "./lines/RekortmanComponent";
import AgDirekComponent from "./poles/AgDirekComponent";
import AydDirekComponent from "./poles/AydDirekComponent";
import OgMusDirekComponent from "./poles/OgMusDirekComponent";
import ArmaturComponent from "./armatur/ArmaturComponent";

type Props = {
  allPoles: GeoJSON.Feature[];
  setAdrBina: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>;
  setBuildingBina: React.Dispatch<
    React.SetStateAction<GeoJSON.FeatureCollection[]>
  >;
  setTrafoBina: React.Dispatch<
    React.SetStateAction<GeoJSON.FeatureCollection[]>
  >;
  setAdrYol: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>;
  setAgDirek: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>;
  setOgMusDirek: React.Dispatch<
    React.SetStateAction<GeoJSON.FeatureCollection[]>
  >;
  setAydDirek: React.Dispatch<
    React.SetStateAction<GeoJSON.FeatureCollection[]>
  >;
  setAgHat: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>;
  setOgHat: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>;
  setRekortman: React.Dispatch<
    React.SetStateAction<GeoJSON.FeatureCollection[]>
  >;
  setArmatur: React.Dispatch<React.SetStateAction<GeoJSON.FeatureCollection[]>>;
  refreshTrigger: number;
};

/**
 * DataComponent is responsible for fetching all data-related components.
 * @component
 * @param props - The props for the component
 * @returns The rendered component
 */
export default function DataComponent(props: Readonly<Props>): React.ReactNode {
  const {
    allPoles,
    setAdrBina,
    setBuildingBina,
    setTrafoBina,
    setAdrYol,
    setAgDirek,
    setOgMusDirek,
    setAydDirek,
    setAgHat,
    setOgHat,
    setRekortman,
    setArmatur,
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
        refreshTrigger={props.refreshTrigger}
      />
      <AdrBinaComponent
        setData={setAdrBina}
        extent={extent}
        zoom={zoom}
        selectedViewType={selectedViewType}
        refreshTrigger={props.refreshTrigger}
      />
      <TrafoBinaComponent
        setData={setTrafoBina}
        extent={extent}
        zoom={zoom}
        selectedViewType={selectedViewType}
        refreshTrigger={props.refreshTrigger}
      />
      <AdrYolComponent
        setData={setAdrYol}
        extent={extent}
        zoom={zoom}
        selectedViewType={selectedViewType}
        refreshTrigger={props.refreshTrigger}
      />

      <AgDirekComponent
        setData={setAgDirek}
        extent={extent}
        zoom={zoom}
        selectedViewType={selectedViewType}
        refreshTrigger={props.refreshTrigger}
      />
      <OgMusDirekComponent
        setData={setOgMusDirek}
        extent={extent}
        zoom={zoom}
        selectedViewType={selectedViewType}
        refreshTrigger={props.refreshTrigger}
      />
      <AydDirekComponent
        setData={setAydDirek}
        extent={extent}
        zoom={zoom}
        selectedViewType={selectedViewType}
        refreshTrigger={props.refreshTrigger}
      />

      <AgHatComponent
        setData={setAgHat}
        allPoles={allPoles}
        extent={extent}
        zoom={zoom}
        selectedViewType={selectedViewType}
        refreshTrigger={props.refreshTrigger}
      />
      <OgHatComponent
        setData={setOgHat}
        allPoles={allPoles}
        extent={extent}
        zoom={zoom}
        selectedViewType={selectedViewType}
        refreshTrigger={props.refreshTrigger}
      />
      <RekortmanComponent
        setData={setRekortman}
        allPoles={allPoles}
        extent={extent}
        zoom={zoom}
        selectedViewType={selectedViewType}
        refreshTrigger={props.refreshTrigger}
      />
      <ArmaturComponent
        setData={setArmatur}
        extent={extent}
        zoom={zoom}
        selectedViewType={selectedViewType}
        refreshTrigger={props.refreshTrigger}
      />
    </>
  );
}
