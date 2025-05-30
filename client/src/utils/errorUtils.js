// Error types that match backend error responses
export const ErrorTypes = {
  VALIDATION_ERROR: 'ValidationError',
  AUTHENTICATION_ERROR: 'AuthenticationError',
  AUTHORIZATION_ERROR: 'AuthorizationError',
  NOT_FOUND_ERROR: 'NotFoundError',
  CONFLICT_ERROR: 'ConflictError',
  NETWORK_ERROR: 'NetworkError'
};

export class AppError extends Error {
  constructor(message, type = ErrorTypes.VALIDATION_ERROR, details = null) {
    super(message);
    this.name = type;
    this.details = details;
  }
}

export class APIError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'APIError';
  }
}

export const handleApiError = (error) => {
  if (!error.response) {
    return new AppError(
      'Network error - please check your internet connection',
      ErrorTypes.NETWORK_ERROR
    );
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      return new AppError(
        data.message || 'Invalid request',
        ErrorTypes.VALIDATION_ERROR,
        data.errors
      );

    case 401:
      return new AppError(
        data.message || 'Please log in to continue',
        ErrorTypes.AUTHENTICATION_ERROR
      );

    case 403:
      return new AppError(
        data.message || 'You do not have permission to perform this action',
        ErrorTypes.AUTHORIZATION_ERROR
      );

    case 404:
      return new AppError(
        data.message || 'Resource not found',
        ErrorTypes.NOT_FOUND_ERROR
      );

    case 409:
      return new AppError(
        data.message || 'A conflict occurred',
        ErrorTypes.CONFLICT_ERROR,
        { field: data.field }
      );

    default:
      return new AppError(
        data.message || 'An unexpected error occurred',
        'UnknownError'
      );
  }
};

export const handleAPIError = (error) => {
  if (error instanceof APIError) {
    return error;
  }

  if (error.response) {
    // Server responded with error
    return new APIError(
      error.response.data.message || 'Server error occurred',
      error.response.status,
      error.response.data.code
    );
  }

  if (error.request) {
    // Request made but no response
    return new APIError('No response from server', 503, 'NO_RESPONSE');
  }

  // Request setup error
  return new APIError('Request failed', 400, 'REQUEST_FAILED');
};

export const isNetworkError = (error) => {
  return !error.response && error.request;
};

export const isAuthError = (error) => {
  return error.status === 401 || error.status === 403;
};

export const getValidationErrors = (error) => {
  if (error?.name === ErrorTypes.VALIDATION_ERROR && error.details) {
    return error.details;
  }
  return {};
};

export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  
  return error.message || 'An unexpected error occurred';
};

export const formatValidationErrors = (errors) => {
  if (!errors) return {};
  
  return Object.entries(errors).reduce((acc, [field, messages]) => {
    acc[field] = Array.isArray(messages) ? messages[0] : messages;
    return acc;
  }, {});
};