import "./style/streetView.css";
import { useEffect, useMemo, useState } from "react"
import { useAppSelector } from "../../../../lib/hooks"
import { selectSelectedViewType, selectViewState } from "../mapSlice"

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

export default function StreetView() {
  const { firstPerson } = useAppSelector(selectViewState);
  const selectedViewType = useAppSelector(selectSelectedViewType);
  const [updatedLonLat, setUpdatedLonLat] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    console.log(firstPerson, selectedViewType);

    if (firstPerson && selectedViewType === "firstPerson") {
      // Initialize and display the street view here
      const { latitude, longitude } = convertDeckGLToLatLonWithOffset(firstPerson.position![0], firstPerson.position![1], firstPerson.latitude!, firstPerson.longitude!);
      setUpdatedLonLat({ latitude, longitude });

    }
  }, [firstPerson, selectedViewType]);

  const fetchImg = useMemo(() => {
    console.log(updatedLonLat);
    // return `https://maps.googleapis.com/maps/api/streetview?location=${updatedLonLat?.latitude},${updatedLonLat?.longitude}&key=${import.meta.env.VITE_MAPS_API_KEY}&heading=${firstPerson.bearing}&pitch=${-firstPerson.pitch!}&fov=90&size=600x300`;
    return `https://placehold.co/600x300/png?text=${updatedLonLat?.latitude},${updatedLonLat?.longitude},${firstPerson?.bearing},${-firstPerson?.pitch!}`;
  }, [firstPerson]);

  return (
    <>
      {selectedViewType === "firstPerson" && (
        <img
          className={`street-view`}
          src={fetchImg}
        />
      )}
    </>
  )
}