import { BaseException, ExceptionOptions } from './base-exception';
import { StatusCodes } from '../constants/status-codes';

/**
 * Validation Exception
 * Used when data validation fails
 */
export class ValidationException extends BaseException {
  constructor(options: ExceptionOptions = {}) {
    super({
      message: 'Validation Error',
      statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
      code: 'VALIDATION_ERROR',
      ...options
    });
  }
}

/**
 * Authentication Exception
 * Used when authentication fails
 */
export class AuthenticationException extends BaseException {
  constructor(options: ExceptionOptions = {}) {
    super({
      message: 'Authentication Failed',
      statusCode: StatusCodes.UNAUTHORIZED,
      code: 'AUTHENTICATION_FAILED',
      ...options
    });
  }
}

/**
 * Authorization Exception
 * Used when authorization fails
 */
export class AuthorizationException extends BaseException {
  constructor(options: ExceptionOptions = {}) {
    super({
      message: 'Authorization Failed',
      statusCode: StatusCodes.FORBIDDEN,
      code: 'AUTHORIZATION_FAILED',
      ...options
    });
  }
}

/**
 * Resource Not Found Exception
 * Used when a specific resource is not found
 */
export class ResourceNotFoundException extends BaseException {
  constructor(resourceType: string, resourceId: string, options: ExceptionOptions = {}) {
    super({
      message: `${resourceType} with id '${resourceId}' not found`,
      statusCode: StatusCodes.NOT_FOUND,
      code: 'RESOURCE_NOT_FOUND',
      details: { resourceType, resourceId },
      ...options
    });
  }
}

/**
 * Duplicate Resource Exception
 * Used when trying to create a resource that already exists
 */
export class DuplicateResourceException extends BaseException {
  constructor(resourceType: string, field: string, value: string, options: ExceptionOptions = {}) {
    super({
      message: `${resourceType} with ${field} '${value}' already exists`,
      statusCode: StatusCodes.CONFLICT,
      code: 'DUPLICATE_RESOURCE',
      details: { resourceType, field, value },
      ...options
    });
  }
}

/**
 * Insufficient Permissions Exception
 * Used when user doesn't have sufficient permissions
 */
export class InsufficientPermissionsException extends BaseException {
  constructor(requiredPermission: string, options: ExceptionOptions = {}) {
    super({
      message: `Insufficient permissions. Required: ${requiredPermission}`,
      statusCode: StatusCodes.FORBIDDEN,
      code: 'INSUFFICIENT_PERMISSIONS',
      details: { requiredPermission },
      ...options
    });
  }
}

/**
 * Rate Limit Exceeded Exception
 * Used when rate limiting is exceeded
 */
export class RateLimitExceededException extends BaseException {
  constructor(limit: number, window: string, options: ExceptionOptions = {}) {
    super({
      message: `Rate limit exceeded. Limit: ${limit} requests per ${window}`,
      statusCode: StatusCodes.TOO_MANY_REQUESTS,
      code: 'RATE_LIMIT_EXCEEDED',
      details: { limit, window },
      retryable: true,
      ...options
    });
  }
}

/**
 * Business Rule Violation Exception
 * Used when a business rule is violated
 */
export class BusinessRuleViolationException extends BaseException {
  constructor(rule: string, details?: Record<string, any>, options: ExceptionOptions = {}) {
    super({
      message: `Business rule violation: ${rule}`,
      statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
      code: 'BUSINESS_RULE_VIOLATION',
      details: { rule, ...details },
      ...options
    });
  }
}

/**
 * Data Integrity Exception
 * Used when data integrity constraints are violated
 */
export class DataIntegrityException extends BaseException {
  constructor(constraint: string, options: ExceptionOptions = {}) {
    super({
      message: `Data integrity constraint violated: ${constraint}`,
      statusCode: StatusCodes.CONFLICT,
      code: 'DATA_INTEGRITY_VIOLATION',
      details: { constraint },
      ...options
    });
  }
}

/**
 * Configuration Exception
 * Used when there's a configuration error
 */
export class ConfigurationException extends BaseException {
  constructor(configKey: string, options: ExceptionOptions = {}) {
    super({
      message: `Configuration error: ${configKey}`,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      code: 'CONFIGURATION_ERROR',
      details: { configKey },
      isOperational: false,
      ...options
    });
  }
}

/**
 * Feature Not Available Exception
 * Used when a feature is not available
 */
export class FeatureNotAvailableException extends BaseException {
  constructor(feature: string, options: ExceptionOptions = {}) {
    super({
      message: `Feature '${feature}' is not available`,
      statusCode: StatusCodes.SERVICE_UNAVAILABLE,
      code: 'FEATURE_NOT_AVAILABLE',
      details: { feature },
      ...options
    });
  }
}

/**
 * Maintenance Mode Exception
 * Used when the service is in maintenance mode
 */
export class MaintenanceModeException extends BaseException {
  constructor(estimatedDuration?: string, options: ExceptionOptions = {}) {
    super({
      message: 'Service is currently under maintenance',
      statusCode: StatusCodes.SERVICE_UNAVAILABLE,
      code: 'MAINTENANCE_MODE',
      details: { estimatedDuration },
      retryable: true,
      ...options
    });
  }
} 