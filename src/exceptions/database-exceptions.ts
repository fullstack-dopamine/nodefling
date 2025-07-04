import { BaseException, ExceptionOptions } from './base-exception';
import { StatusCodes } from '../constants/status-codes';

/**
 * Database Connection Exception
 * Used when database connection fails
 */
export class DatabaseConnectionException extends BaseException {
  constructor(database: string, options: ExceptionOptions = {}) {
    super({
      message: `Database connection failed: ${database}`,
      statusCode: StatusCodes.SERVICE_UNAVAILABLE,
      code: 'DATABASE_CONNECTION_ERROR',
      details: { database },
      retryable: true,
      isOperational: false,
      ...options
    });
  }
}

/**
 * Database Query Exception
 * Used when a database query fails
 */
export class DatabaseQueryException extends BaseException {
  constructor(query: string, options: ExceptionOptions = {}) {
    super({
      message: 'Database query failed',
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      code: 'DATABASE_QUERY_ERROR',
      details: { query },
      isOperational: false,
      ...options
    });
  }
}

/**
 * Database Transaction Exception
 * Used when a database transaction fails
 */
export class DatabaseTransactionException extends BaseException {
  constructor(operation: string, options: ExceptionOptions = {}) {
    super({
      message: `Database transaction failed: ${operation}`,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      code: 'DATABASE_TRANSACTION_ERROR',
      details: { operation },
      isOperational: false,
      ...options
    });
  }
}

/**
 * Database Constraint Exception
 * Used when database constraints are violated
 */
export class DatabaseConstraintException extends BaseException {
  constructor(constraint: string, table: string, options: ExceptionOptions = {}) {
    super({
      message: `Database constraint violated: ${constraint}`,
      statusCode: StatusCodes.CONFLICT,
      code: 'DATABASE_CONSTRAINT_VIOLATION',
      details: { constraint, table },
      ...options
    });
  }
}

/**
 * External Service Exception
 * Used when an external service call fails
 */
export class ExternalServiceException extends BaseException {
  constructor(service: string, endpoint: string, options: ExceptionOptions = {}) {
    super({
      message: `External service error: ${service}`,
      statusCode: StatusCodes.SERVICE_UNAVAILABLE,
      code: 'EXTERNAL_SERVICE_ERROR',
      details: { service, endpoint },
      retryable: true,
      isOperational: false,
      ...options
    });
  }
}

/**
 * External Service Timeout Exception
 * Used when an external service call times out
 */
export class ExternalServiceTimeoutException extends BaseException {
  constructor(service: string, timeout: number, options: ExceptionOptions = {}) {
    super({
      message: `External service timeout: ${service}`,
      statusCode: StatusCodes.GATEWAY_TIMEOUT,
      code: 'EXTERNAL_SERVICE_TIMEOUT',
      details: { service, timeout },
      retryable: true,
      isOperational: false,
      ...options
    });
  }
}

/**
 * External Service Unavailable Exception
 * Used when an external service is unavailable
 */
export class ExternalServiceUnavailableException extends BaseException {
  constructor(service: string, options: ExceptionOptions = {}) {
    super({
      message: `External service unavailable: ${service}`,
      statusCode: StatusCodes.SERVICE_UNAVAILABLE,
      code: 'EXTERNAL_SERVICE_UNAVAILABLE',
      details: { service },
      retryable: true,
      isOperational: false,
      ...options
    });
  }
}

/**
 * Cache Exception
 * Used when cache operations fail
 */
export class CacheException extends BaseException {
  constructor(operation: string, key?: string, options: ExceptionOptions = {}) {
    super({
      message: `Cache operation failed: ${operation}`,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      code: 'CACHE_ERROR',
      details: { operation, key },
      retryable: true,
      isOperational: false,
      ...options
    });
  }
}

/**
 * File System Exception
 * Used when file system operations fail
 */
export class FileSystemException extends BaseException {
  constructor(operation: string, path: string, options: ExceptionOptions = {}) {
    super({
      message: `File system operation failed: ${operation}`,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      code: 'FILE_SYSTEM_ERROR',
      details: { operation, path },
      isOperational: false,
      ...options
    });
  }
}

/**
 * Network Exception
 * Used when network operations fail
 */
export class NetworkException extends BaseException {
  constructor(operation: string, url: string, options: ExceptionOptions = {}) {
    super({
      message: `Network operation failed: ${operation}`,
      statusCode: StatusCodes.SERVICE_UNAVAILABLE,
      code: 'NETWORK_ERROR',
      details: { operation, url },
      retryable: true,
      isOperational: false,
      ...options
    });
  }
}

/**
 * Third Party API Exception
 * Used when third-party API calls fail
 */
export class ThirdPartyAPIException extends BaseException {
  constructor(api: string, endpoint: string, statusCode?: number, options: ExceptionOptions = {}) {
    super({
      message: `Third-party API error: ${api}`,
      statusCode: statusCode || StatusCodes.SERVICE_UNAVAILABLE,
      code: 'THIRD_PARTY_API_ERROR',
      details: { api, endpoint, apiStatusCode: statusCode },
      retryable: true,
      isOperational: false,
      ...options
    });
  }
} 