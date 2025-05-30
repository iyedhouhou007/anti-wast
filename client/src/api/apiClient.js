// src/api/apiClient.js
import axios from "axios";
import { config } from "../utils/config";

/**
 * @typedef {import('../types/schema').ApiError} ApiError
 * @typedef {import('../types/schema').BreadPost} BreadPost
 * @typedef {import('../types/schema').User} User
 */

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 15000,
});

// Request interceptor for adding auth token and handling content type
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common response formats and errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Handle unauthorized responses
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }

    // Extract error message from response
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    // Create a custom error object
    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;

    return Promise.reject(customError);
  }
);

export const apiClient = {
  get: (url, config) => axiosInstance.get(url, config),
  post: (url, data, config) => axiosInstance.post(url, data, config),
  put: (url, data, config) => axiosInstance.put(url, data, config),
  patch: (url, data, config) => axiosInstance.patch(url, data, config),
  delete: (url, config) => axiosInstance.delete(url, config),
};
