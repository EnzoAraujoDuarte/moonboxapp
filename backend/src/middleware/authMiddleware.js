const { supabase } = require('../db/supabaseClient');

async function authMiddleware(req, res, next) {
  try {
    const shop = req.headers['x-shopify-shop-domain'] || req.query.shop;
    if (!shop) return res.status(401).json({ error: 'Missing shop' });
    const { data, error } = await supabase
      .from('shopify_sessions')
      .select('access_token')
      .eq('shop', shop)
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

module.exports = { authMiddleware };


