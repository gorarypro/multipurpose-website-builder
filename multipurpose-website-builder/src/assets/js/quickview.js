/**
 * FUSION v10.8.0 - quickview.js
 * --------------------------------
 * Bootstrap-based Quick View Engine
 * Role:
 * - Opens product details in a Bootstrap modal
 * - Injects variants
 * - Connects to CartModule & CurrencyModule
 */

(function () {

  const QuickView = {
    modal: null,
    currentProduct: null,

    /**
     * Initialize QuickView system
     */
    init() {
      const modalEl = document.getElementById('quickViewModal');
      if (!modalEl || !window.bootstrap) return;

      this.modal = new bootstrap.Modal(modalEl);

      // Attach event listeners to product cards
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-quickview]');
        if (!btn) return;

        e.preventDefault();
        const productId = btn.getAttribute('data-quickview');
        this.open(productId);
      });

      console.log('QuickView: Initialized');
    },

    /**
     * Open QuickView for a product
     */
    open(productId) {
      if (!window.ProductsModule || !ProductsModule.catalog) {
        console.warn('QuickView: Products not ready');
        return;
      }

      const product = ProductsModule.catalog.find(p => String(p.id) === String(productId));
      if (!product) return;

      this.currentProduct = product;

      // Populate modal
      this.setText('quickViewTitle', product.title);
      this.setImage('quickViewImage', product.image);
      this.setText('quickViewDescription', product.description || '');

      const priceEl = document.getElementById('quickViewPrice');
      if (priceEl && window.CurrencyModule) {
        priceEl.textContent = CurrencyModule.format(product.price);
      }

      // Variants
      this.renderVariants(product);

      // Cart button
      const btn = document.getElementById('quickViewAddToCartBtn');
      if (btn) {
        btn.onclick = () => {
          if (!window.CartModule) return;

          const variants = window.VariantsModule
            ? VariantsModule.getSelection(product.id)
            : {};

          CartModule.add(
            product.id,
            product.title,
            product.price,
            variants
          );

          this.modal.hide();
        };
      }

      this.modal.show();
    },

    /**
     * Render variants inside modal
     */
    renderVariants(product) {
      const container = document.getElementById('quickViewVariants');
      if (!container) return;

      container.innerHTML = '';

      if (!window.VariantsModule) return;

      const variantMap = VariantsModule.parse(product.raw || product.description);
      if (!variantMap) return;

      VariantsModule.renderSelector(
        product.id,
        'quickViewVariants',
        variantMap
      );
    },

    /**
     * Helpers
     */
    setText(id, text) {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    },

    setImage(id, src) {
      const el = document.getElementById(id);
      if (el) el.src = src;
    }
  };

  /**
   * Runtime hook
   */
  document.addEventListener('runtime_ready', function () {
    QuickView.init();
  });

  // Safety fallback
  if (document.readyState === 'complete') {
    setTimeout(() => QuickView.init(), 1000);
  }

})();
  // Expose globally
  window.QuickViewModule = QuickViewModule;
