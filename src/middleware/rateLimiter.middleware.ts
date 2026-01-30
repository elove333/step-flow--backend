import rateLimit from 'express-rate-limit';

// NOTE: Rate limiters use in-memory storage by default.
// For production with multiple instances or auto-scaling, consider using
// a shared store like Redis with express-rate-limit's store option.
// Also configure trustProxy in Express if behind a reverse proxy.

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/register requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts for brute force protection
});

// Rate limiter for session creation
export const sessionCreationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 session creations per minute
  message: 'Too many session submissions, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});
