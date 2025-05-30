class AppError extends Error {
  constructor(message, statusCode, status = null, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.status =
      status || (statusCode >= 400 && statusCode < 500 ? "fail" : "error");
    this.isOperational = true;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
