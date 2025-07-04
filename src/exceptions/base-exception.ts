import { StatusCodes, StatusMessages } from '../constants/status-codes';

/**
 * Configuration options for exceptions
 */
export interface ExceptionOptions {
  message?: string;
  statusCode?: number;
  code?: string;
  details?: Record<string, any>;
  cause?: Error;
  timestamp?: Date;
  requestId?: string;
  userId?: string;
  context?: Record<string, any>;
  isOperational?: boolean;
  retryable?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
}

/**
 * Base exception class that all other exceptions extend
 * Provides configurable error handling with useful properties
 */
export abstract class BaseException extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: Record<string, any>;
  public readonly timestamp: Date;
  public readonly requestId: string | undefined;
  public readonly userId: string | undefined;
  public readonly context: Record<string, any>;
  public readonly isOperational: boolean;
  public readonly retryable: boolean;
  public readonly logLevel: 'error' | 'warn' | 'info' | 'debug';

  constructor(options: ExceptionOptions = {}) {
    const {
      message = 'An error occurred',
      statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
      code = 'INTERNAL_ERROR',
      details = {},
      cause,
      timestamp = new Date(),
      requestId,
      userId,
      context = {},
      isOperational = true,
      retryable = false,
      logLevel = 'error'
    } = options;

    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = timestamp;
    this.requestId = requestId;
    this.userId = userId;
    this.context = context;
    this.isOperational = isOperational;
    this.retryable = retryable;
    this.logLevel = logLevel;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set the cause if provided
    if (cause) {
      (this as any).cause = cause;
    }
  }

  /**
   * Convert exception to a plain object for serialization
   */
  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      requestId: this.requestId,
      userId: this.userId,
      context: this.context,
      isOperational: this.isOperational,
      retryable: this.retryable,
      logLevel: this.logLevel,
      stack: this.stack
    };
  }

  /**
   * Get a standardized error response object
   */
  public toResponse(): Record<string, any> {
    const response: Record<string, any> = {
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        statusCode: this.statusCode
      }
    };

    // Only include details in development or if explicitly configured
    if (process.env.NODE_ENV === 'development' || this.details) {
      response.error.details = this.details;
    }

    if (this.requestId) {
      response.error.requestId = this.requestId;
    }

    return response;
  }

  /**
   * Check if this exception is a client error (4xx)
   */
  public isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if this exception is a server error (5xx)
   */
  public isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600;
  }

  /**
   * Check if this exception is retryable
   */
  public isRetryable(): boolean {
    return this.retryable;
  }

  /**
   * Add additional context to the exception
   */
  public addContext(key: string, value: any): this {
    this.context[key] = value;
    return this;
  }

  /**
   * Add additional details to the exception
   */
  public addDetail(key: string, value: any): this {
    this.details[key] = value;
    return this;
  }

  /**
   * Set the request ID for tracking
   */
  public setRequestId(requestId: string): this {
    (this as any).requestId = requestId;
    return this;
  }

  /**
   * Set the user ID for tracking
   */
  public setUserId(userId: string): this {
    (this as any).userId = userId;
    return this;
  }

  /**
   * Get the status message for this exception
   */
  public getStatusMessage(): string {
    return StatusMessages[this.statusCode as keyof typeof StatusMessages] || 'Unknown Error';
  }
} 