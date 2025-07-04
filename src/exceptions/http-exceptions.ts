import { BaseException, ExceptionOptions } from './base-exception';
import { StatusCodes } from '../constants/status-codes';

/**
 * Bad Request Exception (400)
 * Used when the request is malformed or contains invalid data
 */
export class BadRequestException extends BaseException {
  constructor(options: ExceptionOptions = {}) {
    super({
      message: 'Bad Request',
      statusCode: StatusCodes.BAD_REQUEST,
      code: 'BAD_REQUEST',
      ...options
    });
  }
}

/**
 * Unauthorized Exception (401)
 * Used when authentication is required but not provided
 */
export class UnauthorizedException extends BaseException {
  constructor(options: ExceptionOptions = {}) {
    super({
      message: 'Unauthorized',
      statusCode: StatusCodes.UNAUTHORIZED,
      code: 'UNAUTHORIZED',
      ...options
    });
  }
}

/**
 * Forbidden Exception (403)
 * Used when the user is authenticated but doesn't have permission
 */
export class ForbiddenException extends BaseException {
  constructor(options: ExceptionOptions = {}) {
    super({
      message: 'Forbidden',
      statusCode: StatusCodes.FORBIDDEN,
      code: 'FORBIDDEN',
      ...options
    });
  }
}

/**
 * Not Found Exception (404)
 * Used when a resource is not found
 */
export class NotFoundException extends BaseException {
  constructor(options: ExceptionOptions = {}) {
    super({
      message: 'Not Found',
      statusCode: StatusCodes.NOT_FOUND,
      code: 'NOT_FOUND',
      ...options
    });
  }
}

/**
 * Method Not Allowed Exception (405)
 * Used when the HTTP method is not allowed for the resource
 */
export class MethodNotAllowedException extends BaseException {
  constructor(options: ExceptionOptions = {}) {
    super({
      message: 'Method Not Allowed',
      statusCode: StatusCodes.METHOD_NOT_ALLOWED,
      code: 'METHOD_NOT_ALLOWED',
      ...options
    });
  }
}

/**
 * Conflict Exception (409)
 * Used when there's a conflict with the current state of the resource
 */
export class ConflictException extends BaseException {
  constructor(options: ExceptionOptions = {}) {
    super({
      message: 'Conflict',
      statusCode: StatusCodes.CONFLICT,
      code: 'CONFLICT',
      ...options
    });
  }
}

/**
 * Unprocessable Entity Exception (422)
 * Used when the request is well-formed but contains semantic errors
 */
export class UnprocessableEntityException extends BaseException {
  constructor(options: ExceptionOptions = {}) {
    super({
      message: 'Unprocessable Entity',
      statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
      code: 'UNPROCESSABLE_ENTITY',
      ...options
    });
  }
}

/**
 * Too Many Requests Exception (429)
 * Used when rate limiting is exceeded
 */
export class TooManyRequestsException extends BaseException {
  constructor(options: ExceptionOptions = {}) {
    super({
      message: 'Too Many Requests',
      statusCode: StatusCodes.TOO_MANY_REQUESTS,
      code: 'TOO_MANY_REQUESTS',
      retryable: true,
      ...options
    });
  }
}

/**
 * Internal Server Error Exception (500)
 * Used for unexpected server errors
 */
export class InternalServerErrorException extends BaseException {
  constructor(options: ExceptionOptions = {}) {
    super({
      message: 'Internal Server Error',
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      isOperational: false,
      ...options
    });
  }
}

/**
 * Service Unavailable Exception (503)
 * Used when the service is temporarily unavailable
 */
export class ServiceUnavailableException extends BaseException {
  constructor(options: ExceptionOptions = {}) {
    super({
      message: 'Service Unavailable',
      statusCode: StatusCodes.SERVICE_UNAVAILABLE,
      code: 'SERVICE_UNAVAILABLE',
      retryable: true,
      isOperational: false,
      ...options
    });
  }
}

/**
 * Gateway Timeout Exception (504)
 * Used when a gateway timeout occurs
 */
export class GatewayTimeoutException extends BaseException {
  constructor(options: ExceptionOptions = {}) {
    super({
      message: 'Gateway Timeout',
      statusCode: StatusCodes.GATEWAY_TIMEOUT,
      code: 'GATEWAY_TIMEOUT',
      retryable: true,
      isOperational: false,
      ...options
    });
  }
} 