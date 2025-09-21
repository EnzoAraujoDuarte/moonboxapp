import { supabase } from '../db/supabaseClient.js';

async function authMiddleware(req, res, next) {
  try {
    const shop = req.headers['x-shopify-shop-domain'] || req.query.shop;
    if (!shop) return res.status(401).json({ error: 'Missing shop' });
    const { data, error } = await supabase
      .from('shops')
      .select('access_token')
      .eq('shop_domain', shop)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(401).json({ error: 'Not authenticated' });
    req.shopifyAccessToken = data.access_token;
    req.shopDomain = shop;
    return next();
  } catch (err) {
    return res.status(500).json({ error: 'Auth check failed' });
  }
}

export { authMiddleware };


