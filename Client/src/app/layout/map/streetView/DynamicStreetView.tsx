// import "./style/streetView.css";
// import { useEffect, useMemo, useState } from "react"
// import { useAppDispatch, useAppSelector } from "../../../../lib/hooks"
// import { selectFocusedView, selectIsStreetViewPinned, selectIsStreetViewVisible, selectSelectedViewType, selectViewState, toggleStreetView, toggleStreetViewPinned } from "../mapSlice"
// import { C3D_MapViewType } from "../../../../lib/enums";
// import { PictureInPicture, PictureInPicture2, PinIcon, PinOff } from "lucide-react";
// import { useStreetView } from '../../../../lib/hooks/useStreetView';

// function convertDeckGLToLatLonWithOffset(
//   x: number,
//   y: number,
//   baseLatitude: number,
//   baseLongitude: number
// ) {
//   // DeckGL genellikle Web Mercator (EPSG:3857) kullanır
//   // 1 metre = yaklaşık 1/111320 derece (enlem için)
//   // 1 metre = yaklaşık 1/(111320 * cos(latitude)) derece (boylam için)

//   const METERS_TO_DEGREES_LAT = 1 / 111320;
//   const METERS_TO_DEGREES_LON = 1 / (111320 * Math.cos(baseLatitude * Math.PI / 180));

//   // X, Y offset'lerini derece cinsinden çevir
//   const latitudeOffset = y * METERS_TO_DEGREES_LAT;
//   const longitudeOffset = x * METERS_TO_DEGREES_LON;

//   // Yeni koordinatları hesapla
//   const newLatitude = baseLatitude + latitudeOffset;
//   const newLongitude = baseLongitude + longitudeOffset;

//   return {
//     latitude: newLatitude,
//     longitude: newLongitude,
//   };
// }

// export default function DynmicStreetView() {
//   const { firstPerson } = useAppSelector(selectViewState);
//   const selectedViewType = useAppSelector(selectSelectedViewType);
//   const focusedView = useAppSelector(selectFocusedView);
//   const isStreetViewVisible = useAppSelector(selectIsStreetViewVisible);
//   const isStreetViewPinned = useAppSelector(selectIsStreetViewPinned);
//   const [updatedLonLat, setUpdatedLonLat] = useState<{ latitude: number; longitude: number } | null>(null);

//   const dispatch = useAppDispatch();

//   const {
//     containerRef,
//     streetView,
//     isLoaded,
//     //@ts-ignore
//     error,
//     updatePosition,
//     updatePOV,
//   } = useStreetView({
//     position: { lat: updatedLonLat?.latitude || 0, lng: updatedLonLat?.longitude || 0 },
//     pov: { heading: firstPerson.bearing!, pitch: -firstPerson.pitch!, zoom: 1 },
//     apiKey: import.meta.env.VITE_MAPS_API_KEY
//   });

//   const onPin = () => {
//     dispatch(toggleStreetViewPinned());
//   }

//   const onToggle = () => {
//     dispatch(toggleStreetView())
//   }

//   // Memoize the position calculation
//   const calculatedPosition = useMemo(() => {
//     if (firstPerson && selectedViewType === "firstPerson" && focusedView === "deckgl") {
//       return convertDeckGLToLatLonWithOffset(
//         firstPerson.position![0],
//         firstPerson.position![1],
//         firstPerson.latitude!,
//         firstPerson.longitude!
//       );
//     }
//     return null;
//   }, [
//     firstPerson?.position?.[0],
//     firstPerson?.position?.[1],
//     firstPerson?.latitude,
//     firstPerson?.longitude,
//     selectedViewType,
//     focusedView
//   ]);

//   // Update position only when calculated position changes
//   useEffect(() => {
//     if (calculatedPosition) {
//       setUpdatedLonLat(prev => {
//         // Only update if significantly different
//         if (!prev ||
//           Math.abs(prev.latitude - calculatedPosition.latitude) > 0.000001 ||
//           Math.abs(prev.longitude - calculatedPosition.longitude) > 0.000001) {
//           return calculatedPosition;
//         }
//         return prev;
//       });
//     }
//   }, [calculatedPosition]);

//   useEffect(() => {
//     if (isLoaded && streetView && focusedView === "deckgl") {
//       updatePosition({ lat: updatedLonLat?.latitude || 0, lng: updatedLonLat?.longitude || 0 });
//       updatePOV({ heading: firstPerson.bearing! || 0, pitch: -firstPerson.pitch! || 0 });
//     }
//   }, [focusedView, updatedLonLat, firstPerson.bearing, firstPerson.pitch, isLoaded, streetView]);

//   return (
//     <>
//       <button className="toggle-street-view" onClick={onToggle} title="Toggle Street View">
//         {isStreetViewVisible ? <PictureInPicture /> : <PictureInPicture2 />}
//       </button>
//       <div
//         className={`street-view ${selectedViewType === C3D_MapViewType.FirstPerson && isStreetViewVisible ? "visible" : ""} ${isStreetViewPinned ? "focused" : ""}`}
//         ref={containerRef}
//       >
//         <button className="toggle-button" onClick={onPin} title="Toggle Large View">
//           {
//             isStreetViewPinned ? <PinOff /> : <PinIcon style={{ rotate: "45deg" }} />
//           }
//         </button>
//       </div>
//     </>
//   )
// }

