/**
 * FUSION ENGINE v13.1.0 - quickview.js
 * Bootstrap-based Modal Orchestration
 * -----------------------------------------------------
 * Responsibilities:
 * - Handling global click listeners for [data-quickview]
 * - Populating the QuickView modal from memory (FusionCatalog)
 * - Integrating with Variants and Cart modules
 */

window.FusionQuickView = (function () {

  const state = {
    modal: null,
    activeProduct: null,
    activeVariants: {}
  };

  /**
   * Initialization called by FusionRuntime
   */
  function init() {
    const modalEl = document.getElementById('quickViewModal');
    if (!modalEl || !window.bootstrap) {
      console.warn("FusionQuickView: Bootstrap or Modal container missing.");
      return;
    }

    state.modal = new bootstrap.Modal(modalEl);

    // Global Event Delegation for Product Cards
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-quickview]');
      if (!btn) return;

      e.preventDefault();
      const productId = btn.getAttribute('data-quickview');
      open(productId);
    });
  }

  /**
   * Opens the modal and populates data from the Catalog
   */
  function open(productId) {
    // Look up product in memory (populated by products.js)
    const product = (window.FusionCatalog || []).find(p => String(p.id) === String(productId));
    
    if (!product) {
      console.error(`FusionQuickView: Product ID ${productId} not found in Catalog.`);
      return;
    }

    state.activeProduct = product;

    // 1. Populate Basic Info
    dom('quickViewTitle', product.title);
    dom('quickViewImage', product.image, 'src');
    dom('quickViewDescription', product.description);

    // 2. Handle Localized Pricing
    const priceEl = document.getElementById('quickViewPrice');
    if (priceEl) {
      priceEl.textContent = window.FusionCurrency 
        ? FusionCurrency.format(product.price) 
        : product.price;
    }

    // 3. Render Variants and Capture Reference
    const variantContainer = document.getElementById('quickViewVariants');
    if (variantContainer && window.FusionVariants) {
      state.activeVariants = FusionVariants.createSelectors(product.variants, variantContainer);
    }

    // 4. Bind Cart Logic
    const cartBtn = document.getElementById('quickViewAddToCartBtn');
    if (cartBtn) {
      cartBtn.onclick = () => {
        if (window.FusionCart) {
          FusionCart.add(product, state.activeVariants);
          state.modal.hide();
        }
      };
    }

    state.modal.show();
  }

  /**
   * Internal DOM Helper
   */
  function dom(id, value, attr = 'textContent') {
    const el = document.getElementById(id);
    if (!el) return;
    if (attr === 'textContent') el.textContent = value;
    else el.setAttribute(attr, value);
  }

  return { init, open };

})();
