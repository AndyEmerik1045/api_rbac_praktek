import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './interfaces/routes/auth.routes';

import { authMiddleware } from './interfaces/middlewares/auth.middleware';
import { rbac } from './interfaces/middlewares/rbac.middleware';

const app = express();

// 🔐 Security middleware
app.use(helmet());

// 📦 Body parser
app.use(express.json());

// 📜 Logger
app.use(morgan('dev'));

// 🚫 Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// 🟢 Root endpoint (health check)
app.get('/', (req, res) => {
  const data = {
    status: 'success',
    service: 'RBAC API',
    message: 'Service is running 🚀',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  // 🔥 Kalau browser (HTML)
  if (req.headers.accept?.includes('text/html')) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>RBAC API</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .card {
            background: #1e293b;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            width: 400px;
          }
          h1 {
            margin-top: 0;
            color: #38bdf8;
          }
          .item {
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
          }
          .label {
            font-weight: bold;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🚀 RBAC API</h1>
          <div class="item"><span class="label">Status</span> <span>${data.status}</span></div>
          <div class="item"><span class="label">Service</span> <span>${data.service}</span></div>
          <div class="item"><span class="label">Version</span> <span>${data.version}</span></div>
          <div class="item"><span class="label">Uptime</span> <span>${data.uptime.toFixed(2)}s</span></div>
          <div class="item"><span class="label">Time</span> <span>${data.timestamp}</span></div>
        </div>
      </body>
      </html>
    `);
  }

  // 🔥 Default: JSON (Postman / API client)
  return res.json(data);
});

// 🔑 Routes
app.use('/api/auth', authRoutes);

// =====================
// 🔥 TEST AUTH MIDDLEWARE
// =====================
app.get('/api/test', authMiddleware, (req, res) => {
  res.json({
    message: 'Auth success',
    user: req.user,
  });
});

// =====================
// 🔥 TEST RBAC
// =====================
app.get(
  '/api/admin',
  authMiddleware,
  rbac('ADMIN'),
  (req, res) => {
    res.json({
      message: 'Welcome Admin',
    });
  }
);


// ❌ 404 handler (HARUS PALING BAWAH)
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

console.log('🔥 APP TS KELOAD');
export default app;