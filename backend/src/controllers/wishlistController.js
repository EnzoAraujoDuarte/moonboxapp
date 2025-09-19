const { supabase } = require('../db/supabaseClient');

function getSessionId(req) {
  const header = req.headers['x-session-id'];
  if (header) return header;
  const cookie = (req.headers.cookie || '').split(';').find((c) => c.trim().startsWith('mb_session='));
  return cookie ? cookie.split('=')[1] : null;
}

async function addItem(req, res) {
  try {
    const { product_id, variant_id, customer_id } = req.body;
    const shop_domain = req.shopDomain || req.body.shop_domain;
    if (!product_id || !shop_domain) return res.status(400).json({ error: 'Missing fields' });
    const session_id = customer_id ? null : getSessionId(req) || req.body.session_id;
    const payload = {
      customer_id: customer_id || session_id,
      shop_domain,
      product_id: String(product_id),
      variant_id: variant_id ? String(variant_id) : null,
    };
    const { data, error } = await supabase.from('wishlist_items').insert(payload).select('*').single();
    if (error) throw error;
    return res.json({ ok: true, item: data });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add item' });
  }
}

async function removeItem(req, res) {
  try {
    const { itemId } = req.params;
    const { error } = await supabase.from('wishlist_items').delete().eq('id', itemId);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove item' });
  }
}

async function getWishlist(req, res) {
  try {
    const { customer_id } = req.query;
    const shop_domain = req.shopDomain || req.query.shop_domain;
    const session_id = customer_id ? null : getSessionId(req) || req.query.session_id;
    const owner = customer_id || session_id;
    if (!owner || !shop_domain) return res.status(400).json({ error: 'Missing owner or shop' });
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('customer_id', owner)
      .eq('shop_domain', shop_domain)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ ok: true, items: data });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
}

module.exports = { addItem, removeItem, getWishlist };


