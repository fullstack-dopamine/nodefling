<p align="center">
  <img src="assets/banner.png" alt="Nodefling Banner" />
</p>
<p align="center"><b>Throw Errors Like a Boomerang Catch Them with Nodefling.</b></p>

# nodefling

[![npm version](https://img.shields.io/npm/v/nodefling.svg)](https://www.npmjs.com/package/nodefling) [![GitHub stars](https://img.shields.io/github/stars/Fullstack-Dopamine/nodefling.svg)](https://github.com/Fullstack-Dopamine/nodefling/stargazers) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A modern, framework-agnostic Node.js exceptions and error-handling library.  
> 20+ exception classes, HTTP status codes, utilities, and middleware for Express, Next.js, Fastify, Hono, Bun, NestJS, and more.

---

## Why nodefling?

**The main purpose of this library is to make backend code cleaner and provide clearer, more consistent error responses to end users.**

- No more scattered error handling logic
- No more cryptic or inconsistent error messages
- One library, all frameworks, professional error responses

---

## Features

- 20+ production-ready exception classes (HTTP, business, database, external, etc.)
- TypeScript-first, fully typed, and lightweight
- Works with all major Node.js backend frameworks
- Pluggable error utilities: retry, validation, formatting, request ID, etc.
- Express middleware included; adapters for other frameworks easy to add
- Modern test suite (Vitest) and pre-commit/push hooks (Lefthook) for code quality

## Usage

See [full documentation and examples](#getting-started) below.

---

## About the Maintainers

**Organization:** [Fullstack-Dopamine](https://github.com/Fullstack-Dopamine)
**Repository:** [https://github.com/Fullstack-Dopamine/nodefling](https://github.com/Fullstack-Dopamine/nodefling)

---

## Installation

**npm:**

```bash
npm install nodefling
```

**pnpm:**

```bash
pnpm add nodefling
```

**yarn:**

```bash
yarn add nodefling
```

## Quick Start

```typescript
import {
  BadRequestException,
  NotFoundException,
  StatusCodes,
  errorHandler,
} from 'nodefling';

// Basic usage
throw new BadRequestException({
  message: 'Invalid email format',
  details: { email: 'invalid-email' },
});

// With custom options
throw new NotFoundException({
  message: 'User not found',
  details: { userId: '123' },
  requestId: 'req-123',
  retryable: false,
});
```

## Exception Types

### HTTP Exceptions (11 types)

```typescript
import {
  BadRequestException, // 400
  UnauthorizedException, // 401
  ForbiddenException, // 403
  NotFoundException, // 404
  MethodNotAllowedException, // 405
  ConflictException, // 409
  UnprocessableEntityException, // 422
  TooManyRequestsException, // 429
  InternalServerErrorException, // 500
  ServiceUnavailableException, // 503
  GatewayTimeoutException, // 504
} from 'nodefling';
```

### Business Exceptions (12 types)

```typescript
import {
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
  MaintenanceModeException,
} from 'nodefling';
```

### Database & External Service Exceptions (11 types)

```typescript
import {
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
  ThirdPartyAPIException,
} from 'nodefling';
```

## HTTP Status Codes

```typescript
import { StatusCodes, StatusMessages } from 'nodefling';

// Use predefined status codes
console.log(StatusCodes.OK); // 200
console.log(StatusCodes.BAD_REQUEST); // 400
console.log(StatusCodes.INTERNAL_SERVER_ERROR); // 500

// Get status messages
console.log(StatusMessages[StatusCodes.OK]); // "OK"
console.log(StatusMessages[StatusCodes.NOT_FOUND]); // "Not Found"
```

## Express.js Integration

```typescript
import express from 'express';
import {
  errorHandler,
  requestIdMiddleware,
  asyncErrorHandler,
  NotFoundException,
} from 'nodefling';

const app = express();

// Add request ID to all requests
app.use(requestIdMiddleware);

// Async route handler with error handling
app.get(
  '/users/:id',
  asyncErrorHandler(async (req, res) => {
    const user = await getUserById(req.params.id);

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        details: { userId: req.params.id },
      });
    }

    res.json(user);
  })
);

// Global error handler (must be last)
app.use(errorHandler);
```

## Utility Functions

### Error Handling

```typescript
import {
  isBaseException,
  isRetryableError,
  createErrorResponse,
  retryWithBackoff,
} from 'nodefling';

// Check error types
if (isBaseException(error)) {
  console.log(error.statusCode);
  console.log(error.isRetryable());
}

// Create standardized error response
const response = createErrorResponse(error, includeStack);

// Retry with exponential backoff
const result = await retryWithBackoff(
  () => fetchData(),
  (maxRetries = 3),
  (baseDelay = 1000)
);
```

### Validation

```typescript
import { validateRequiredFields, validateEmail, validateUrl } from 'nodefling';

// Validate required fields
validateRequiredFields(data, ['name', 'email', 'age']);

// Validate formats
if (!validateEmail(email)) {
  throw new ValidationException({
    message: 'Invalid email format',
    details: { email },
  });
}
```

## Advanced Usage

### Custom Exception with Context

```typescript
import { BaseException } from 'nodefling';

class CustomBusinessException extends BaseException {
  constructor(businessRule: string, options = {}) {
    super({
      message: `Business rule violated: ${businessRule}`,
      statusCode: 422,
      code: 'BUSINESS_RULE_VIOLATION',
      details: { businessRule },
      retryable: false,
      logLevel: 'warn',
      ...options,
    });
  }
}

throw new CustomBusinessException('minimum_order_amount', {
  requestId: 'req-123',
  context: { orderAmount: 50, minimumAmount: 100 },
});
```

### Error with Retry Logic

```typescript
import { ExternalServiceException, retryWithBackoff } from 'nodefling';

const fetchUserData = async (userId: string) => {
  try {
    const response = await fetch(`/api/users/${userId}`);

    if (!response.ok) {
      throw new ExternalServiceException(
        'UserService',
        `/api/users/${userId}`,
        {
          retryable: true,
          details: { statusCode: response.status },
        }
      );
    }

    return response.json();
  } catch (error) {
    throw new ExternalServiceException('UserService', `/api/users/${userId}`, {
      retryable: true,
      cause: error,
    });
  }
};

// Use with retry logic
const userData = await retryWithBackoff(() => fetchUserData('123'));
```

### Request Tracking

```typescript
import { generateRequestId, formatErrorForLogging } from 'nodefling';

// Generate unique request ID
const requestId = generateRequestId(); // "1703123456789-abc123def"

// Format error for logging
const logMessage = formatErrorForLogging(error, {
  userId: 'user-123',
  action: 'create_order',
});
```

## Framework Support

### Express.js

```typescript
import express from 'express';
import {
  errorHandler,
  requestIdMiddleware,
  asyncErrorHandler,
} from 'nodefling';

const app = express();

app.use(requestIdMiddleware);
app.use(asyncErrorHandler);

app.use(errorHandler);
```

### Fastify

```typescript
import fastify from 'fastify';
import { errorHandler } from 'nodefling';

const app = fastify();

app.setErrorHandler((error, request, reply) => {
  const { statusCode, response } = errorHandler(error, request, reply);
  reply.status(statusCode).send(response);
});
```

### Koa

```typescript
import Koa from 'koa';
import { errorHandler } from 'nodefling';

const app = new Koa();

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    const { statusCode, response } = errorHandler(
      error,
      ctx.request,
      ctx.response
    );
    ctx.status = statusCode;
    ctx.body = response;
  }
});
```

## Configuration Options

All exceptions accept an `ExceptionOptions` object:

```typescript
interface ExceptionOptions {
  message?: string; // Error message
  statusCode?: number; // HTTP status code
  code?: string; // Error code
  details?: Record<string, any>; // Additional details
  cause?: Error; // Original error
  timestamp?: Date; // Error timestamp
  requestId?: string; // Request ID for tracking
  userId?: string; // User ID for tracking
  context?: Record<string, any>; // Additional context
  isOperational?: boolean; // Whether error is operational
  retryable?: boolean; // Whether error is retryable
  logLevel?: 'error' | 'warn' | 'info' | 'debug'; // Log level
}
```

## Error Response Format

```json
{
  "error": {
    "name": "BadRequestException",
    "message": "Invalid email format",
    "code": "BAD_REQUEST",
    "statusCode": 400,
    "requestId": "req-123"
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- 🐛 Issues: [GitHub Issues](https://github.com/abhilashmadi/nodefling/issues)
- 📖 Documentation: [GitHub Wiki](https://github.com/abhilashmadi/nodefling/wiki)