import "./style/streetView.css";
import { useEffect, useMemo, useState, useRef } from "react"
import { useAppDispatch, useAppSelector } from "../../../../lib/hooks"
import { selectFocusedView, selectIsStreetViewPinned, selectIsStreetViewVisible, selectSelectedViewType, selectViewState, toggleStreetView, toggleStreetViewPinned } from "../mapSlice"
import { C3D_MapViewType } from "../../../../lib/enums";
import { PictureInPicture, PictureInPicture2, PinIcon, PinOff } from "lucide-react";
import { useStreetView } from '../../../../lib/hooks/useStreetView';
import { Logger } from "../../../../lib/utils";

function convertDeckGLToLatLonWithOffset(
  x: number,
  y: number,
  baseLatitude: number,
  baseLongitude: number
) {
  const METERS_TO_DEGREES_LAT = 1 / 111320;
  const METERS_TO_DEGREES_LON = 1 / (111320 * Math.cos(baseLatitude * Math.PI / 180));

  const latitudeOffset = y * METERS_TO_DEGREES_LAT;
  const longitudeOffset = x * METERS_TO_DEGREES_LON;

  const newLatitude = baseLatitude + latitudeOffset;
  const newLongitude = baseLongitude + longitudeOffset;

  return {
    latitude: newLatitude,
    longitude: newLongitude,
  };
}

export default function DynamicStreetView() {
  const { firstPerson } = useAppSelector(selectViewState);
  const selectedViewType = useAppSelector(selectSelectedViewType);
  const focusedView = useAppSelector(selectFocusedView);
  const isStreetViewVisible = useAppSelector(selectIsStreetViewVisible);
  const isStreetViewPinned = useAppSelector(selectIsStreetViewPinned);

  // Track the current position that Street View should display
  const [streetViewPosition, setStreetViewPosition] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const lastUpdateRef = useRef<{ lat: number; lng: number; bearing: number; pitch: number } | null>(null);

  const dispatch = useAppDispatch();

  // Calculate the target position from DeckGL
  const targetPosition = useMemo(() => {
    if (firstPerson && selectedViewType === "firstPerson" && focusedView === "deckgl") {

      const converted = convertDeckGLToLatLonWithOffset(
        firstPerson.position![0],
        firstPerson.position![1],
        firstPerson.latitude!,
        firstPerson.longitude!
      );

      Logger.table([...firstPerson.position!, firstPerson.latitude, firstPerson.latitude, converted.latitude, converted.longitude]);

      return {
        lat: converted.latitude,
        lng: converted.longitude,
        bearing: firstPerson.bearing || 0,
        pitch: -(firstPerson.pitch || 0)
      };
    }
    return null;
  }, [
    firstPerson?.position?.[0],
    firstPerson?.position?.[1],
    firstPerson?.latitude,
    firstPerson?.longitude,
    firstPerson?.bearing,
    firstPerson?.pitch,
    selectedViewType,
    focusedView
  ]);

  const {
    containerRef,
    streetView,
    isLoaded,
    //@ts-ignore
    error,
    updatePosition,
    updatePOV,
  } = useStreetView({
    position: streetViewPosition,
    pov: { heading: targetPosition?.bearing || 0, pitch: targetPosition?.pitch || 0, zoom: 1 },
    apiKey: import.meta.env.VITE_MAPS_API_KEY
  });

  const onPin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dispatch(toggleStreetViewPinned());
  }

  const onToggle = () => {
    dispatch(toggleStreetView())
  }

  // Update Street View when target position changes
  useEffect(() => {
    if (targetPosition && isLoaded && streetView && focusedView === "deckgl") {
      // Check if the position or view has significantly changed
      const hasSignificantChangeOnPos = !lastUpdateRef.current ||
        Math.abs(lastUpdateRef.current.lat - targetPosition.lat) > 0.000001 ||
        Math.abs(lastUpdateRef.current.lng - targetPosition.lng) > 0.000001

      if (hasSignificantChangeOnPos) {
        console.log('Updating Street View:', targetPosition);

        // Update position first
        setStreetViewPosition({ lat: targetPosition.lat, lng: targetPosition.lng });
        updatePosition({ lat: targetPosition.lat, lng: targetPosition.lng });

        // Then update the Street View

        lastUpdateRef.current = targetPosition;
      }

      const hasSignificantChangeOnView = !lastUpdateRef.current ||
        Math.abs(lastUpdateRef.current.bearing - targetPosition.bearing) > 0.1 ||
        Math.abs(lastUpdateRef.current.pitch - targetPosition.pitch) > 0.1;

      if (hasSignificantChangeOnView) {
        console.log('Updating Street View POV:', targetPosition);

        updatePOV({
          heading: targetPosition.bearing,
          pitch: targetPosition.pitch,
          zoom: 1
        });

        lastUpdateRef.current = targetPosition;
      }
    }
  }, [targetPosition, isLoaded, streetView, focusedView, updatePosition, updatePOV]);

  // Initialize position when Street View first loads
  useEffect(() => {
    if (isLoaded && targetPosition && !lastUpdateRef.current) {
      setStreetViewPosition({ lat: targetPosition.lat, lng: targetPosition.lng });
      lastUpdateRef.current = targetPosition;
    }
  }, [isLoaded, targetPosition]);

  return (
    <>
      <button className="toggle-street-view" onClick={onToggle} title="Toggle Street View">
        {isStreetViewVisible ? <PictureInPicture /> : <PictureInPicture2 />}
      </button>
      <div
        className={`street-view ${selectedViewType === C3D_MapViewType.FirstPerson && isStreetViewVisible ? "visible" : ""} ${isStreetViewPinned ? "pinned" : ""}`}
        ref={containerRef}
      >
        <button className="toggle-button" onClick={onPin} title="Toggle Large View">
          {
            isStreetViewPinned ? <PinOff /> : <PinIcon style={{ rotate: "45deg" }} />
          }
        </button>
      </div>
    </>
  )
}