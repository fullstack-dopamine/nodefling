// Constants
export {
  StatusCodes,
  StatusCodeCategories,
  StatusMessages,
  isStatusCodeCategory,
  getStatusCodeCategory
} from './constants/status-codes';

// Base Exception
export { BaseException } from './exceptions/base-exception';

// HTTP Exceptions
export {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  MethodNotAllowedException,
  ConflictException,
  UnprocessableEntityException,
  TooManyRequestsException,
  InternalServerErrorException,
  ServiceUnavailableException,
  GatewayTimeoutException
} from './exceptions/http-exceptions';

// Business Exceptions
export {
  ValidationException,
  AuthenticationException,
  AuthorizationException,
  ResourceNotFoundException,
  DuplicateResourceException,
  InsufficientPermissionsException,
  RateLimitExceededException,
  BusinessRuleViolationException,
  DataIntegrityException,
  ConfigurationException,
  FeatureNotAvailableException,
  MaintenanceModeException
} from './exceptions/business-exceptions';

// Database and External Service Exceptions
export {
  DatabaseConnectionException,
  DatabaseQueryException,
  DatabaseTransactionException,
  DatabaseConstraintException,
  ExternalServiceException,
  ExternalServiceTimeoutException,
  ExternalServiceUnavailableException,
  CacheException,
  FileSystemException,
  NetworkException,
  ThirdPartyAPIException
} from './exceptions/database-exceptions';

// Utility Functions
export {
  isBaseException,
  isRetryableError,
  isOperationalError,
  extractErrorDetails,
  createErrorResponse,
  withErrorHandling,
  retryWithBackoff,
  validateRequiredFields,
  validateEmail,
  validateUrl,
  sanitizeErrorMessage,
  generateRequestId,
  parseError,
  shouldLogError,
  formatErrorForLogging
} from './utils/error-utils';

// Express Middleware
export {
  requestIdMiddleware,
  asyncErrorHandler,
  errorHandler,
  notFoundHandler,
  validateBody,
  corsErrorHandler,
  jsonErrorHandler,
  rateLimitErrorHandler,
  securityHeadersMiddleware,
  requestLoggerMiddleware
} from './middleware/express-middleware';

// Type definitions
export type { ExceptionOptions } from './exceptions/base-exception'; 