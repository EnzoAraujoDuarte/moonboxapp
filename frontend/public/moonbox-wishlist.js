// Moonbox Wishlist - Script para loja Shopify (público)
// Uso: <script src="/moonbox-wishlist.js" data-backend-url="https://SEU_BACKEND" data-shop-domain="sualoja.myshopify.com"></script>
// Opcional: data-target-selector para onde inserir o botão

(function () {
  'use strict';

  function getConfig() {
    const script = document.currentScript || document.querySelector('script[src*="moonbox-wishlist.js"]');
    const backendUrl = script?.dataset.backendUrl || window.MOONBOX_BACKEND_URL;
    const shopDomain = script?.dataset.shopDomain || window.Shopify?.shop || window.location.hostname;
    const targetSelector = script?.dataset.targetSelector || '.product-form__buttons, [data-product-form], .product__form';
    return { backendUrl, shopDomain, targetSelector };
  }

  function getOrCreateSessionId() {
    const KEY = 'mb_session_id';
    try {
      let sid = localStorage.getItem(KEY);
      if (!sid) {
        sid = 'mb_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem(KEY, sid);
      }
      return sid;
    } catch (_) {
      return null;
    }
  }

  async function api(method, path, { headers = {}, body } = {}) {
    const { backendUrl, shopDomain } = getConfig();
    const sessionId = getOrCreateSessionId();
    const url = `${backendUrl}${path}`;
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-shopify-shop-domain': shopDomain,
        ...(sessionId ? { 'x-session-id': sessionId } : {}),
        ...headers,
      },
      credentials: 'include',
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`Moonbox API error ${res.status}`);
    return res.json();
  }

  async function findExistingItem(productId, variantId) {
    const { backendUrl, shopDomain } = getConfig();
    const sessionId = getOrCreateSessionId();
    const params = new URLSearchParams({ session_id: sessionId, shop_domain: shopDomain });
    const res = await fetch(`${backendUrl}/api/wishlist?${params}`, {
      headers: {
        'x-shopify-shop-domain': shopDomain,
        'x-session-id': sessionId,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.items || []).find(
      (i) => String(i.product_id) === String(productId) && (!variantId || String(i.variant_id) === String(variantId)),
    );
  }

  function createStyles() {
    if (document.getElementById('moonbox-wishlist-styles')) return;
    const style = document.createElement('style');
    style.id = 'moonbox-wishlist-styles';
    style.textContent = `
      .moonbox-wishlist-btn{background:#ff6b6b;color:#fff;border:none;padding:12px 16px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:500;display:flex;align-items:center;gap:8px;transition:all .2s ease;margin:10px 0;width:100%;justify-content:center}
      .moonbox-wishlist-btn:hover{background:#ff5252;transform:translateY(-1px)}
      .moonbox-wishlist-btn.is-active{background:#16a34a}
    `;
    document.head.appendChild(style);
  }

  function createButton({ productId, variantId, productTitle, productPrice, productImage }) {
    const button = document.createElement('button');
    button.className = 'moonbox-wishlist-btn';
    button.type = 'button';
    button.innerHTML = `<span class="heart-icon">♡</span><span class="wishlist-text">Adicionar à Lista de Desejos</span>`;

    async function setStateActive(active) {
      button.classList.toggle('is-active', !!active);
      button.innerHTML = active
        ? `<span class="heart-icon">♥</span><span>Adicionado!</span>`
        : `<span class="heart-icon">♡</span><span>Adicionar à Lista de Desejos</span>`;
    }

    button.addEventListener('click', async () => {
      try {
        button.disabled = true;
        const existing = await findExistingItem(productId, variantId);
        if (existing) {
          // toggle remove
          await api('DELETE', `/api/wishlist/${existing.id}`);
          await setStateActive(false);
        } else {
          // add
          await api('POST', '/api/wishlist', {
            body: {
              product_id: productId,
              variant_id: variantId,
              product_title: productTitle,
              product_price: productPrice,
              product_image_url: productImage,
              shop_domain: getConfig().shopDomain,
            },
          });
          await setStateActive(true);
        }
      } catch (e) {
        console.error('Moonbox toggle error', e);
        button.textContent = 'Erro - tente novamente';
        setTimeout(() => setStateActive(false), 1500);
      } finally {
        button.disabled = false;
      }
    });

    return button;
  }

  function selectTarget(targetSelector) {
    const selectors = [targetSelector, '.product-form__buttons', '.product-form__cart', 'button[name="add"]:not([type])'];
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el) return el.closest('form') || el.parentElement || el;
    }
    return null;
  }

  function addButton() {
    const { targetSelector } = getConfig();
    const target = selectTarget(targetSelector);
    if (!target || document.querySelector('.moonbox-wishlist-btn')) return;

    const productId = window.ShopifyAnalytics?.meta?.product?.id ||
      document.querySelector('[data-product-id]')?.dataset?.productId ||
      window.meta?.product?.id;
    const variantId = window.ShopifyAnalytics?.meta?.selectedVariant?.id || document.querySelector('[name="id"]')?.value;
    const productTitle = document.querySelector('.product__title, h1')?.textContent?.trim();
    const productPrice = document.querySelector('.price .money, .price, [data-product-price]')?.textContent?.trim();
    const productImage = document.querySelector('.product__photo img, .product-single__photos img, .product-image-main img')?.src;

    if (!productId) return;

    const button = createButton({ productId, variantId, productTitle, productPrice, productImage });
    target.appendChild(button);

    // set initial state
    findExistingItem(productId, variantId).then((item) => {
      if (item) button.classList.add('is-active');
    });
  }

  function init() {
    const cfg = getConfig();
    if (!cfg.backendUrl || !cfg.shopDomain) {
      console.warn('Moonbox: configure data-backend-url e data-shop-domain no script.');
      return;
    }
    createStyles();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addButton);
    else addButton();

    const observer = new MutationObserver(() => {
      if (!document.querySelector('.moonbox-wishlist-btn')) addButton();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  init();
})();
