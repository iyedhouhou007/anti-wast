import axios from "axios";
import AppError from "./AppError.js";

/**
 * Get coordinates from either GPS data or state name
 * @param {Object} location - Location object containing either GPS coordinates or state name
 * @returns {Promise<Array<number>>} - Array of coordinates [lng, lat]
 * @throws {AppError} - Throws an error if geocoding fails
 */
export const getCoordinates = async (location) => {
  // If GPS coordinates are provided

  if (location?.gps?.lat && location?.gps?.lng) {
    return [location.gps.lng, location.gps.lat];
  }

  // If state name is provided
  else if (location?.state) {
    const stateName = location.state;
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        stateName
      )}&format=json&limit=1`;

      const response = await axios.get(nominatimUrl);

      if (response.data && response.data.length > 0) {
        const { lon, lat } = response.data[0];
        return [parseFloat(lon), parseFloat(lat)];
      } else {
        throw new AppError(
          `Could not find coordinates for state: ${stateName}`,
          400
        );
      }
    } catch (error) {
      throw new AppError("Error geocoding location.", 500);
    }
  }

  // If neither GPS coordinates nor state name are provided
  else {
    throw new AppError(
      "Please provide either GPS coordinates or a state name.",
      400
    );
  }
};

