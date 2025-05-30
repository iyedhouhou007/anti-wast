import AppError from "../utils/AppError.js";

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log error details for debugging (all environments)
  const errorLog = {
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    error: {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
  };
  console.error(JSON.stringify(errorLog, null, 2));

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, message: err.message };

    // MongoDB and Mongoose Errors
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    // JWT Errors
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    // Request Validation
    if (error.type === "entity.parse.failed") error = handleJSONParseError();
    if (error.name === "MulterError") error = handleFileUploadError(error);

    // Rate Limiting
    if (error.name === "TooManyRequests") error = handleRateLimitError();

    // Network Errors
    if (error.code === "ECONNREFUSED") error = handleNetworkError();

    sendErrorProd(error, res);
  }
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: sanitizeErrorMessage(err.message),
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

// Helper function to sanitize error messages
const sanitizeErrorMessage = (message) => {
  // Remove sensitive information patterns
  return message
    .replace(/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g, "[EMAIL]")
    .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, "[CARD]")
    .replace(/\b\d{10,}\b/g, "[ID]");
};

// MongoDB Related Errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue ? Object.keys(err.keyValue).join(", ") : "";
  const message = `Duplicate value for: ${value}. Please use another value`;
  return new AppError(message, 409);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// Authentication Errors
const handleJWTError = () => new AppError("Invalid authentication token", 401);

const handleJWTExpiredError = () =>
  new AppError("Your session has expired. Please log in again", 401);

// Request Validation Errors
const handleJSONParseError = () => new AppError("Invalid JSON payload", 400);

const handleFileUploadError = (err) =>
  new AppError(`File upload error: ${err.message}`, 400);

// Rate Limiting Errors
const handleRateLimitError = () =>
  new AppError("Too many requests. Please try again later", 429);

// Network Errors
const handleNetworkError = () =>
  new AppError("Service temporarily unavailable", 503);

export default errorHandler;
