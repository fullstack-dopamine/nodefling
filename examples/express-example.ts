import express from 'express';
import {
  // Exceptions
  BadRequestException,
  NotFoundException,
  ValidationException,
  ResourceNotFoundException,
  DuplicateResourceException,
  RateLimitExceededException,

  // Status codes
  StatusCodes,

  // Utilities
  validateRequiredFields,
  validateEmail,
  generateRequestId,

  // Middleware
  errorHandler,
  requestIdMiddleware,
  asyncErrorHandler,
  requestLoggerMiddleware,
  securityHeadersMiddleware
} from 'nodefling';

const app = express();
const PORT = process.env.PORT || 3000;

// Mock database
const users = new Map<string, any>();

// Middleware
app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);
app.use(securityHeadersMiddleware);

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
});

// Get user by ID
app.get('/users/:id', asyncErrorHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestException({
      message: 'User ID is required',
      details: { providedId: id }
    });
  }

  const user = users.get(id);

  if (!user) {
    throw new ResourceNotFoundException('User', id, {
      requestId: req.requestId
    });
  }

  res.json({
    user,
    requestId: req.requestId
  });
}));

// Create user
app.post('/users', asyncErrorHandler(async (req, res) => {
  const { name, email, age } = req.body;

  // Validate required fields
  try {
    validateRequiredFields(req.body, ['name', 'email', 'age']);
  } catch (error) {
    throw new ValidationException({
      message: 'Missing required fields',
      details: { missingFields: ['name', 'email', 'age'].filter(field => !req.body[field]) }
    });
  }

  // Validate email format
  if (!validateEmail(email)) {
    throw new ValidationException({
      message: 'Invalid email format',
      details: { email, validFormat: 'user@example.com' }
    });
  }

  // Validate age
  if (age < 0 || age > 150) {
    throw new ValidationException({
      message: 'Age must be between 0 and 150',
      details: { age, minAge: 0, maxAge: 150 }
    });
  }

  // Check for duplicate email
  const existingUser = Array.from(users.values()).find(u => u.email === email);
  if (existingUser) {
    throw new DuplicateResourceException('User', 'email', email, {
      requestId: req.requestId
    });
  }

  // Create user
  const userId = generateRequestId();
  const user = {
    id: userId,
    name,
    email,
    age,
    createdAt: new Date().toISOString()
  };

  users.set(userId, user);

  res.status(StatusCodes.CREATED).json({
    user,
    requestId: req.requestId
  });
}));

// Update user
app.put('/users/:id', asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, age } = req.body;

  const user = users.get(id);
  if (!user) {
    throw new ResourceNotFoundException('User', id, {
      requestId: req.requestId
    });
  }

  // Validate email if provided
  if (email && !validateEmail(email)) {
    throw new ValidationException({
      message: 'Invalid email format',
      details: { email }
    });
  }

  // Check for duplicate email (excluding current user)
  if (email && email !== user.email) {
    const existingUser = Array.from(users.values()).find(u => u.email === email && u.id !== id);
    if (existingUser) {
      throw new DuplicateResourceException('User', 'email', email, {
        requestId: req.requestId
      });
    }
  }

  // Update user
  const updatedUser = {
    ...user,
    ...(name && { name }),
    ...(email && { email }),
    ...(age && { age }),
    updatedAt: new Date().toISOString()
  };

  users.set(id, updatedUser);

  res.json({
    user: updatedUser,
    requestId: req.requestId
  });
}));

// Delete user
app.delete('/users/:id', asyncErrorHandler(async (req, res) => {
  const { id } = req.params;

  const user = users.get(id);
  if (!user) {
    throw new ResourceNotFoundException('User', id, {
      requestId: req.requestId
    });
  }

  users.delete(id);

  res.status(StatusCodes.NO_CONTENT).send();
}));

// Rate limited endpoint (simulation)
app.get('/api/limited', asyncErrorHandler(async (req, res) => {
  // Simulate rate limiting
  const requestCount = Math.floor(Math.random() * 10);

  if (requestCount > 5) {
    throw new RateLimitExceededException(5, 'minute', {
      requestId: req.requestId,
      details: { currentRequests: requestCount, limit: 5 }
    });
  }

  res.json({
    message: 'Rate limited endpoint accessed successfully',
    requestId: req.requestId,
    requestCount
  });
}));

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/health`);
});

export default app; 