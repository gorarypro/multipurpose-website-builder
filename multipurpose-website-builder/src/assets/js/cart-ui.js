/*************************************************
 * FUSION ENGINE v12.0.0 - cart-ui.js
 * Specialized UI Renderer for Shopping Cart
 *************************************************/

window.FusionCartUI = (function () {

  /**
   * Main Render Function
   * Targets #cartContent defined in cart.html
   */
  function render() {
    const container = document.getElementById('cartContent');
    const totalEl = document.getElementById('cartTotal');
    const emptyMsg = document.getElementById('cartEmpty');
    
    if (!container) return;

    const cart = window.FusionCart ? FusionCart.load() : [];
    container.innerHTML = '';

    if (cart.length === 0) {
      if (emptyMsg) emptyMsg.classList.remove('d-none');
      if (totalEl) totalEl.textContent = window.FusionCurrency ? FusionCurrency.format(0) : "0";
      return;
    }

    if (emptyMsg) emptyMsg.classList.add('d-none');

    cart.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'd-flex align-items-center gap-3 p-3 border-bottom';

      // Safe price formatting
      const formattedPrice = window.FusionCurrency ? FusionCurrency.format(item.price) : item.price;

      row.innerHTML = `
        <img src="${item.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" />
        <div class="flex-grow-1">
          <div class="fw-bold small text-truncate" style="max-width: 180px;">${item.title}</div>
          <div class="text-muted" style="font-size: 11px;">
            ${Object.entries(item.variants || {})
              .map(([k,v]) => `<span class="badge bg-light text-dark border me-1">${k}: ${v}</span>`)
              .join('')}
          </div>
          <div class="small mt-1">${item.qty} × ${formattedPrice}</div>
        </div>
        <button class="btn btn-sm btn-outline-danger border-0" data-remove-index="${i}">
          <i class="bi bi-trash"></i>
        </button>
      `;

      row.querySelector('[data-remove-index]').onclick = () => {
        FusionCart.remove(i);
        render(); // Recursive re-render
      };

      container.appendChild(row);
    });

    // Update Total
    if (totalEl && window.FusionCart && window.FusionCurrency) {
      totalEl.textContent = FusionCurrency.format(FusionCart.total());
    }
  }

  return {
    render: render
  };

})();

// Sync with Cart Events
window.addEventListener('fusion:cart_updated', () => {
  if (window.FusionCartUI) FusionCartUI.render();
  
  // Update Global Navbar Count
  const countEl = document.getElementById('cartCount');
  if (countEl && window.FusionCart) {
    countEl.textContent = FusionCart.load().length;
  }
});
