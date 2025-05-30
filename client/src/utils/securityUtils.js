import DOMPurify from "dompurify";

// Sanitize HTML content
export const sanitizeHtml = (content) => {
  if (!content) return "";
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ["p", "br", "b", "i", "em", "strong", "a", "ul", "li"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
};

// Sanitize user input for search queries
export const sanitizeSearchQuery = (query) => {
  if (!query) return "";
  return query
    .replace(/[<>]/g, "") // Remove angle brackets
    .trim()
    .slice(0, 100); // Limit length
};

// Check if a string contains potential XSS content
export const containsXSS = (content) => {
  if (!content) return false;
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /onclick/gi,
    /onerror/gi,
  ];
  return xssPatterns.some((pattern) => pattern.test(content));
};

// Validate image file type
export const isValidImageType = (file) => {
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  return file && validTypes.includes(file.type);
};

// Validate file size (in bytes)
export const isValidFileSize = (file, maxSize = 5 * 1024 * 1024) => {
  return file && file.size <= maxSize;
};

// Create safe redirect URL
export const createSafeRedirect = (url, defaultPath = "/") => {
  if (!url) return defaultPath;

  try {
    const parsedUrl = new URL(url, window.location.origin);
    // Only allow redirects to the same origin
    return parsedUrl.origin === window.location.origin
      ? parsedUrl.pathname + parsedUrl.search
      : defaultPath;
  } catch {
    return defaultPath;
  }
};

// Sanitize object values
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (typeof value === "string") {
      acc[key] = DOMPurify.sanitize(value);
    } else if (Array.isArray(value)) {
      acc[key] = value.map((item) =>
        typeof item === "string" ? DOMPurify.sanitize(item) : item
      );
    } else if (typeof value === "object" && value !== null) {
      acc[key] = sanitizeObject(value);
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
};
