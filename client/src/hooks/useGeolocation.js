import { useState, useEffect } from "react";

export default function useGeolocation(options = {}) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    const handleSuccess = (position) => {
      // Convert to GeoJSON Point format
      setLocation({
        type: "Point",
        coordinates: [position.coords.longitude, position.coords.latitude],
      });
      setLoading(false);
    };

    const handleError = (error) => {
      setError(
        error.code === 1
          ? "Permission denied. Please allow location access."
          : error.message
      );
      setLoading(false);
    };

    const watch = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
        ...options,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watch);
    };
  }, [options]);

  return { location, error, loading };
}
