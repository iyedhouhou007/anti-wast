import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./LocationPicker.css";

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationMarker({ position, onLocationChange }) {
  const map = useMapEvents({
    click(e) {
      onLocationChange(e.latlng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position]);

  return position ? (
    <Marker position={position} className="location-picker-marker" />
  ) : null;
}

export default function LocationPicker({ onLocationSelect, defaultLocation }) {
  const [position, setPosition] = useState(defaultLocation);
  const [initialPosition, setInitialPosition] = useState([36.8065, 10.1815]); // Default to Tunisia

  useEffect(() => {
    // Get user's location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setInitialPosition([newPos.lat, newPos.lng]);
          if (!defaultLocation) {
            setPosition(newPos);
            onLocationSelect(newPos);
          }
        },
        () => {
          // Use default position if geolocation fails
          console.log("Using default location");
        }
      );
    }
  }, []);

  const handleLocationChange = (newPosition) => {
    setPosition(newPosition);
    onLocationSelect(newPosition);
  };

  return (
    <div className="location-picker">
      <MapContainer
        center={initialPosition}
        zoom={13}
        className="location-picker-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          position={position}
          onLocationChange={handleLocationChange}
        />
      </MapContainer>
    </div>
  );
}
