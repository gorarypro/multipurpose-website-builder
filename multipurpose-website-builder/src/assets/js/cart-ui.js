/*************************************************
 * FUSION ENGINE v12.0.0 - cart-ui.js
 * Specialized UI Handler for Shopping Cart
 *************************************************/

window.FusionCartUI = (function () {

  /**
   * Main Render Function
   * Targets #cartContent defined in ThemeTemplate.html
   */
  function render() {
    const container = document.getElementById('cartContent');
    const totalEl = document.getElementById('cartTotal');
    const emptyMsg = document.getElementById('cartEmpty');
    const checkoutFields = document.getElementById('checkoutFields');
    
    if (!container) return;

    const cart = window.FusionCart ? FusionCart.load() : [];
    container.innerHTML = '';

    if (cart.length === 0) {
      if (emptyMsg) emptyMsg.classList.remove('d-none');
      if (totalEl) totalEl.textContent = window.FusionCurrency ? FusionCurrency.format(0) : "0";
      if (checkoutFields) checkoutFields.style.display = 'none';
      return;
    }

    if (emptyMsg) emptyMsg.classList.add('d-none');

    cart.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'd-flex align-items-center gap-3 p-3 border-bottom';

      const formattedPrice = window.FusionCurrency ? FusionCurrency.format(item.price) : item.price;

      row.innerHTML = `
        <img src="${item.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;" />
        <div class="flex-grow-1">
          <div class="fw-bold small text-truncate" style="max-width: 150px;">${item.title}</div>
          <div class="text-muted" style="font-size: 11px;">
            ${Object.entries(item.variants || {})
              .map(([k,v]) => `<span class="badge bg-light text-dark border me-1">${k}: ${v}</span>`)
              .join('')}
          </div>
          <div class="small mt-1">${item.qty} × ${formattedPrice}</div>
        </div>
        <button class="btn btn-sm btn-outline-danger border-0" data-remove="${i}">
          <i class="bi bi-trash"></i>
        </button>
      `;

      row.querySelector('[data-remove]').onclick = () => {
        FusionCart.remove(i);
      };

      container.appendChild(row);
    });

    if (totalEl && window.FusionCurrency) {
      totalEl.textContent = FusionCurrency.format(FusionCart.total());
    }
  }

  /**
   * Setup UI Interaction for the Checkout Button
   */
  function init() {
    const btn = document.getElementById('checkoutButton');
    const fields = document.getElementById('checkoutFields');
    if (!btn || !fields) return;

    btn.onclick = async () => {
      // Step 1: If fields are hidden, show them
      if (fields.style.display === 'none') {
        fields.style.display = 'block';
        btn.innerHTML = '<span>Place Order</span>';
        return;
      }

      // Step 2: Validate and Submit
      const name = document.getElementById('checkoutName').value;
      const phone = document.getElementById('checkoutPhone').value;
      
      if (!name || !phone) {
        alert("Name and Phone are required for delivery.");
        return;
      }

      const details = {
        name,
        phone,
        email: document.getElementById('checkoutEmail').value,
        address: document.getElementById('checkoutMessage').value
      };

      btn.disabled = true;
      btn.textContent = "Processing...";

      try {
        await FusionCart.checkout(details);
        // On success
        fields.style.display = 'none';
        const modal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
        if (modal) modal.hide();
        alert("Success! Your order has been placed.");
      } catch (err) {
        alert("Error: " + err.message);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span data-i18n="CHECKOUT">Checkout</span>';
        if (window.FusionI18n) FusionI18n.translateAll();
      }
    };
  }

  return { render, init };
})();

// Initialize wiring when DOM is ready
document.addEventListener('DOMContentLoaded', () => FusionCartUI.init());
// Re-render UI on cart events
window.addEventListener('fusion:cart_updated', () => FusionCartUI.render());
