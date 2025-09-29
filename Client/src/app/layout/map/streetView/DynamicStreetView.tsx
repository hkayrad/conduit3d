import "./style/streetView.css";
import { useEffect, useMemo, useState, useRef } from "react"
import { useAppDispatch, useAppSelector } from "../../../../lib/hooks"
import { selectFocusedView, selectIsStreetViewPinned, selectIsStreetViewVisible, selectSelectedViewType, selectViewState, toggleStreetView, toggleStreetViewPinned } from "../mapSlice"
import { C3D_MapViewType } from "../../../../lib/enums";
import { PictureInPicture, PictureInPicture2, PinIcon, PinOff } from "lucide-react";
import { useStreetView } from '../../../../lib/hooks/useStreetView';
import { convertDeckGLToLatLonWithOffset } from "../../../../lib/utils";

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
      {
        selectedViewType === C3D_MapViewType.FirstPerson && (
          <button className="toggle-street-view" onClick={onToggle} title="Toggle Street View">
            {isStreetViewVisible ? <PictureInPicture /> : <PictureInPicture2 />}
          </button>
        )
      }
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