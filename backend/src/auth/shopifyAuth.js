const express = require('express');
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { supabase } = require('../db/supabaseClient');

const router = express.Router();

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SHOPIFY_API_SCOPES = (process.env.SHOPIFY_API_SCOPES || '').split(',').map((s) => s.trim());
const HOST = process.env.HOST;

if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET || !HOST) {
  throw new Error('Missing Shopify env vars (SHOPIFY_API_KEY, SHOPIFY_API_SECRET, HOST)');
}

const shopify = shopifyApi({
  apiKey: SHOPIFY_API_KEY,
  apiSecretKey: SHOPIFY_API_SECRET,
  scopes: SHOPIFY_API_SCOPES,
  hostScheme: HOST.startsWith('https') ? 'https' : 'http',
  hostName: HOST.replace(/^https?:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
});

// Util: persist session in Supabase
async function persistSession(session) {
  const payload = {
    id: session.id,
    shop: session.shop,
    state: session.state,
    is_online: session.isOnline,
    scope: session.scope,
    access_token: session.accessToken,
    expires_at: session.expires ? new Date(session.expires).toISOString() : null,
    user_id: session?.onlineAccessInfo?.associated_user?.id || null,
    user_token: session?.onlineAccessInfo ? JSON.stringify(session.onlineAccessInfo) : null,
  };
  const { error } = await supabase.from('shopify_sessions').upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}

async function deleteSessionById(id) {
  await supabase.from('shopify_sessions').delete().eq('id', id);
}

// /auth entrypoint
router.get('/auth', async (req, res) => {
  try {
    const shop = req.query.shop;
    if (!shop) return res.status(400).send('Missing shop');

    const authRoute = await shopify.auth.begin({
      shop,
      callbackPath: '/auth/callback',
      isOnline: false,
      req,
      res,
    });
    return res.redirect(authRoute);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Auth error', err);
    res.status(500).send('Auth error');
  }
});

// /auth/callback
router.get('/auth/callback', async (req, res) => {
  try {
    const { session, cookies } = await shopify.auth.callback({ req, res });
    await persistSession(session);

    // Set the online/offline cookies returned by Shopify SDK
    cookies.forEach((cookie) => res.cookie(cookie.name, cookie.value, cookie.options));

    const host = req.query.host;
    // Redirect back to embedded admin app (merchant UI)
    const redirectUrl = `https://admin.shopify.com/store/${session.shop.replace('.myshopify.com', '')}/apps/${SHOPIFY_API_KEY}`;
    return res.redirect(host ? `${redirectUrl}?host=${host}` : redirectUrl);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Callback error', err);
    res.status(500).send('Callback error');
  }
});

// Optional: uninstall webhook handler cleanup
router.post('/webhooks/app_uninstalled', express.text({ type: '*/*' }), async (req, res) => {
  try {
    const verified = await shopify.webhooks.validate({ rawBody: req.body, rawRequest: req, rawResponse: res });
    if (!verified) return res.sendStatus(401);
    const topic = req.headers['x-shopify-topic'];
    if (topic === 'app/uninstalled') {
      const shop = req.headers['x-shopify-shop-domain'];
      await supabase.from('shopify_sessions').delete().eq('shop', shop);
    }
    res.sendStatus(200);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Webhook error', err);
    res.sendStatus(500);
  }
});

module.exports = { shopify, router: router };


