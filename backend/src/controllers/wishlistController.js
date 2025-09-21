import { supabase } from '../db/supabaseClient.js';

function getSessionId(req) {
  const header = req.headers['x-session-id'];
  if (header) return header;
  const cookie = (req.headers.cookie || '').split(';').find((c) => c.trim().startsWith('mb_session='));
  return cookie ? cookie.split('=')[1] : null;
}

function getOwner({ customer_id, req }) {
  if (customer_id) return { type: 'customer', value: String(customer_id) };
  const sid = getSessionId(req) || req.body?.session_id || req.query?.session_id;
  return sid ? { type: 'session', value: String(sid) } : null;
}

async function addItem(req, res) {
  try {
    const { product_id, variant_id, customer_id, product_title, product_price, product_image_url } = req.body;
    const shop_domain = req.shopDomain || req.body.shop_domain;
    if (!product_id || !shop_domain) {
      return res.status(400).json({ ok: false, error: 'Missing fields', fields: { product_id: !!product_id, shop_domain: !!shop_domain } });
    }
    const owner = getOwner({ customer_id, req });
    if (!owner) return res.status(400).json({ ok: false, error: 'Missing owner (customer or session)' });

    const payload = {
      customer_id: owner.type === 'customer' ? owner.value : null,
      session_id: owner.type === 'session' ? owner.value : null,
      shop_domain,
      product_id: String(product_id),
      variant_id: variant_id ? String(variant_id) : null,
      product_title: product_title || null,
      product_price: product_price || null,
      product_image_url: product_image_url || null,
    };

    // Prevent duplicates for same owner/shop/product/variant
    const query = supabase
      .from('wishlist_items')
      .select('id')
      .eq('shop_domain', shop_domain)
      .eq('product_id', payload.product_id)
      .eq('variant_id', payload.variant_id);
    if (owner.type === 'customer') query.eq('customer_id', owner.value);
    else query.eq('session_id', owner.value);

    const { data: existing, error: findErr } = await query.limit(1).maybeSingle();
    if (findErr) throw findErr;
    if (existing) {
      return res.status(200).json({ ok: true, duplicated: true, item_id: existing.id });
    }

    const { data, error } = await supabase.from('wishlist_items').insert(payload).select('*').single();
    if (error) throw error;
    return res.json({ ok: true, item: data });
  } catch (err) {
    const detail = process.env.NODE_ENV !== 'production' ? String(err?.message || err) : undefined;
    return res.status(500).json({ ok: false, error: 'Failed to add item', detail });
  }
}

async function removeItem(req, res) {
  try {
    const { itemId } = req.params;
    const shop_domain = req.shopDomain;
    if (!itemId) return res.status(400).json({ ok: false, error: 'Missing itemId' });
    // ensure item belongs to shop
    const { data: item, error: getErr } = await supabase.from('wishlist_items').select('id, shop_domain').eq('id', itemId).maybeSingle();
    if (getErr) throw getErr;
    if (!item) return res.status(404).json({ ok: false, error: 'Item not found' });
    if (shop_domain && item.shop_domain !== shop_domain) return res.status(403).json({ ok: false, error: 'Forbidden for this shop' });

    const { error } = await supabase.from('wishlist_items').delete().eq('id', itemId);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (err) {
    const detail = process.env.NODE_ENV !== 'production' ? String(err?.message || err) : undefined;
    return res.status(500).json({ ok: false, error: 'Failed to remove item', detail });
  }
}

async function getWishlist(req, res) {
  try {
    const { customer_id } = req.query;
    const shop_domain = req.shopDomain || req.query.shop_domain;
    const owner = getOwner({ customer_id, req });
    if (!owner || !shop_domain) return res.status(400).json({ ok: false, error: 'Missing owner or shop' });

    let query = supabase.from('wishlist_items').select('*').eq('shop_domain', shop_domain);
    if (owner.type === 'customer') query = query.eq('customer_id', owner.value);
    else query = query.eq('session_id', owner.value);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ ok: true, items: data });
  } catch (err) {
    const detail = process.env.NODE_ENV !== 'production' ? String(err?.message || err) : undefined;
    return res.status(500).json({ ok: false, error: 'Failed to fetch wishlist', detail });
  }
}

export { addItem, removeItem, getWishlist };


