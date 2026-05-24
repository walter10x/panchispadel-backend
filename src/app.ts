import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env';

const app = express();

// Security & parsing middleware
app.use(helmet());
if (env.NODE_ENV === 'production') {
  app.use(cors({ origin: env.CORS_ORIGIN }));
} else {
  app.use(cors({ origin: true, credentials: true }));
}
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check (before routes)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes are registered in registerRoutes() after DB init
// Error handler is registered LAST in registerRoutes()

export { app };
