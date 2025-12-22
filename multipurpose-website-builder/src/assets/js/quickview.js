/**
 * FUSION v10.8.0 - quickview.js
 * Modal Detail Engine & UI Recovery Logic
 * Role: Renders product details and handles modal state lifecycle.
 */

const QuickView = {
  settings: {},
  currentProduct: null,
  modalInstance: null,

  /**
   * Initialize the detail engine and bind global grid listeners.
   */
  init: function(syncedSettings) {
    console.log("QuickView: Initializing UI Detail Engine...");
    this.settings = syncedSettings || window.FUSION_CONFIG.settings;

    const modalEl = document.getElementById('quickViewModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      this.modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl, {
        backdrop: true,
        keyboard: true
      });
    }

    this.bindGridEvents();
    this.bindActionButtons();
  },

  /**
   * Delegated event listener for the product grid.
   * This handles clicks on any product card, even those loaded via AJAX.
   */
  bindGridEvents: function() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    grid.addEventListener('click', (e) => {
      // 1. Ignore clicks if the user specifically clicked a "Direct Add" button
      const isActionBtn = e.target.closest('button, .btn-primary, .btn-cart');
      if (isActionBtn) return;

      // 2. Locate the product card container
      const card = e.target.closest('.product-card, [data-id]');
      if (!card) return;

      const productId = card.getAttribute('data-id');
      if (productId) {
        e.preventDefault();
        this.show(productId);
      }
    });
  },

  /**
   * Fetches product from catalog and triggers the modal display.
   */
  show: function(productId) {
    if (!window.ProductsModule) {
      console.error("QuickView Error: ProductsModule not detected.");
      return;
    }

    // Access the shared catalog cache established in products.js
    const product = window.ProductsModule.catalog.find(p => p.id === productId);
    
    if (!product) {
      console.warn(`QuickView: Product ID ${productId} not found in cache.`);
      return;
    }

    this.currentProduct = product;
    this.renderModal(product);

    if (this.modalInstance) {
      this.modalInstance.show();
    }
  },

  /**
   * Maps product data to the Modal DOM elements.
   */
  renderModal: function(p) {
    const titleEl = document.getElementById('quickViewTitle');
    const imageEl = document.getElementById('quickViewImage');
    const priceEl = document.getElementById('quickViewPrice');
    const descEl = document.getElementById('quickViewDescription');
    const currency = this.settings.currency_symbol || 'DH';

    if (titleEl) titleEl.textContent = p.title;
    if (priceEl) priceEl.textContent = `${p.price} ${currency}`;
    
    // Renders the full HTML content from Blogger
    if (descEl) descEl.innerHTML = p.content;

    if (imageEl) {
      imageEl.src = p.image || 'https://placehold.co/600x400';
      imageEl.style.display = p.image ? "block" : "none";
    }
  },

  /**
   * Binds internal modal actions like the "Add to Cart" button.
   */
  bindActionButtons: function() {
    const addBtn = document.getElementById('quickViewAddToCartBtn');
    
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        if (!this.currentProduct) return;

        // Interface with the global CartModule
        if (window.CartModule) {
          window.CartModule.add(
            this.currentProduct.id, 
            this.currentProduct.title.replace(/'/g, "\\'"), 
            this.currentProduct.price
          );
        }

        this.closeWithCleanup();
      });
    }
  },

  /**
   * Robust Modal Closing: Ensures the UI doesn't freeze or stay dimmed.
   */
  closeWithCleanup: function() {
    const modalEl = document.getElementById('quickViewModal');
    if (!modalEl) return;

    try {
      // 1. Standard Bootstrap Hide
      if (this.modalInstance) {
        this.modalInstance.hide();
      }
    } catch (err) {
      // 2. Emergency Recovery Logic
      console.warn("QuickView: Bootstrap hide failed. Running manual cleanup.");
      
      modalEl.classList.remove('show');
      modalEl.style.display = 'none';
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      // Force-remove stale backdrops
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    }
  }
};
