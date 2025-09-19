const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
app.use(express.json());
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


