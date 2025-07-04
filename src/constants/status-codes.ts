/**
 * HTTP Status Codes
 * Comprehensive collection of HTTP status codes for better error handling
 */
export const StatusCodes = {
  // 1xx Informational
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,
  EARLY_HINTS: 103,

  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTI_STATUS: 207,
  ALREADY_REPORTED: 208,
  IM_USED: 226,

  // 3xx Redirection
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,

  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511,
} as const;

/**
 * Status code categories for easier filtering and handling
 */
export const StatusCodeCategories = {
  INFORMATIONAL: [100, 101, 102, 103],
  SUCCESS: [200, 201, 202, 203, 204, 205, 206, 207, 208, 226],
  REDIRECTION: [300, 301, 302, 303, 304, 305, 307, 308],
  CLIENT_ERROR: [400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451],
  SERVER_ERROR: [500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511],
} as const;

/**
 * Helper function to check if a status code belongs to a specific category
 */
export function isStatusCodeCategory(statusCode: number, category: keyof typeof StatusCodeCategories): boolean {
  return (StatusCodeCategories[category] as readonly number[]).includes(statusCode);
}

/**
 * Helper function to get the category of a status code
 */
export function getStatusCodeCategory(statusCode: number): keyof typeof StatusCodeCategories | null {
  for (const [category, codes] of Object.entries(StatusCodeCategories)) {
    if ((codes as readonly number[]).includes(statusCode)) {
      return category as keyof typeof StatusCodeCategories;
    }
  }
  return null;
}

/**
 * Common status code messages
 */
export const StatusMessages = {
  [StatusCodes.OK]: 'OK',
  [StatusCodes.CREATED]: 'Created',
  [StatusCodes.BAD_REQUEST]: 'Bad Request',
  [StatusCodes.UNAUTHORIZED]: 'Unauthorized',
  [StatusCodes.FORBIDDEN]: 'Forbidden',
  [StatusCodes.NOT_FOUND]: 'Not Found',
  [StatusCodes.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [StatusCodes.SERVICE_UNAVAILABLE]: 'Service Unavailable',
  [StatusCodes.CONFLICT]: 'Conflict',
  [StatusCodes.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  [StatusCodes.TOO_MANY_REQUESTS]: 'Too Many Requests',
} as const; 