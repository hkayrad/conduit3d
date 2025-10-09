import "./style/streetView.css";
import { useEffect, useMemo, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../../../lib/hooks"
import { selectIsStreetViewPinned, selectIsStreetViewVisible, selectSelectedViewType, selectViewState, toggleStreetView, toggleStreetViewPinned } from "../../mapSlice"
import { C3D_MapViewType } from "../../../../../lib/enums";
import { PictureInPicture, PictureInPicture2, PinIcon, PinOff } from "lucide-react";

function convertDeckGLToLatLonWithOffset(
  x: number,
  y: number,
  baseLatitude: number,
  baseLongitude: number
) {
  // DeckGL genellikle Web Mercator (EPSG:3857) kullanır
  // 1 metre = yaklaşık 1/111320 derece (enlem için)
  // 1 metre = yaklaşık 1/(111320 * cos(latitude)) derece (boylam için)

  const METERS_TO_DEGREES_LAT = 1 / 111320;
  const METERS_TO_DEGREES_LON = 1 / (111320 * Math.cos(baseLatitude * Math.PI / 180));

  // X, Y offset'lerini derece cinsinden çevir
  const latitudeOffset = y * METERS_TO_DEGREES_LAT;
  const longitudeOffset = x * METERS_TO_DEGREES_LON;

  // Yeni koordinatları hesapla
  const newLatitude = baseLatitude + latitudeOffset;
  const newLongitude = baseLongitude + longitudeOffset;

  return {
    latitude: newLatitude,
    longitude: newLongitude,
  };
}

export default function StaticStreetView() {
  const { firstPerson } = useAppSelector(selectViewState);
  const selectedViewType = useAppSelector(selectSelectedViewType);
  const isStreetViewVisible = useAppSelector(selectIsStreetViewVisible);
  const isStreetViewPinned = useAppSelector(selectIsStreetViewPinned);
  const [updatedLonLat, setUpdatedLonLat] = useState<{ latitude: number; longitude: number } | null>(null);
 
  const dispatch = useAppDispatch();

  const fetchImg = useMemo(() => {
    if (selectedViewType !== C3D_MapViewType.FirstPerson) return "";
    // return `https://maps.googleapis.com/maps/api/streetview?key=${import.meta.env.VITE_MAPS_API_KEY}&location=${updatedLonLat?.latitude},${updatedLonLat?.longitude}&heading=${firstPerson.bearing}&pitch=${-firstPerson.pitch!}&fov=90&size=600x400`;
    return `https://placehold.co/1200x800/png?text=lon:${updatedLonLat?.longitude}%0Alat:${updatedLonLat?.latitude}%0Ab:${firstPerson.bearing}%0Ap:${-(firstPerson.pitch!)}`;
  }, [firstPerson]);

  const onPin = () => {
    dispatch(toggleStreetViewPinned());
  }

  const onToggle = () => {
    dispatch(toggleStreetView())
  }

  useEffect(() => {
    if (firstPerson && selectedViewType === "firstPerson") {
      // Initialize and display the street view here
      const { latitude, longitude } = convertDeckGLToLatLonWithOffset(firstPerson.position![0], firstPerson.position![1], firstPerson.latitude!, firstPerson.longitude!);
      setUpdatedLonLat({ latitude, longitude });

    }
  }, [firstPerson, selectedViewType]);

  return (
    <>
      <button className="toggle-street-view" onClick={onToggle} title="Toggle Street View">
        {isStreetViewVisible ? <PictureInPicture /> : <PictureInPicture2 />}
      </button>
      <div className={`street-view ${selectedViewType === C3D_MapViewType.FirstPerson && isStreetViewVisible ? "visible" : ""} ${isStreetViewPinned ? "pinned" : ""}`}>
        <button className="toggle-button" onClick={onPin} title="Toggle Large View">
          {
            isStreetViewPinned ? <PinOff /> : <PinIcon style={{ rotate: "45deg" }} />
          }
        </button>
        <img
          className="street-view-image"
          src={fetchImg}
        />
      </div>
    </>
  )
}