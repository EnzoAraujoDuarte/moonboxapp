import 'dotenv/config';
import '@shopify/shopify-api/adapters/node';
import express from 'express';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import { supabase } from '../db/supabaseClient.js';

const router = express.Router();

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SHOPIFY_API_SCOPES = (process.env.SHOPIFY_API_SCOPES || '').split(',').map((s) => s.trim());
const HOST = process.env.HOST;
const SHOPIFY_ENABLED = Boolean(SHOPIFY_API_KEY && SHOPIFY_API_SECRET && HOST);

let shopify;
if (SHOPIFY_ENABLED) {
  shopify = shopifyApi({
    apiKey: SHOPIFY_API_KEY,
    apiSecretKey: SHOPIFY_API_SECRET,
    scopes: SHOPIFY_API_SCOPES,
    hostScheme: HOST.startsWith('https') ? 'https' : 'http',
    hostName: HOST.replace(/^https?:\/\//, ''),
    apiVersion: LATEST_API_VERSION,
    isEmbeddedApp: true,
  });
}

// Persist shop access token na tabela shops
async function persistShop(session) {
  const shop_domain = session.shop;
  const access_token = session.accessToken;
  const payload = { shop_domain, access_token, is_active: true };
  const { error } = await supabase.from('shops').upsert(payload, { onConflict: 'shop_domain' });
  if (error) throw error;
}

async function deleteSessionById(id) {
  await supabase.from('shopify_sessions').delete().eq('id', id);
}

// /auth entrypoint
router.get('/auth', async (req, res) => {
  if (!SHOPIFY_ENABLED) return res.status(503).send('Shopify OAuth not configured');
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
  if (!SHOPIFY_ENABLED) return res.status(503).send('Shopify OAuth not configured');
  try {
    const { session, cookies } = await shopify.auth.callback({ req, res });
    await persistShop(session);

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
  if (!SHOPIFY_ENABLED) return res.sendStatus(503);
  try {
    const verified = await shopify.webhooks.validate({ rawBody: req.body, rawRequest: req, rawResponse: res });
    if (!verified) return res.sendStatus(401);
    const topic = req.headers['x-shopify-topic'];
    if (topic === 'app/uninstalled') {
      const shop = req.headers['x-shopify-shop-domain'];
      await supabase.from('shops').update({ is_active: false, access_token: null }).eq('shop_domain', shop);
    }
    res.sendStatus(200);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Webhook error', err);
    res.sendStatus(500);
  }
});

export { shopify, router };


