import { describe, it, expect, vi } from 'vitest';
import {
  BaseException,
  BadRequestException,
  NotFoundException,
  ValidationException,
  ResourceNotFoundException,
  DuplicateResourceException,
  RateLimitExceededException,
  TooManyRequestsException,
  DatabaseConnectionException,
  ExternalServiceException,
  StatusCodes,
  isBaseException,
  isRetryableError,
  createErrorResponse,
  validateRequiredFields,
  validateEmail,
  validateUrl,
  generateRequestId,
  retryWithBackoff
} from '../index';

describe('NodeFling Exceptions Library', () => {
  describe('BaseException', () => {
    it('should create a base exception with default values', () => {
      class TestException extends BaseException {
        constructor(options = {}) {
          super(options);
        }
      }

      const error = new TestException();

      expect(error.message).toBe('An error occurred');
      expect(error.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.isOperational).toBe(true);
      expect(error.retryable).toBe(false);
      expect(error.logLevel).toBe('error');
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should create a base exception with custom options', () => {
      class TestException extends BaseException {
        constructor(options = {}) {
          super(options);
        }
      }

      const customOptions = {
        message: 'Custom error message',
        statusCode: StatusCodes.BAD_REQUEST,
        code: 'CUSTOM_ERROR',
        details: { field: 'test' },
        requestId: 'req-123',
        userId: 'user-456',
        context: { action: 'test' },
        isOperational: false,
        retryable: true,
        logLevel: 'warn' as const
      };

      const error = new TestException(customOptions);

      expect(error.message).toBe(customOptions.message);
      expect(error.statusCode).toBe(customOptions.statusCode);
      expect(error.code).toBe(customOptions.code);
      expect(error.details).toEqual(customOptions.details);
      expect(error.requestId).toBe(customOptions.requestId);
      expect(error.userId).toBe(customOptions.userId);
      expect(error.context).toEqual(customOptions.context);
      expect(error.isOperational).toBe(customOptions.isOperational);
      expect(error.retryable).toBe(customOptions.retryable);
      expect(error.logLevel).toBe(customOptions.logLevel);
    });

    it('should convert to JSON correctly', () => {
      const error = new BadRequestException({
        message: 'Test error',
        details: { field: 'test' }
      });

      const json = error.toJSON();

      expect(json.name).toBe('BadRequestException');
      expect(json.message).toBe('Test error');
      expect(json.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(json.details).toEqual({ field: 'test' });
      expect(json.timestamp).toBeDefined();
    });

    it('should create standardized response', () => {
      const error = new NotFoundException({
        message: 'Resource not found',
        requestId: 'req-123'
      });

      const response = error.toResponse();

      expect(response.error.name).toBe('NotFoundException');
      expect(response.error.message).toBe('Resource not found');
      expect(response.error.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(response.error.requestId).toBe('req-123');
    });

    it('should check error categories correctly', () => {
      const clientError = new BadRequestException();
      class TestServerException extends BaseException {
        constructor(options = {}) {
          super({ statusCode: StatusCodes.INTERNAL_SERVER_ERROR, ...options });
        }
      }
      const serverError = new TestServerException();

      expect(clientError.isClientError()).toBe(true);
      expect(clientError.isServerError()).toBe(false);
      expect(serverError.isServerError()).toBe(true);
      expect(serverError.isClientError()).toBe(false);
    });

    it('should add context and details', () => {
      class TestException extends BaseException {
        constructor(options = {}) {
          super(options);
        }
      }
      const error = new TestException();

      error.addContext('key1', 'value1');
      error.addDetail('key2', 'value2');

      expect(error.context.key1).toBe('value1');
      expect(error.details.key2).toBe('value2');
    });
  });

  describe('HTTP Exceptions', () => {
    it('should create BadRequestException correctly', () => {
      const error = new BadRequestException({
        message: 'Invalid input',
        details: { field: 'email' }
      });

      expect(error.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.message).toBe('Invalid input');
    });

    it('should create NotFoundException correctly', () => {
      const error = new NotFoundException({
        message: 'User not found'
      });

      expect(error.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should create TooManyRequestsException as retryable', () => {
      const error = new TooManyRequestsException();

      expect(error.retryable).toBe(true);
      expect(error.statusCode).toBe(StatusCodes.TOO_MANY_REQUESTS);
    });
  });

  describe('Business Exceptions', () => {
    it('should create ResourceNotFoundException with details', () => {
      const error = new ResourceNotFoundException('User', '123');

      expect(error.message).toBe("User with id '123' not found");
      expect(error.details.resourceType).toBe('User');
      expect(error.details.resourceId).toBe('123');
      expect(error.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('should create DuplicateResourceException with details', () => {
      const error = new DuplicateResourceException('User', 'email', 'test@example.com');

      expect(error.message).toBe("User with email 'test@example.com' already exists");
      expect(error.details.resourceType).toBe('User');
      expect(error.details.field).toBe('email');
      expect(error.details.value).toBe('test@example.com');
      expect(error.statusCode).toBe(StatusCodes.CONFLICT);
    });

    it('should create RateLimitExceededException as retryable', () => {
      const error = new RateLimitExceededException(100, 'hour');

      expect(error.message).toBe('Rate limit exceeded. Limit: 100 requests per hour');
      expect(error.retryable).toBe(true);
      expect(error.details.limit).toBe(100);
      expect(error.details.window).toBe('hour');
    });
  });

  describe('Database Exceptions', () => {
    it('should create DatabaseConnectionException as retryable', () => {
      const error = new DatabaseConnectionException('PostgreSQL');

      expect(error.message).toBe('Database connection failed: PostgreSQL');
      expect(error.retryable).toBe(true);
      expect(error.isOperational).toBe(false);
      expect(error.details.database).toBe('PostgreSQL');
    });

    it('should create ExternalServiceException with service details', () => {
      const error = new ExternalServiceException('PaymentService', '/api/payments');

      expect(error.message).toBe('External service error: PaymentService');
      expect(error.retryable).toBe(true);
      expect(error.details.service).toBe('PaymentService');
      expect(error.details.endpoint).toBe('/api/payments');
    });
  });

  describe('Utility Functions', () => {
    describe('isBaseException', () => {
      it('should return true for BaseException instances', () => {
        const error = new BadRequestException();
        expect(isBaseException(error)).toBe(true);
      });

      it('should return false for regular errors', () => {
        const error = new Error('Regular error');
        expect(isBaseException(error)).toBe(false);
      });
    });

    describe('isRetryableError', () => {
      it('should return true for retryable exceptions', () => {
        const error = new TooManyRequestsException();
        expect(isRetryableError(error)).toBe(true);
      });

      it('should return false for non-retryable exceptions', () => {
        const error = new BadRequestException();
        expect(isRetryableError(error)).toBe(false);
      });

      it('should detect network errors', () => {
        const networkError = new Error('ECONNRESET');
        (networkError as any).code = 'ECONNRESET';
        expect(isRetryableError(networkError)).toBe(true);
      });
    });

    describe('createErrorResponse', () => {
      it('should create response for BaseException', () => {
        const error = new NotFoundException({ message: 'Not found' });
        const response = createErrorResponse(error);

        expect(response.error.name).toBe('NotFoundException');
        expect(response.error.message).toBe('Not found');
        expect(response.error.statusCode).toBe(StatusCodes.NOT_FOUND);
      });

      it('should create response for regular errors', () => {
        const error = new Error('Regular error');
        (error as any).statusCode = 500;

        const response = createErrorResponse(error);

        expect(response.error.name).toBe('Error');
        expect(response.error.message).toBe('Regular error');
        expect(response.error.statusCode).toBe(500);
      });
    });

    describe('validateRequiredFields', () => {
      it('should pass for valid object', () => {
        const obj = { name: 'John', email: 'john@example.com' };
        expect(() => validateRequiredFields(obj, ['name', 'email'])).not.toThrow();
      });

      it('should throw for missing fields', () => {
        const obj = { name: 'John' };
        expect(() => validateRequiredFields(obj, ['name', 'email'])).toThrow();
      });
    });

    describe('validateEmail', () => {
      it('should validate correct emails', () => {
        expect(validateEmail('test@example.com')).toBe(true);
        expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      });

      it('should reject invalid emails', () => {
        expect(validateEmail('invalid-email')).toBe(false);
        expect(validateEmail('test@')).toBe(false);
        expect(validateEmail('@example.com')).toBe(false);
      });
    });

    describe('validateUrl', () => {
      it('should validate correct URLs', () => {
        expect(validateUrl('https://example.com')).toBe(true);
        expect(validateUrl('http://localhost:3000')).toBe(true);
      });

      it('should reject invalid URLs', () => {
        expect(validateUrl('not-a-url')).toBe(false);
        expect(validateUrl('ftp://')).toBe(false);
      });
    });

    describe('generateRequestId', () => {
      it('should generate unique request IDs', () => {
        const id1 = generateRequestId();
        const id2 = generateRequestId();

        expect(id1).toBeDefined();
        expect(id2).toBeDefined();
        expect(id1).not.toBe(id2);
        expect(typeof id1).toBe('string');
      });
    });

    describe('retryWithBackoff', () => {
      it('should retry and succeed', async () => {
        let attempts = 0;
        const fn = vi.fn().mockImplementation(() => {
          attempts++;
          if (attempts < 3) {
            const error = new Error('ECONNRESET');
            (error as any).code = 'ECONNRESET';
            throw error;
          }
          return 'success';
        });

        const result = await retryWithBackoff(fn, 3, 10, 100);

        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(3);
      });

      it('should fail after max retries', async () => {
        const error = new Error('ECONNRESET');
        (error as any).code = 'ECONNRESET';
        const fn = vi.fn().mockRejectedValue(error);

        await expect(retryWithBackoff(fn, 2, 10, 100)).rejects.toThrow('ECONNRESET');
        expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
      });
    });
  });

  describe('Status Codes', () => {
    it('should have correct status codes', () => {
      expect(StatusCodes.OK).toBe(200);
      expect(StatusCodes.BAD_REQUEST).toBe(400);
      expect(StatusCodes.NOT_FOUND).toBe(404);
      expect(StatusCodes.INTERNAL_SERVER_ERROR).toBe(500);
    });

    it('should have status messages', () => {
      expect(StatusCodes.OK).toBe(200);
      expect(StatusCodes.BAD_REQUEST).toBe(400);
      expect(StatusCodes.NOT_FOUND).toBe(404);
    });
  });

  describe('ValidationException', () => {
    it('should create ValidationException with default values', () => {
      const error = new ValidationException();
      expect(error.message).toBe('Validation Error');
      expect(error.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.isClientError()).toBe(true);
    });

    it('should create ValidationException with custom message and details', () => {
      const error = new ValidationException({
        message: 'Custom validation failed',
        details: { field: 'email', reason: 'invalid format' }
      });
      expect(error.message).toBe('Custom validation failed');
      expect(error.details).toEqual({ field: 'email', reason: 'invalid format' });
    });

    it('should work with error utilities', () => {
      const error = new ValidationException({
        message: 'Invalid input',
        details: { field: 'username' }
      });
      const json = error.toJSON();
      expect(json.name).toBe('ValidationException');
      expect(json.message).toBe('Invalid input');
      expect(json.details).toEqual({ field: 'username' });
      const response = error.toResponse();
      expect(response.error.name).toBe('ValidationException');
      expect(response.error.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
    });
  });
}); 