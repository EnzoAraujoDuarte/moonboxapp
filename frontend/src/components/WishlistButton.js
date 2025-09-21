import { useEffect, useState } from 'react';
import { getOrCreateSessionId } from '../lib/session';

export default function WishlistButton({ 
  productId, 
  variantId, 
  shopDomain, 
  customerId,
  productTitle,
  productPrice,
  productImage,
  size = 'medium',
  variant = 'default',
  backendUrl: backendUrlProp,
}) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = backendUrlProp || process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const sessionId = customerId ? undefined : getOrCreateSessionId();
        const params = new URLSearchParams();
        if (customerId) params.set('customer_id', customerId);
        if (sessionId) params.set('session_id', sessionId);
        params.set('shop_domain', shopDomain);
        
        const res = await fetch(`${backendUrl}/api/wishlist?${params.toString()}`, {
          headers: { 
            'x-shopify-shop-domain': shopDomain,
            ...(sessionId ? { 'x-session-id': sessionId } : {}),
          },
        });
        
        if (!res.ok) throw new Error('Falha ao carregar wishlist');
        
        const data = await res.json();
        const exists = (data.items || []).some((i) => 
          String(i.product_id) === String(productId) && 
          (!variantId || String(i.variant_id) === String(variantId))
        );
        setInWishlist(exists);
      } catch (err) {
        setError('Erro ao carregar estado da wishlist');
        console.error('Wishlist load error:', err);
      } finally {
        setInitialLoading(false);
      }
    }

    if (backendUrl && productId && shopDomain) {
      load();
    } else {
      setInitialLoading(false);
    }
  }, [backendUrl, productId, variantId, shopDomain, customerId]);

  async function toggle() {
    if (!backendUrl || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (inWishlist) {
        // Remove from wishlist
        const sessionId = customerId ? undefined : getOrCreateSessionId();
        const params = new URLSearchParams();
        if (customerId) params.set('customer_id', customerId);
        if (sessionId) params.set('session_id', sessionId);
        params.set('shop_domain', shopDomain);
        
        const listRes = await fetch(`${backendUrl}/api/wishlist?${params.toString()}`, {
          headers: { 
            'x-shopify-shop-domain': shopDomain,
            ...(sessionId ? { 'x-session-id': sessionId } : {}),
          },
        });
        
        if (!listRes.ok) throw new Error('Falha ao buscar wishlist');
        
        const list = await listRes.json();
        const item = (list.items || []).find((i) => 
          String(i.product_id) === String(productId) && 
          (!variantId || String(i.variant_id) === String(variantId))
        );
        
        if (item) {
          const deleteRes = await fetch(`${backendUrl}/api/wishlist/${item.id}`, {
            method: 'DELETE',
            headers: { 
              'x-shopify-shop-domain': shopDomain,
              ...(sessionId ? { 'x-session-id': sessionId } : {}),
            },
          });
          
          if (!deleteRes.ok) throw new Error('Falha ao remover item');
        }
        
        setInWishlist(false);
      } else {
        // Add to wishlist
        const sessionId = customerId ? undefined : getOrCreateSessionId();
        const body = {
          product_id: productId,
          variant_id: variantId,
          shop_domain: shopDomain,
          customer_id: customerId || undefined,
          session_id: customerId ? undefined : sessionId,
          product_title: productTitle,
          product_price: productPrice,
          product_image_url: productImage,
        };
        
        const res = await fetch(`${backendUrl}/api/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-shopify-shop-domain': shopDomain,
            ...(sessionId ? { 'x-session-id': sessionId } : {}),
          },
          body: JSON.stringify(body),
        });
        
        if (!res.ok) throw new Error('Falha ao adicionar item');
        
        setInWishlist(true);
      }
    } catch (err) {
      setError(inWishlist ? 'Erro ao remover dos favoritos' : 'Erro ao adicionar aos favoritos');
      console.error('Wishlist toggle error:', err);
    } finally {
      setLoading(false);
    }
  }

  const baseStyle = {
    medium: 'px-4 py-2 text-sm',
    large: 'px-5 py-3 text-base',
  }[size] || 'px-4 py-2 text-sm';

  const className = `inline-flex items-center justify-center rounded-md ${baseStyle} font-medium transition-colors ${inWishlist ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-rose-500 text-white hover:bg-rose-600'}`;

  return (
    <button onClick={toggle} disabled={loading || initialLoading} className={className} aria-pressed={inWishlist}>
      {initialLoading ? 'Carregando...' : loading ? (inWishlist ? 'Removendo...' : 'Adicionando...') : inWishlist ? 'Remover dos favoritos' : 'Adicionar à lista de desejos'}
      {error && <span className="ml-2 text-xs opacity-80">{error}</span>}
    </button>
  );
}


