const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
app.use(express.json());
// Basic CORS for frontend
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_URL);
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-shopify-shop-domain, x-session-id');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(cookieParser());

// Routes
const { router: shopifyAuthRouter } = require('./auth/shopifyAuth');
const wishlistRoutes = require('./routes/wishlistRoutes');

const PORT = process.env.PORT || 8081;

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'moonbox-backend' });
});

app.use('/', shopifyAuthRouter);
app.use('/api', wishlistRoutes);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${PORT}`);
});


