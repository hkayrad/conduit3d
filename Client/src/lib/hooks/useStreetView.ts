import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useAppDispatch, useAppSelector } from './reduxHooks';
import { selectFocusedView, setFocusedView, setViewState } from '../../app/layout/map/mapSlice';
import { C3D_MapViewType } from '../enums';

interface StreetViewOptions {
  position: { lat: number; lng: number };
  pov?: { heading: number; pitch: number; zoom?: number };
  apiKey: string;
}

export const useStreetView = ({ position, pov, apiKey }: StreetViewOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const focusedView = useAppSelector(selectFocusedView);
  const dispatch = useAppDispatch();

  useEffect(() => {
    let mounted = true;

    const initStreetView = async () => {
      if (!mounted) return;

      try {
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ["streetView"],
        });

        await loader.importLibrary("streetView");

        if (containerRef.current) {
          streetViewRef.current = new google.maps.StreetViewPanorama(
            containerRef.current,
            {
              position,
              pov: pov || { heading: 0, pitch: 0 },
              zoom: pov?.zoom || 1,
              addressControl: false,
              panControl: false,
              zoomControl: false,
              fullscreenControl: false,
              motionTracking: false,
              motionTrackingControl: false,
            }
          );

          setIsLoaded(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Street View');
      }
    };

    containerRef.current?.addEventListener("mousedown", () => dispatch(setFocusedView("streetview")));

    if (!streetViewRef.current) {
      initStreetView();
    }

    return () => {
      mounted = false;
    };
  }, [apiKey]);

  useEffect(() => {
    if (!streetViewRef.current) return;

    streetViewRef.current.addListener("position_changed", () => {
      if (focusedView !== "streetview") return;
      dispatch(setViewState({
        viewId: C3D_MapViewType.FirstPerson,
        viewState: {
          longitude: streetViewRef.current?.getPosition()?.lng() || 0,
          latitude: streetViewRef.current?.getPosition()?.lat() || 0,
          bearing: streetViewRef.current?.getPov().heading || 0,
          pitch: -streetViewRef.current?.getPov().pitch! || 0,
          position: [0, 0, 3] // Assuming a fixed height of 3 meters
        }
      }))
    });

    streetViewRef.current.addListener("pov_changed", () => {
      if (focusedView !== "streetview") return;
      dispatch(setViewState({
        viewId: C3D_MapViewType.FirstPerson,
        viewState: {
          longitude: streetViewRef.current?.getPosition()?.lng() || 0,
          latitude: streetViewRef.current?.getPosition()?.lat() || 0,
          bearing: streetViewRef.current?.getPov().heading || 0,
          pitch: -streetViewRef.current?.getPov().pitch! || 0,
          position: [0, 0, 3] // Assuming a fixed height of 3 meters
        }
      }))
    })

  }, [focusedView, dispatch]);

  const updatePosition = useCallback((newPosition: { lat: number; lng: number }) => {
    if (streetViewRef.current) {
      console.log('useStreetView: updating position to', newPosition);
      streetViewRef.current.setPosition(new google.maps.LatLng(newPosition.lat, newPosition.lng));
    }
  }, []);

  const updatePOV = useCallback((newPov: { heading: number; pitch: number; zoom?: number }) => {
    if (streetViewRef.current) {
      console.log('useStreetView: updating POV to', newPov);
      streetViewRef.current.setPov({
        heading: newPov.heading,
        pitch: newPov.pitch,
      });
    }
  }, []);


  return {
    containerRef,
    streetView: streetViewRef.current,
    isLoaded,
    error,
    updatePosition,
    updatePOV,
  };
};