import React, { useState, useMemo } from "react";

function MapLinkGenerator() {
  // State to store input values
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [label, setLabel] = useState("");

  // Generate the Google Maps URL whenever latitude, longitude, or label changes
  const googleMapsUrl = useMemo(() => {
    // Trim whitespace from inputs
    const lat = latitude.trim();
    const lng = longitude.trim();

    // Basic validation: check if lat and long are not empty
    if (lat === "" || lng === "") {
      return null; // Don't generate a link if coordinates are missing
    }

    // Parse values
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    // Robust validation: check if they are numbers and within valid ranges
    if (
      isNaN(latNum) ||
      isNaN(lngNum) ||
      latNum < -90 ||
      latNum > 90 ||
      lngNum < -180 ||
      lngNum > 180
    ) {
      return null;
    }

    // Encode the label for use in the URL
    const encodedLabel = encodeURIComponent(label);

    // Create the Google Maps URL to display a marker
    return `https://maps.google.com/?q=${latNum},${lngNum}&label=${encodedLabel}`;
  }, [latitude, longitude, label]); // Regenerate URL whenever these state variables change

  return (
    <div>
      <h2>Generate Google Maps Link</h2>
      <div>
        <label htmlFor="latitude">Latitude:</label>
        <input
          id="latitude"
          type="text"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          placeholder="e.g., 34.0522"
        />
      </div>
      <div>
        <label htmlFor="longitude">Longitude:</label>
        <input
          id="longitude"
          type="text"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          placeholder="e.g., -118.2437"
        />
      </div>
      <div>
        <label htmlFor="label">Label (Optional):</label>
        <input
          id="label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., My Location"
        />
      </div>

      {/* Display the link if the URL is valid */}
      {googleMapsUrl ? (
        <div>
          <p>Generated Link:</p>
          <a
            href={googleMapsUrl}
            target="_blank" // Open in a new tab/app
            rel="noopener noreferrer" // Recommended for security
          >
            Open Location in Google Maps
          </a>
        </div>
      ) : (
        <p>Enter Latitude and Longitude to generate the link.</p>
      )}
    </div>
  );
}

export default MapLinkGenerator;
