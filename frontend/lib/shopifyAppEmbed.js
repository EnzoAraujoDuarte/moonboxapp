// Exemplo simples de como gerar um script de embed que monta o WishlistButton
// No tema, o lojista pode incluir um <div id="moonbox-wishlist"></div>
// e carregar o bundle exportado desta função.

export function mountWishlistButton({ targetId = 'moonbox-wishlist', productId, variantId, shopDomain, backendUrl }) {
  const root = document.getElementById(targetId);
  if (!root) return;
  import('../src/components/WishlistButton').then(({ default: WishlistButton }) => {
    const React = require('react');
    const ReactDOM = require('react-dom');
    process.env.NEXT_PUBLIC_BACKEND_URL = backendUrl;
    ReactDOM.render(
      React.createElement(WishlistButton, { productId, variantId, shopDomain }),
      root,
    );
  });
}


