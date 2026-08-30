import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.',
  },
});

export const aiStreamLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30, // 30 AI generations / min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'AI query rate limit exceeded. Please wait a moment before sending more queries.',
  },
});
