// utils/responses.js

/**
 * Standard success response format
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
    ...(data && { data })
  };

  return res.status(statusCode).json(response);
};

/**
 * Standard error response format
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {Object|Array} errors - Additional error details
 */
const errorResponse = (res, message, statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    ...(errors && { errors })
  };

  return res.status(statusCode).json(response);
};

/**
 * Validation error response
 * @param {Object} res - Express response object
 * @param {Array} validationErrors - Array of validation errors
 */
const validationErrorResponse = (res, validationErrors) => {
  const formattedErrors = validationErrors.map(error => ({
    field: error.param || error.path,
    message: error.msg || error.message,
    value: error.value
  }));

  return errorResponse(res, 'Validation failed', 400, formattedErrors);
};

/**
 * Authentication error response
 * @param {Object} res - Express response object
 * @param {string} message - Auth error message
 */
const authErrorResponse = (res, message = 'Authentication failed') => {
  return errorResponse(res, message, 401);
};

/**
 * Authorization error response
 * @param {Object} res - Express response object
 * @param {string} message - Authorization error message
 */
const authorizationErrorResponse = (res, message = 'Insufficient permissions') => {
  return errorResponse(res, message, 403);
};

/**
 * Not found error response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource that was not found
 */
const notFoundResponse = (res, resource = 'Resource') => {
  return errorResponse(res, `${resource} not found`, 404);
};

/**
 * Conflict error response
 * @param {Object} res - Express response object
 * @param {string} message - Conflict message
 */
const conflictResponse = (res, message = 'Resource already exists') => {
  return errorResponse(res, message, 409);
};

/**
 * Server error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {Object} error - Error object for logging
 */
const serverErrorResponse = (res, message = 'Internal server error', error = null) => {
  // In production, don't expose internal error details
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    ...(isDevelopment && error && { 
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    })
  };

  return res.status(500).json(response);
};

/**
 * Rate limit error response
 * @param {Object} res - Express response object
 * @param {string} message - Rate limit message
 * @param {number} retryAfter - Seconds until retry is allowed
 */
const rateLimitResponse = (res, message = 'Too many requests', retryAfter = 900) => {
  res.set('Retry-After', retryAfter);
  return errorResponse(res, message, 429, { retryAfter });
};

/**
 * Maintenance mode response
 * @param {Object} res - Express response object
 * @param {string} message - Maintenance message
 */
const maintenanceResponse = (res, message = 'Service temporarily unavailable') => {
  return errorResponse(res, message, 503);
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination info
 */
const paginatedResponse = (res, message, data, pagination) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1
    }
  };

  return res.status(200).json(response);
};

/**
 * Created response for POST requests
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} data - Created resource data
 */
const createdResponse = (res, message, data) => {
  return successResponse(res, message, data, 201);
};

/**
 * No content response for DELETE requests
 * @param {Object} res - Express response object
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

/**
 * Custom response with notification type for frontend
 * @param {Object} res - Express response object
 * @param {string} message - Message to display
 * @param {Object} data - Response data
 * @param {string} type - Notification type: 'success', 'error', 'warning', 'info'
 * @param {number} statusCode - HTTP status code
 */
const notificationResponse = (res, message, data = null, type = 'success', statusCode = 200) => {
  const response = {
    success: type === 'success',
    message,
    type, // For frontend notification styling
    timestamp: new Date().toISOString(),
    ...(data && { data })
  };

  return res.status(statusCode).json(response);
};

/**
 * Success notification (green)
 */
const successNotification = (res, message, data = null) => {
  return notificationResponse(res, message, data, 'success', 200);
};

/**
 * Error notification (red)
 */
const errorNotification = (res, message, statusCode = 400, data = null) => {
  return notificationResponse(res, message, data, 'error', statusCode);
};

/**
 * Warning notification (yellow/orange)
 */
const warningNotification = (res, message, data = null) => {
  return notificationResponse(res, message, data, 'warning', 200);
};

/**
 * Info notification (blue)
 */
const infoNotification = (res, message, data = null) => {
  return notificationResponse(res, message, data, 'info', 200);
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  authErrorResponse,
  authorizationErrorResponse,
  notFoundResponse,
  conflictResponse,
  serverErrorResponse,
  rateLimitResponse,
  maintenanceResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
  notificationResponse,
  successNotification,
  errorNotification,
  warningNotification,
  infoNotification
};