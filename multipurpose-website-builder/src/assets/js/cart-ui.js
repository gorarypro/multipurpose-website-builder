/*************************************************
 * CART UI
 *************************************************/

function renderCart(container) {
  const cart = FusionCart.load();
  container.innerHTML = '';

  cart.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'cart-row';

    row.innerHTML = `
      <img src="${item.image}" />
      <div>
        <strong>${item.title}</strong>
        <div>${Object.entries(item.variants)
          .map(([k,v]) => `${k}: ${v}`)
          .join(', ')}</div>
      </div>
      <div>${item.qty} × ${item.price}</div>
      <button data-i="${i}">✕</button>
    `;

    row.querySelector('button').onclick = () => {
      FusionCart.remove(i);
      renderCart(container);
    };

    container.appendChild(row);
  });
}
