// Express types (optional dependency)
interface ExpressRequest {
  url: string;
  method: string;
  ip: string;
  get(name: string): string | undefined;
  requestId?: string;
  user?: { id: string };
}

interface ExpressResponse {
  status(code: number): ExpressResponse;
  json(data: any): void;
  send(data?: any): void;
  setHeader(name: string, value: string): void;
  on(event: string, callback: () => void): void;
}

interface ExpressNextFunction {
  (error?: any): void;
}

// BaseException is used in type checking - eslint-disable-next-line @typescript-eslint/no-unused-vars
// import { BaseException } from '../exceptions/base-exception';
import {
  createErrorResponse,
  generateRequestId,
  isBaseException,
  shouldLogError,
  formatErrorForLogging
} from '../utils/error-utils';

/**
 * Express middleware to add request ID to all requests
 */
export function requestIdMiddleware(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction): void {
  const requestId = (req as any).headers?.['x-request-id'] as string || generateRequestId();
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}

/**
 * Express middleware to handle async errors
 */
export function asyncErrorHandler(
  fn: (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => Promise<any>
) {
  return (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Express error handling middleware
 */
export function errorHandler(
  error: any,
  req: ExpressRequest,
  res: ExpressResponse,
  _next: ExpressNextFunction
): void {
  // Add request context to the error
  if (isBaseException(error)) {
    error.setRequestId((req as any).requestId);
    if ((req as any).user?.id) {
      error.setUserId((req as any).user.id);
    }
    error.addContext('url', req.url);
    error.addContext('method', req.method);
    error.addContext('ip', req.ip);
    error.addContext('userAgent', req.get('User-Agent'));
  }

  // Log the error if needed
  if (shouldLogError(error)) {
    const logMessage = formatErrorForLogging(error, {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: (req as any).requestId
    });

    console.error(logMessage);
  }

  // Create error response
  const errorResponse = createErrorResponse(error, process.env.NODE_ENV === 'development');
  const statusCode = isBaseException(error) ? error.statusCode : (error.statusCode || 500);

  // Send response
  res.status(statusCode).json(errorResponse);
}

/**
 * Express middleware to handle 404 errors
 */
export function notFoundHandler(req: ExpressRequest, _res: ExpressResponse, next: ExpressNextFunction): void {
  const error = new Error(`Route ${req.method} ${req.url} not found`);
  (error as any).statusCode = 404;
  next(error);
}

/**
 * Express middleware to validate request body
 */
export function validateBody(schema: Record<string, any>) {
  return (req: ExpressRequest, _res: ExpressResponse, next: ExpressNextFunction): void => {
    try {
      const { validateRequiredFields } = require('../utils/error-utils');
      validateRequiredFields((req as any).body, Object.keys(schema));
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Express middleware to handle CORS errors
 */
export function corsErrorHandler(
  error: any,
  _req: ExpressRequest,
  _res: ExpressResponse,
  next: ExpressNextFunction
): void {
  if (error.message?.includes('CORS')) {
    const corsError = new Error('CORS policy violation');
    (corsError as any).statusCode = 403;
    next(corsError);
  } else {
    next(error);
  }
}

/**
 * Express middleware to handle JSON parsing errors
 */
export function jsonErrorHandler(
  error: any,
  _req: ExpressRequest,
  _res: ExpressResponse,
  next: ExpressNextFunction
): void {
  if (error instanceof SyntaxError && 'body' in error) {
    const jsonError = new Error('Invalid JSON payload');
    (jsonError as any).statusCode = 400;
    next(jsonError);
  } else {
    next(error);
  }
}

/**
 * Express middleware to handle rate limiting errors
 */
export function rateLimitErrorHandler(
  error: any,
  _req: ExpressRequest,
  _res: ExpressResponse,
  next: ExpressNextFunction
): void {
  if (error.message?.includes('rate limit')) {
    const rateLimitError = new Error('Too many requests');
    (rateLimitError as any).statusCode = 429;
    next(rateLimitError);
  } else {
    next(error);
  }
}

/**
 * Express middleware to add security headers
 */
export function securityHeadersMiddleware(_req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}

/**
 * Express middleware to log requests
 */
export function requestLoggerMiddleware(req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.url} ${(res as any).statusCode} ${duration}ms - ${(req as any).requestId}`;

    if ((res as any).statusCode >= 400) {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }
  });

  next();
} 