/**
 * FUSION v10.8.1 - products.js
 * --------------------------------
 * Product Catalog Engine
 * Role:
 * - Reads pre-rendered SSR product cards
 * - Builds product catalog cache
 * - Binds UI actions (cart, wishlist, quickview)
 * - Delegates variant parsing
 */

(function () {

  const ProductsModule = {
    catalog: [],
    grid: null,

    /**
     * Initialize system
     */
    init(settings) {
      console.log("Products: Initializing catalog...");
      this.grid = document.getElementById('productGrid');

      if (!this.grid) {
        console.warn("Products: #productGrid not found");
        return;
      }

      this.parseSSR();
      this.bindActions();
    },

    /**
     * Read SSR HTML and build product cache
     */
    parseSSR() {
      const cards = this.grid.querySelectorAll('[data-id]');
      this.catalog = [];

      cards.forEach(card => {
        const id = card.dataset.id;
        if (!id) return;

        const title = card.querySelector('[data-title]')?.textContent?.trim() || '';
        const price = parseFloat(card.dataset.price || 0);
        const image = card.querySelector('img')?.src || '';
        const content = card.querySelector('[data-content]')?.innerHTML || '';

        // Parse variants
        const variants = window.VariantsModule
          ? VariantsModule.parse(content)
          : null;

        this.catalog.push({
          id,
          title,
          price,
          image,
          content,
          variants
        });
      });

      console.log(`Products: ${this.catalog.length} products loaded`);
    },

    /**
     * Bind UI interactions
     */
    bindActions() {
      this.grid.addEventListener('click', (e) => {

        const card = e.target.closest('[data-id]');
        if (!card) return;

        const productId = card.dataset.id;
        const product = this.catalog.find(p => String(p.id) === String(productId));
        if (!product) return;

        /* ADD TO CART */
        if (e.target.closest('.add-to-cart-btn')) {
          if (!window.CartModule) return;

          const variants = window.VariantsModule
            ? VariantsModule.getSelection(productId)
            : {};

          CartModule.add(
            product.id,
            product.title,
            product.price,
            variants
          );
        }

        /* WISHLIST */
        if (e.target.closest('.btn-wishlist, .wishlist-toggle')) {
          if (!window.WishlistModule) return;
          WishlistModule.toggle(productId);
        }

        /* QUICK VIEW */
        if (e.target.closest('.quick-view-btn')) {
          if (!window.QuickViewModule) return;
          QuickViewModule.open(productId);
        }

      });
    },

    /**
     * Public getter
     */
    getById(id) {
      return this.catalog.find(p => String(p.id) === String(id));
    }
  };

  // Expose globally
  window.ProductsModule = ProductsModule;

  /**
   * Runtime boot hook
   */
  document.addEventListener('runtime_ready', function (e) {
    ProductsModule.init(e.detail);
  });

})();
