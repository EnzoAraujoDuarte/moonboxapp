import { useEffect, useState } from 'react';
import { getOrCreateSessionId } from '../lib/session';

export default function WishlistButton({ productId, variantId, shopDomain, customerId }) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    async function load() {
      try {
        const sessionId = customerId ? undefined : getOrCreateSessionId();
        const params = new URLSearchParams();
        if (customerId) params.set('customer_id', customerId);
        if (sessionId) params.set('session_id', sessionId);
        params.set('shop_domain', shopDomain);
        const res = await fetch(`${backendUrl}/api/wishlist?${params.toString()}`, {
          headers: { 'x-shopify-shop-domain': shopDomain },
        });
        const data = await res.json();
        const exists = (data.items || []).some((i) => String(i.product_id) === String(productId) && (!variantId || String(i.variant_id) === String(variantId)));
        setInWishlist(exists);
      } catch (_) {}
    }
    if (backendUrl && productId && shopDomain) load();
  }, [backendUrl, productId, variantId, shopDomain, customerId]);

  async function toggle() {
    if (!backendUrl) return;
    setLoading(true);
    try {
      if (inWishlist) {
        // Fetch current list to find item id, then delete
        const sessionId = customerId ? undefined : getOrCreateSessionId();
        const params = new URLSearchParams();
        if (customerId) params.set('customer_id', customerId);
        if (sessionId) params.set('session_id', sessionId);
        params.set('shop_domain', shopDomain);
        const listRes = await fetch(`${backendUrl}/api/wishlist?${params.toString()}`, {
          headers: { 'x-shopify-shop-domain': shopDomain },
        });
        const list = await listRes.json();
        const item = (list.items || []).find((i) => String(i.product_id) === String(productId) && (!variantId || String(i.variant_id) === String(variantId)));
        if (item) {
          await fetch(`${backendUrl}/api/wishlist/${item.id}`, {
            method: 'DELETE',
            headers: { 'x-shopify-shop-domain': shopDomain },
          });
        }
        setInWishlist(false);
      } else {
        const body = {
          product_id: productId,
          variant_id: variantId,
          shop_domain: shopDomain,
          customer_id: customerId || undefined,
          session_id: customerId ? undefined : getOrCreateSessionId(),
        };
        await fetch(`${backendUrl}/api/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-shopify-shop-domain': shopDomain,
          },
          body: JSON.stringify(body),
        });
        setInWishlist(true);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded border ${inWishlist ? 'bg-red-500 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300'}`}
    >
      {inWishlist ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
    </button>
  );
}


