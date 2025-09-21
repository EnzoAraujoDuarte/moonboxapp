import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(express.json());
// Basic CORS for frontend com origem dinâmica
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  let allowOrigin = FRONTEND_URL;
  if (origin) {
    try {
      const hostname = new URL(origin).hostname;
      const isLocal = origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000';
      const isShopify = /^([a-z0-9-]+\.)*myshopify\.com$/i.test(hostname) || hostname === 'admin.shopify.com';
      const isNgrok = /\.ngrok(-free)?\.app$/i.test(hostname);
      const isCloudflare = /\.trycloudflare\.com$/i.test(hostname);
      const isExplicit = ALLOWED_ORIGINS.includes(origin);
      if (isLocal || isShopify || isNgrok || isCloudflare || isExplicit) {
        allowOrigin = origin;
      }
    } catch (_e) {
      // keep default FRONTEND_URL
    }
  }
  res.header('Access-Control-Allow-Origin', allowOrigin);
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-shopify-shop-domain, x-session-id');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(cookieParser());

// Routes
import { router as shopifyAuthRouter } from './auth/shopifyAuth.js';
import { router as directInstallRouter } from './auth/directInstall.js';
import wishlistRoutes from './routes/wishlistRoutes.js';

const PORT = process.env.PORT || 8081;

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'moonbox-backend' });
});

app.use('/', shopifyAuthRouter);
app.use('/', directInstallRouter);
app.use('/api', wishlistRoutes);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${PORT}`);
});


