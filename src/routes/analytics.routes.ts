import { Router } from 'express';
import {
  getAnalytics,
  getProgress,
  getStats,
} from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { apiLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// All analytics routes require authentication and rate limiting
router.use(apiLimiter);
router.use(authMiddleware);

router.get('/', getAnalytics);
router.get('/progress', getProgress);
router.get('/stats', getStats);

export default router;
