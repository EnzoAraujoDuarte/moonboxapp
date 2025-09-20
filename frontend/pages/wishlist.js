import { useEffect, useState } from 'react';
import { getOrCreateSessionId } from '../src/lib/session';

export default function WishlistPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [items, setItems] = useState([]);
  const [shopDomain, setShopDomain] = useState('');

  useEffect(() => {
    // Detect shop from URL param or prompt (for demo)
    const params = new URLSearchParams(window.location.search);
    const sd = params.get('shop');
    if (sd) setShopDomain(sd);
  }, []);

  useEffect(() => {
    async function load() {
      const sessionId = getOrCreateSessionId();
      const params = new URLSearchParams({ session_id: sessionId, shop_domain: shopDomain });
      const res = await fetch(`${backendUrl}/api/wishlist?${params.toString()}`, {
        headers: { 'x-shopify-shop-domain': shopDomain },
      });
      const data = await res.json();
      setItems(data.items || []);
    }
    if (backendUrl && shopDomain) load();
  }, [backendUrl, shopDomain]);

  async function remove(itemId) {
    await fetch(`${backendUrl}/api/wishlist/${itemId}`, {
      method: 'DELETE',
      headers: { 'x-shopify-shop-domain': shopDomain },
    });
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Minha Lista de Desejos</h1>
      {!shopDomain && <p className="mt-2 text-yellow-700">Adicione ?shop=LOJA.myshopify.com à URL</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {items.map((item) => (
          <div key={item.id} className="border rounded p-4">
            <div className="font-medium">Produto: {item.product_id}</div>
            {item.variant_id && <div>Variação: {item.variant_id}</div>}
            <button className="mt-3 text-red-600 underline" onClick={() => remove(item.id)}>
              Remover
            </button>
          </div>
        ))}
        {items.length === 0 && <p>Nenhum item na lista.</p>}
      </div>
    </div>
  );
}


