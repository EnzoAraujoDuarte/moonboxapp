## Moonbox – Shopify Wishlist/Buy Later App (Monorepo)

Stack: JavaScript, Next.js (React), Tailwind CSS, Express.js (Node), Supabase (PostgreSQL/Auth), Shopify App Bridge, Polaris.

### Estrutura
- `backend`: API Express com OAuth do Shopify, sessões no Supabase e rotas de wishlist.
- `frontend`: Next.js (Pages Router) com App Bridge/Polaris (Admin UI) e páginas de storefront.

### Variáveis de ambiente
- `backend/.env`
```
PORT=8081
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=... 
SUPABASE_SERVICE_ROLE_KEY=...
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...
SHOPIFY_API_SCOPES=read_products,write_products,read_customers
HOST=http://localhost:8081
```
- `frontend/.env.local`
```
NEXT_PUBLIC_SHOPIFY_API_KEY=...
NEXT_PUBLIC_BACKEND_URL=http://localhost:8081
```

### Scripts raiz
```
npm run dev        # inicia backend e frontend
npm run build      # build backend e frontend
npm run start      # start backend e frontend
```

### Backend (Express)
- `GET /` healthcheck
- OAuth Shopify: `GET /auth`, `GET /auth/callback` via `@shopify/shopify-api` (sessões persistidas em `shopify_sessions`).
- Wishlist API (protegida por middleware):
  - `POST /api/wishlist`
  - `DELETE /api/wishlist/:itemId`
  - `GET /api/wishlist`

### Frontend (Next.js)
- Admin UI: `pages/settings.js` (Polaris + App Bridge)
- Storefront:
  - `src/components/WishlistButton.js`
  - `pages/wishlist.js` (lista atual do cliente/sessão)

### Supabase (já criado)
- `shopify_sessions`: id, shop, state, is_online, scope, access_token, expires_at, user_id, user_token
- `wishlist_items`: id (uuid), customer_id, shop_domain, product_id, variant_id, created_at
  - Configure RLS apropriadamente (acesso por `customer_id` ou `shop_domain`).

### Fluxo local
1. Preencha `.env` e `.env.local`.
2. `npm i` na raiz (workspaces).
3. `npm run dev`.
4. Instale em uma loja de desenvolvimento: `http://localhost:8081/auth?shop=LOJA.myshopify.com`.
5. Admin UI: abre via admin embed com `host` retornado pelo OAuth.
6. Storefront wishlist: `http://localhost:3000/wishlist?shop=LOJA.myshopify.com`.

### Embed no tema (exemplo)
- Veja `frontend/lib/shopifyAppEmbed.js` (exemplo `mountWishlistButton`) para script customizado em App Block/Liquid.

### Deploy
- Frontend: Vercel (Next.js). Backend: Railway/Render/Fly.io. Informe `NEXT_PUBLIC_BACKEND_URL` com a URL pública do backend.

### Licença
MIT


