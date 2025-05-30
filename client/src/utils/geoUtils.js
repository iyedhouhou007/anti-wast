// Convert kilometers to miles for display
export const kmToMiles = (km) => {
  return km * 0.621371;
};

// Calculate distance between two points in kilometers
export const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in kilometers

  // Extract coordinates from GeoJSON Point objects
  const [lon1, lat1] = point1.coordinates;
  const [lon2, lat2] = point2.coordinates;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

// Convert degrees to radians
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Format distance for display
export const formatDistance = (distance, useImperial = false) => {
  if (useImperial) {
    const miles = kmToMiles(distance);
    return miles < 1
      ? `${Math.round(miles * 5280)} ft`
      : `${miles.toFixed(1)} mi`;
  }

  return distance < 1
    ? `${Math.round(distance * 1000)} m`
    : `${distance.toFixed(1)} km`;
};

// Create a GeoJSON Point object from coordinates
export const createGeoPoint = (longitude, latitude) => {
  return {
    type: "Point",
    coordinates: [longitude, latitude],
  };
};

// Get coordinates from a GeoJSON Point object
export const getCoordinates = (geoPoint) => {
  if (!geoPoint || !geoPoint.coordinates) {
    return null;
  }

  return {
    longitude: geoPoint.coordinates[0],
    latitude: geoPoint.coordinates[1],
  };
};
