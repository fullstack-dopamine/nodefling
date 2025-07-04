import { BaseException } from '../exceptions/base-exception';
import { StatusCodes } from '../constants/status-codes';

/**
 * Error utility functions for common error handling patterns
 */

/**
 * Check if an error is a BaseException
 */
export function isBaseException(error: any): error is BaseException {
  return error instanceof BaseException;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  if (isBaseException(error)) {
    return error.isRetryable();
  }

  // Check for common retryable error patterns
  const retryableErrors = [
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ENETUNREACH',
    'ECONNRESET',
    'EPIPE',
    'EAI_AGAIN',
  ];

  return retryableErrors.some(
    code =>
      error.code === code ||
      error.message?.includes(code) ||
      error.stack?.includes(code)
  );
}

/**
 * Check if an error is operational (expected vs unexpected)
 */
export function isOperationalError(error: any): boolean {
  if (isBaseException(error)) {
    return error.isOperational;
  }

  // Consider most errors as operational unless they're clearly programming errors
  return (
    !error.stack?.includes('TypeError') &&
    !error.stack?.includes('ReferenceError') &&
    !error.stack?.includes('SyntaxError')
  );
}

/**
 * Extract error details for logging
 */
export function extractErrorDetails(error: any): Record<string, any> {
  if (isBaseException(error)) {
    return error.toJSON();
  }

  return {
    name: error.name || 'Error',
    message: error.message || 'Unknown error',
    stack: error.stack,
    code: error.code,
    statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a standardized error response for API frameworks
 */
export function createErrorResponse(
  error: any,
  includeStack = false
): Record<string, any> {
  if (isBaseException(error)) {
    const response = error.toResponse();
    if (includeStack && process.env.NODE_ENV === 'development') {
      response.error.stack = error.stack;
    }
    return response;
  }

  const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  return {
    error: {
      name: error.name || 'Error',
      message: error.message || 'Internal Server Error',
      statusCode,
      ...(includeStack &&
        process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  };
}

/**
 * Wrap a function with error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => R | Promise<R>,
  errorHandler?: (error: any, ...args: T) => never
): (...args: T) => R | Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      const result = fn(...args);
      return result instanceof Promise ? await result : result;
    } catch (error) {
      if (errorHandler) {
        errorHandler(error, ...args);
      }
      throw error;
    }
  };
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
  maxDelay = 10000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Validate required fields in an object
 */
export function validateRequiredFields(
  obj: Record<string, any>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(
    field =>
      obj[field] === undefined || obj[field] === null || obj[field] === ''
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize error message for production
 */
export function sanitizeErrorMessage(
  message: string,
  isProduction = false
): string {
  if (!isProduction) {
    return message;
  }

  // Remove sensitive information from error messages
  return message
    .replace(
      /password['"]?\s*[:=]\s*['"]?[^'"]+['"]?/gi,
      'password: [REDACTED]'
    )
    .replace(/token['"]?\s*[:=]\s*['"]?[^'"]+['"]?/gi, 'token: [REDACTED]')
    .replace(/key['"]?\s*[:=]\s*['"]?[^'"]+['"]?/gi, 'key: [REDACTED]')
    .replace(/secret['"]?\s*[:=]\s*['"]?[^'"]+['"]?/gi, 'secret: [REDACTED]');
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Parse error from different sources (JSON, string, Error object)
 */
export function parseError(error: any): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  if (typeof error === 'object' && error !== null) {
    const parsedError = new Error(error.message || 'Unknown error');
    Object.assign(parsedError, error);
    return parsedError;
  }

  return new Error('Unknown error');
}

/**
 * Check if error should be logged
 */
export function shouldLogError(
  error: any,
  logLevel: 'error' | 'warn' | 'info' | 'debug' = 'error'
): boolean {
  if (isBaseException(error)) {
    const errorLogLevel = error.logLevel;
    const logLevels = { error: 0, warn: 1, info: 2, debug: 3 };
    return logLevels[errorLogLevel] <= logLevels[logLevel];
  }

  return logLevel === 'error';
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(
  error: any,
  context?: Record<string, any>
): string {
  const details = extractErrorDetails(error);
  const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';

  return `${details.name}: ${details.message} | Status: ${details.statusCode} | Timestamp: ${details.timestamp}${contextStr}`;
}
