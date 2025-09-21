import { useEffect, useState } from 'react';
import { getOrCreateSessionId } from '../src/lib/session';

export default function WishlistPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [items, setItems] = useState([]);
  const [shopDomain, setShopDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Detect shop from URL param (ex.: /wishlist?shop=LOJA.myshopify.com)
    const params = new URLSearchParams(window.location.search);
    const sd = params.get('shop');
    if (sd) setShopDomain(sd);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const sessionId = getOrCreateSessionId();
        const params = new URLSearchParams({ session_id: sessionId, shop_domain: shopDomain });
        const res = await fetch(`${backendUrl}/api/wishlist?${params.toString()}`, {
          headers: { 'x-shopify-shop-domain': shopDomain, ...(sessionId ? { 'x-session-id': sessionId } : {}) },
        });
        if (!res.ok) throw new Error('Falha ao carregar lista');
        const data = await res.json();
        setItems(data.items || []);
      } catch (e) {
        setError('Não foi possível carregar sua lista agora. Tente novamente.');
        // eslint-disable-next-line no-console
        console.error('Wishlist load page error:', e);
      } finally {
        setLoading(false);
      }
    }
    if (backendUrl && shopDomain) load();
  }, [backendUrl, shopDomain]);

  async function handleRemove(itemId) {
    if (!backendUrl || !shopDomain) return;
    try {
      setLoading(true);
      setError('');
      const sessionId = getOrCreateSessionId();
      const res = await fetch(`${backendUrl}/api/wishlist/${itemId}`, {
        method: 'DELETE',
        headers: { 'x-shopify-shop-domain': shopDomain, ...(sessionId ? { 'x-session-id': sessionId } : {}) },
      });
      if (!res.ok) throw new Error('Falha ao remover item');
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (e) {
      setError('Não foi possível remover o item. Tente novamente.');
      // eslint-disable-next-line no-console
      console.error('Wishlist remove page error:', e);
    } finally {
      setLoading(false);
    }
  }

  if (!shopDomain) return <div className="p-6">Informe ?shop=SEU_DOMINIO.myshopify.com na URL para visualizar a lista.</div>;
  if (loading) return <div className="p-6">Carregando...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Minha Lista de Desejos</h1>
      {items.length === 0 ? (
        <p>Sua lista está vazia.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <li key={item.id} className="border rounded p-4">
              <div className="flex items-center gap-4">
                {item.product_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.product_image_url} alt={item.product_title || ''} className="w-16 h-16 object-cover rounded" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{item.product_title || `Produto ${item.product_id}`}</div>
                  {item.product_price && <div className="text-sm text-gray-600">{item.product_price}</div>}
                </div>
                <button
                  className="text-red-600 text-sm hover:underline"
                  onClick={() => handleRemove(item.id)}
                  aria-label="Remover da lista de desejos"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


