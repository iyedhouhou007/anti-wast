const requiredVars = ["VITE_API_BASE_URL"];

class AppConfig {
  constructor() {
    this.validateEnv();

    // Setup configuration properties
    this.apiUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

    this.socket = {
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    };

    this.map = {
      defaultZoom: 14,
      defaultCenter: { lat: 40.7128, lng: -74.006 }, // New York by default
    };

    this.upload = {
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ["image/jpeg", "image/png", "image/gif"],
    };

    this.features = {
      enableNotifications: true,
      enableChat: true,
      enableLocationSearch: true,
    };
  }

  validateEnv() {
    // Skip validation in development for easier setup
    if (import.meta.env.DEV) return;

    const missingVars = requiredVars.filter(
      (varName) => !import.meta.env[varName]
    );

    if (missingVars.length > 0) {
      console.warn(`Missing environment variables: ${missingVars.join(", ")}`);
    }
  }

  get isDevelopment() {
    return import.meta.env.MODE === "development";
  }

  get isProduction() {
    return import.meta.env.MODE === "production";
  }
}

// Export a single instance of the config
export const config = new AppConfig();
