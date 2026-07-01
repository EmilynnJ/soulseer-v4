import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { authRouter } from './routes/auth';
import { readersRouter } from './routes/readers';
import { readingsRouter } from './routes/readings';
import { paymentsRouter } from './routes/payments';
import { forumRouter } from './routes/forum';
import { adminRouter } from './routes/admin';
import { userRouter } from './routes/user';
import { webhooksRouter } from './routes/webhooks';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Logging
app.use(pinoHttp());

// Stripe webhook needs raw body - must be before express.json()
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Stricter limits for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});
app.use('/api/auth', authLimiter);

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
});
app.use('/api/payments', paymentLimiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/readers', readersRouter);
app.use('/api/readings', readingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/forum', forumRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/webhooks', webhooksRouter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`SoulSeer server running on port ${PORT}`);
});

export default app;
