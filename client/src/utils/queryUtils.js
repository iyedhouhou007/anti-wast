// Build query string from parameters
export const buildQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) return "";

  const queryParams = Object.entries(params)
    .filter(([_, value]) => value != null && value !== "")
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`)
          .join("&");
      }
      if (typeof value === "object") {
        return `${encodeURIComponent(key)}=${encodeURIComponent(
          JSON.stringify(value)
        )}`;
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");

  return queryParams ? `?${queryParams}` : "";
};

// Parse query string to object
export const parseQueryString = (queryString) => {
  if (!queryString) return {};

  return queryString
    .replace(/^\?/, "")
    .split("&")
    .reduce((params, param) => {
      const [key, value] = param.split("=").map(decodeURIComponent);

      // Handle array parameters (e.g., tags[]=1&tags[]=2)
      if (key.endsWith("[]")) {
        const arrayKey = key.slice(0, -2);
        params[arrayKey] = params[arrayKey] || [];
        params[arrayKey].push(value);
      } else {
        try {
          // Try to parse JSON values
          params[key] = JSON.parse(value);
        } catch {
          params[key] = value;
        }
      }

      return params;
    }, {});
};

// Build pagination parameters
export const buildPaginationParams = ({
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) => ({
  page: Number(page),
  limit: Number(limit),
  sort: `${sortOrder === "desc" ? "-" : ""}${sortBy}`,
});

// Build location query parameters
export const buildLocationQuery = ({
  longitude,
  latitude,
  radius = 5, // km
  unit = "km",
} = {}) => {
  if (!longitude || !latitude) return null;

  return {
    location: {
      type: "Point",
      coordinates: [Number(longitude), Number(latitude)],
    },
    maxDistance: unit === "mi" ? radius * 1.60934 : radius, // Convert miles to km if needed
  };
};

// Build search query parameters
export const buildSearchParams = ({
  query,
  filters = {},
  location,
  pagination,
} = {}) => {
  return {
    ...(query && { q: query }),
    ...filters,
    ...(location && buildLocationQuery(location)),
    ...buildPaginationParams(pagination),
  };
};
